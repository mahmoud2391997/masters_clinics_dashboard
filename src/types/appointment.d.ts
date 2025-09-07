export interface CallLog {
    id?: string;
    timestamp_str: string;
    status: string;
    notes?: string;
    agentName?: string;
    editedBy?: string;
    timestamp?: string;
}
export interface Appointment {
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
    pageCreator?: string;
    pageTitle?: string;
    [key: string]: any;
}
export interface FormField {
    key: string;
    label?: string;
}
export type UserRole = "customercare" | "mediabuyer" | "admin";
export interface DataTableProps {
    formFields?: FormField[];
    data?: Appointment[];
    onDelete?: (id: string) => void;
    onView?: (row: Appointment) => void;
    userRole: UserRole;
}
