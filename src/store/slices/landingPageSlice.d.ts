interface LandingPageContent {
    landingScreen: {
        title: string;
        subtitle: string;
        description: string;
        image: string | File;
    };
    services: Array<{
        id?: string;
        name: string;
        description: string;
        branches: string[];
    }>;
    offers: Array<{
        id?: string;
        offer: string;
        price: string;
        description?: string;
        image: string | File;
        branches: string[];
    }>;
    doctors: Array<{
        id?: string;
        name: string;
        specialization: string;
        image: string | File;
        branches: string[];
    }>;
}
interface LandingPage {
    id: string;
    creator: string;
    title: string;
    createdAt: string;
    platforms: {
        facebook: boolean;
        instagram: boolean;
        x: boolean;
        tiktok: boolean;
        google: boolean;
        snapchat: boolean;
    };
    showSections: {
        landingScreen: boolean;
        services: boolean;
        offers: boolean;
        doctors: boolean;
    };
    content: LandingPageContent;
    activated: boolean;
}
interface LandingPageState {
    landingPages: LandingPage[];
    currentLandingPage: LandingPage | null;
    loading: boolean;
    error: string | null;
    existingItems: {
        doctors: any[];
        services: any[];
        offers: any[];
    };
}
export declare const fetchLandingPages: import("@reduxjs/toolkit").AsyncThunk<any, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchLandingPageById: import("@reduxjs/toolkit").AsyncThunk<any, string, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateLandingPage: import("@reduxjs/toolkit").AsyncThunk<any, {
    id: string;
    data: any;
}, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteLandingPage: import("@reduxjs/toolkit").AsyncThunk<string, string, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchExistingItems: import("@reduxjs/toolkit").AsyncThunk<{
    doctors: any;
    services: any;
    offers: any;
}, void, {
    state?: unknown;
    dispatch?: import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"landingPages/clearError">, setCurrentLandingPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<LandingPage | null, "landingPages/setCurrentLandingPage">, updateCurrentLandingPageContent: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<LandingPageContent>, "landingPages/updateCurrentLandingPageContent">, updateCurrentLandingPageSettings: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<Omit<LandingPage, "content">>, "landingPages/updateCurrentLandingPageSettings">;
declare const _default: import("redux").Reducer<LandingPageState>;
export default _default;
export type { LandingPageState };
