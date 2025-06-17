interface Doctor {
    _id: string;
    id: number;
    name: string;
    specialty: string;
    bio: string;
    department: string;
    branches: string[];
    imageUrl?: string;
}
interface DoctorsState {
    doctors: Doctor[];
    loading: boolean;
    error: string | null;
}
export declare const fetchDoctors: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"doctors/clearError">;
declare const _default: import("redux").Reducer<DoctorsState>;
export default _default;
export type { DoctorsState };
