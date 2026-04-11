import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../lib/api';
import type { User, RegisterData } from '../types';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { user: data.user as User, token: data.token as string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (formData: RegisterData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { user: data.user as User, token: data.token as string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// ─── State ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initAuth(state) {
      const token = localStorage.getItem('token');
      const raw   = localStorage.getItem('user');
      if (token && raw) {
        try {
          state.token = token;
          state.user  = JSON.parse(raw);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
    logout(state) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user    = null;
      state.token   = null;
      state.error   = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user      = action.payload.user;
        state.token     = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user      = action.payload.user;
        state.token     = action.payload.token;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });
  },
});

export const { initAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
