interface Department {
    _id: string;
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
}
interface DepartmentsState {
    departments: Department[];
    loading: boolean;
    error: string | null;
}
export declare const fetchDepartments: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"departments/clearError">;
declare const _default: import("redux").Reducer<DepartmentsState>;
export default _default;
export type { DepartmentsState };
