import { type TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '../store';
export declare const useAppDispatch: () => import("redux-thunk").ThunkDispatch<{
    auth: import("../store/slices/authSlice").AuthState;
    landingPages: import("../store/slices/landingPageSlice").LandingPageState;
    branches: import("../store/slices/branchesSlice").BranchesState;
    services: import("../store/slices/servicesSlice").ServicesState;
    doctors: import("../store/slices/doctorsSlice").DoctorsState;
    offers: import("../store/slices/offersSlice").OffersState;
    departments: import("../store/slices/departmentsSlice").DepartmentsState;
    appointments: import("../store/slices/appointmentsSlice").AppointmentsState;
} & import("redux-persist/es/persistReducer").PersistPartial, undefined, import("redux").UnknownAction> & import("redux").Dispatch<import("redux").UnknownAction>;
export declare const useAppSelector: TypedUseSelectorHook<RootState>;
