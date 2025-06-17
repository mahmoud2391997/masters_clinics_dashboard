import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import landingPageSlice from './slices/landingPageSlice';
import branchesSlice from './slices/branchesSlice';
import servicesSlice from './slices/servicesSlice';
import doctorsSlice from './slices/doctorsSlice';
import offersSlice from './slices/offersSlice';
import departmentsSlice from './slices/departmentsSlice';
import appointmentsSlice from './slices/appointmentsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authSlice,
  landingPages: landingPageSlice,
  branches: branchesSlice,
  services: servicesSlice,
  doctors: doctorsSlice,
  offers: offersSlice,
  departments: departmentsSlice,
  appointments: appointmentsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
