import React from "react";
import "leaflet/dist/leaflet.css";
interface MapProps {
    coordinates: {
        lat: number;
        lng: number;
    } | null;
    onLocationChange?: (lat: string, lng: string) => void;
}
declare const MapComponent: React.FC<MapProps>;
export default MapComponent;
