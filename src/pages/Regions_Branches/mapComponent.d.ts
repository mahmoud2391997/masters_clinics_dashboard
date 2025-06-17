import React from "react";
import "leaflet/dist/leaflet.css";
type MapProps = {
    coordinates: {
        lat: number;
        lng: number;
    } | null;
};
declare const MapComponent: React.FC<MapProps>;
export default MapComponent;
