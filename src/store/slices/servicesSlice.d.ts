interface Service {
    _id: string;
    id: number;
    name: string;
    description: string;
    image?: string;
    doctors_ids: string[];
    branches: string[];
}
interface ServicesState {
    services: Service[];
    loading: boolean;
    error: string | null;
}
export declare const fetchServices: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"services/clearError">;
declare const _default: import("redux").Reducer<ServicesState>;
export default _default;
export type { ServicesState };
