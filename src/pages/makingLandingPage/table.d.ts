import React from 'react';
interface FormField {
    name: string;
    label?: string;
}
interface Contract {
    id: string | number;
    createdAt: string;
    creator?: string;
    pageTitle?: string;
    platforms?: Record<string, boolean>;
    links?: Record<string, string>;
    region_id?: number;
    [key: string]: any;
}
interface DataTableProps {
    formFields?: FormField[];
    data?: Contract[];
    loading?: boolean;
    onDelete?: (id: string | number) => void;
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
}
declare const DataTable: React.FC<DataTableProps>;
export default DataTable;
