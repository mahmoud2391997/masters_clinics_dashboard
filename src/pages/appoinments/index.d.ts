import type React from "react";
interface FormField {
    key: string;
    label?: string;
}
interface CallLog {
    id?: string;
    timestamp: string;
    status: string;
    notes?: string;
    agentName?: string;
    editedBy?: string;
}
interface Appointment {
    id: string;
    _id?: string;
    name: string;
    phone: string;
    branch: string;
    createdAt: string;
    scheduledAt?: string | null;
    landingPageId: string;
    utmSource?: string;
    doctor?: string;
    offer?: string;
    is_authed: number;
    payment_status: string;
    status: string;
    callLogs?: CallLog[];
    [key: string]: any;
}
interface DataTableProps {
    formFields?: FormField[];
    data?: Appointment[];
    onDelete?: (id: string) => void;
    onView?: (row: Appointment) => void;
    userRole: "customercare" | "mediabuyer" | "admin";
}
declare const DataTable: React.FC<Partial<DataTableProps>>;
export default DataTable;
