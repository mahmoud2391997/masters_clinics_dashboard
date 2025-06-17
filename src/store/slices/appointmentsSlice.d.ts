interface CallLog {
    id: string;
    timestamp: string;
    status: string;
    notes?: string;
    agentName?: string;
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
}
interface AppointmentsState {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
}
export declare const fetchAppointments: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"appointments/clearError">;
declare const _default: import("redux").Reducer<AppointmentsState>;
export default _default;
export type { AppointmentsState };
