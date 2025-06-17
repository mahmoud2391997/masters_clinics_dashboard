import React from 'react';
interface FormField {
    name: string;
    label?: string;
}
interface Contract {
    id: string | number;
    _id?: string | number;
    region_id?: number;
    [key: string]: any;
}
interface Region {
    id: string | number;
    name: string;
    [key: string]: any;
}
interface DataTableProps {
    formFields?: FormField[];
    data?: Contract[];
    regions?: Region[];
    onDelete?: (id: string | number) => void;
    onView?: (row: Contract) => void;
    onDataChange?: () => void;
}
declare const DataTable: React.FC<DataTableProps>;
export default DataTable;
