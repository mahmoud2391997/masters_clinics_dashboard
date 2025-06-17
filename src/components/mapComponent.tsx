"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  coordinates: { lat: number; lng: number } | null;
  locationLink?: string;
  disabled?: boolean;
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
};

const DEFAULT_COORDINATES = { lat: 30.0444, lng: 31.2357 };

const MapComponent: React.FC<MapProps> = ({ 
  coordinates, 
  locationLink, 
  disabled = false,
  onCoordinatesChange 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced URL pattern matching
  const extractCoordsFromUrl = (url: string) => {
    if (!url) return null;

    // Try multiple patterns in sequence
    const patterns = [
      // Standard Google Maps patterns
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,                       // @lat,lng
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,                   // !3dlat!4dlng
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,                   // ?q=lat,lng
      /maps\/(?:place|dir)\/.+\/@(-?\d+\.\d+),(-?\d+\.\d+)/, // maps/place/.../@lat,lng
      
      // Apple Maps patterns
      /&ll=(-?\d+\.\d+),(-?\d+\.\d+)/,                     // &ll=lat,lng
      
      // Alternative patterns
      /center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/,                // center=lat%2Clng
      /loc:(-?\d+\.\d+),(-?\d+\.\d+)/,                     // loc:lat,lng
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }

    return null;
  };

  // Initialize the map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialCoords = coordinates || DEFAULT_COORDINATES;
      
      mapRef.current = L.map(mapContainerRef.current).setView(
        [initialCoords.lat, initialCoords.lng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      if (coordinates) {
        addMarker(coordinates.lat, coordinates.lng);
      }

      if (!disabled) {
        mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          addMarker(lat, lng);
          onCoordinatesChange?.({ lat, lng });
        });
      }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Handle location link changes
  useEffect(() => {
    if (!locationLink) return;

    const handleLocationLink = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to extract directly from URL
        const coords = extractCoordsFromUrl(locationLink);
        if (coords) {
          updateMap(coords.lat, coords.lng);
          return;
        }

        // If no direct match, try to handle as a short URL
        const finalUrl = await resolveShortUrl(locationLink);
        const finalCoords = extractCoordsFromUrl(finalUrl);
        
        if (finalCoords) {
          updateMap(finalCoords.lat, finalCoords.lng);
        } else {
          setError("Could not extract coordinates from the provided link");
        }
      } catch (err) {
        console.error("Error processing location link:", err);
        setError("Failed to process the location link. Please try a different URL format.");
      } finally {
        setIsLoading(false);
      }
    };

    handleLocationLink();
  }, [locationLink]);

  // Client-side short URL resolution without CORS
  const resolveShortUrl = async (url: string): Promise<string> => {
    // For goo.gl/maps or maps.app.goo.gl links
    if (url.includes('goo.gl/maps') || url.includes('maps.app.goo.gl')) {
      // Try to predict the expanded URL pattern
      const mapId = url.split('/').pop();
      return `https://www.google.com/maps/place/@?q=place_id:${mapId}`;
    }
    
    // For other short URLs, return as-is (we can't resolve without backend)
    return url;
  };

  const updateMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    mapRef.current.setView([lat, lng], 15);
    addMarker(lat, lng);
  };

  const addMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        draggable: !disabled
      }).addTo(mapRef.current);

      if (!disabled) {
        markerRef.current.on('dragend', () => {
          const newLatLng = markerRef.current?.getLatLng();
          if (newLatLng) {
            onCoordinatesChange?.({ lat: newLatLng.lat, lng: newLatLng.lng });
          }
        });
      }
    }

    markerRef.current.bindPopup(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded shadow-lg">
            Loading location from link...
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          {error}
          <div className="mt-2 text-sm">
            Try using these URL formats:
            <ul className="list-disc pl-5">
              <li>https://www.google.com/maps/@30.0444,31.2357,15z</li>
              <li>https://www.google.com/maps/place/Cairo/@30.0444,31.2357,15z</li>
              <li>https://www.google.com/maps?q=30.0444,31.2357</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;