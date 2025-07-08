import React from "react";
interface Branch {
    id: number;
    name: string;
}
interface DepartmentStat {
    id: number;
    name: string;
    description: string;
    image?: string;
    branch_ids?: number[] | string;
}
interface Props {
    department: DepartmentStat;
    branches: Branch[];
    onUpdateSuccess: () => void;
    onDeleteSuccess: () => void;
}
declare const CardStats: React.FC<Props>;
export default CardStats;
