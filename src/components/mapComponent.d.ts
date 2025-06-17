import React from "react";
import "leaflet/dist/leaflet.css";
type MapProps = {
    coordinates: {
        lat: number;
        lng: number;
    } | null;
    locationLink?: string;
    disabled?: boolean;
    onCoordinatesChange?: (coords: {
        lat: number;
        lng: number;
    }) => void;
};
declare const MapComponent: React.FC<MapProps>;
export default MapComponent;
