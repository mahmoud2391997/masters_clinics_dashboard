"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  coordinates: { lat: number; lng: number } | null;
};

const DEFAULT_COORDINATES = { lat: 30.0444, lng: 31.2357 };

const MapComponent: React.FC<MapProps> = ({ coordinates }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const coords = coordinates || DEFAULT_COORDINATES;

    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      markerRef.current = L.marker([coords.lat, coords.lng]).addTo(mapRef.current);
      markerRef.current.bindPopup(`Location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`).openPopup();
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // If coordinates prop changes
  useEffect(() => {
    const coords = coordinates || DEFAULT_COORDINATES;

    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 15);

      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      } else {
        markerRef.current = L.marker([coords.lat, coords.lng]).addTo(mapRef.current);
      }

      markerRef.current.bindPopup(`Location: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`).openPopup();
    }
  }, [coordinates]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
