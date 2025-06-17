export declare const store: import("@reduxjs/toolkit").EnhancedStore<{
    auth: import("./slices/authSlice").AuthState;
    landingPages: import("./slices/landingPageSlice").LandingPageState;
    branches: import("./slices/branchesSlice").BranchesState;
    services: import("./slices/servicesSlice").ServicesState;
    doctors: import("./slices/doctorsSlice").DoctorsState;
    offers: import("./slices/offersSlice").OffersState;
    departments: import("./slices/departmentsSlice").DepartmentsState;
    appointments: import("./slices/appointmentsSlice").AppointmentsState;
} & import("redux-persist/es/persistReducer").PersistPartial, import("redux").UnknownAction, import("@reduxjs/toolkit").Tuple<[import("redux").StoreEnhancer<{
    dispatch: import("redux-thunk").ThunkDispatch<{
        auth: import("./slices/authSlice").AuthState;
        landingPages: import("./slices/landingPageSlice").LandingPageState;
        branches: import("./slices/branchesSlice").BranchesState;
        services: import("./slices/servicesSlice").ServicesState;
        doctors: import("./slices/doctorsSlice").DoctorsState;
        offers: import("./slices/offersSlice").OffersState;
        departments: import("./slices/departmentsSlice").DepartmentsState;
        appointments: import("./slices/appointmentsSlice").AppointmentsState;
    } & import("redux-persist/es/persistReducer").PersistPartial, undefined, import("redux").UnknownAction>;
}>, import("redux").StoreEnhancer]>>;
export declare const persistor: import("redux-persist").Persistor;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
