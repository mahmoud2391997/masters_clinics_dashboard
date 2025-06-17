export declare const updateDepartment: (_id: string, department: FormData) => Promise<any>;
export declare const deleteDepartment: (_id: string) => Promise<any>;
interface Department {
    _id: string;
    name: string;
    description: string;
    image?: string;
    imageUrl?: string;
}
interface CardStatsProps {
    department: Department;
    onDeleteSuccess?: () => void;
    onUpdateSuccess?: () => void;
}
export default function CardStats({ department, onUpdateSuccess, onDeleteSuccess }: CardStatsProps): import("react/jsx-runtime").JSX.Element;
export {};
