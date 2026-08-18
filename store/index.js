import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { appApi } from './api/appApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware),
});
