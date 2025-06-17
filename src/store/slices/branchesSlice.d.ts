interface Branch {
    id: string;
    name: string;
    address: string;
    location_link: string;
    working_hours?: Array<{
        days: string;
        time: string;
    }>;
    region: string;
    imageUrl?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}
interface BranchesState {
    branches: Branch[];
    loading: boolean;
    error: string | null;
}
export declare const fetchBranches: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"branches/clearError">;
declare const _default: import("redux").Reducer<BranchesState>;
export default _default;
export type { BranchesState };
