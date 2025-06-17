interface Offer {
    id: string;
    title: string;
    description: string;
    image: string;
    priceBefore: string;
    priceAfter: string;
    discountPercentage: string;
    branches: string[];
    services_ids: string[];
    doctors_ids: string[];
}
interface OffersState {
    offers: Offer[];
    loading: boolean;
    error: string | null;
}
export declare const fetchOffers: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"offers/clearError">;
declare const _default: import("redux").Reducer<OffersState>;
export default _default;
export type { OffersState };
