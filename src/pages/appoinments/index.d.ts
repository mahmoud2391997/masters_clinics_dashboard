import React from "react";
interface CallLog {
    id: string;
    appointmentId: string;
    timestamp: string;
    status: string;
    notes?: string | null;
    support_member_name?: string | null;
    mediabuyer_name?: string | null;
    admin_notes?: string | null;
    mediabuyer_notes?: string | null;
    timezone?: string;
    created_by_role?: "customercare" | "mediabuyer" | "admin";
    editedBy?: string;
}
interface FormField {
    key: string;
    label?: string;
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
    device?: string;
    type?: string;
    is_authed: number;
    payment_status: string;
    status: string;
    callLogs?: CallLog[];
    pageCreator?: string;
    pageTitle?: string;
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
