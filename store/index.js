import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import { appApi } from './api/appApi';
import { authListenerMiddleware } from './middleware/authListener';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(appApi.middleware)
      .concat(authListenerMiddleware.middleware),
});
