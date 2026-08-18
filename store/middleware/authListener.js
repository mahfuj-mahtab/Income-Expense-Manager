import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

import { appApi } from '../api/appApi';
import { login, logout, register } from '../slices/authSlice';

export const authListenerMiddleware = createListenerMiddleware();

function clearCachedUserData(dispatch) {
  dispatch(appApi.util.resetApiState());
}

authListenerMiddleware.startListening({
  matcher: isAnyOf(logout.pending),
  effect: (_action, listenerApi) => {
    clearCachedUserData(listenerApi.dispatch);
  },
});

authListenerMiddleware.startListening({
  matcher: isAnyOf(login.fulfilled, register.fulfilled),
  effect: (_action, listenerApi) => {
    clearCachedUserData(listenerApi.dispatch);
  },
});
