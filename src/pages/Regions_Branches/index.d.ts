import React from 'react';
export interface WorkingHour {
    days: string;
    time: string;
}
export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface RegionBranch {
    id: number;
    name: string;
    address: string;
    location_link: string;
    region_id: number;
    coordinates: Coordinates;
    working_hours: WorkingHour[];
}
declare const RegionsBranchesPage: React.FC;
export default RegionsBranchesPage;
