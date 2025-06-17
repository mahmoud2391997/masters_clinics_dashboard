import React from 'react';
interface FormField {
    name: string;
    label?: string;
}
interface Contract {
    id: string | number;
    region_id?: number;
    [key: string]: any;
}
interface DataTableProps {
    formFields?: FormField[];
    data?: Contract[];
    onDelete?: (id: string | number) => void;
    onView?: (row: any) => void;
}
declare const DataTable: React.FC<DataTableProps>;
export default DataTable;
