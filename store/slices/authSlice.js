import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ID } from 'react-native-appwrite';
import { account } from '@/lib/appwrite/client';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const user = await account.get();
  return user;
});

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    try {
      await account.deleteSession({ sessionId: 'current' });
    } catch {
      // No active session — safe to continue.
    }
    await account.createEmailPasswordSession({ email, password });
    const user = await account.get();
    return user;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }) => {
    try {
      await account.deleteSession({ sessionId: 'current' });
    } catch {
      // No active session — safe to continue.
    }
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    await account.createEmailPasswordSession({ email, password });
    const user = await account.get();
    return user;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await account.deleteSession({ sessionId: 'current' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getErrorMessage(action.error);
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getErrorMessage(action.error);
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = getErrorMessage(action.error);
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
