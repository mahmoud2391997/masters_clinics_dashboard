import React from 'react';
interface DataTableProps {
    formFields?: FormField[];
    data?: Appointment[];
    onDelete?: (id: string) => void;
    onView?: (row: Appointment) => void;
    userRole: 'customercare' | 'mediabuyer' | 'admin';
}
interface FormField {
    name: string;
    label?: string;
}
interface Appointment {
    id: string;
    _id?: string;
    name: string;
    phone: string;
    branch: string;
    createdAt: string;
    landingPageId: string;
    utmSource: string;
    doctor?: string;
    offer?: string;
    callLogs?: CallLog[];
    [key: string]: any;
}
interface CallLog {
    id: string;
    timestamp: string;
    status: string;
    notes?: string;
    agentName?: string;
}
declare const DataTable: React.FC<DataTableProps>;
export default DataTable;
