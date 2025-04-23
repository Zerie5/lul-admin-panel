import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state: AuthState) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state: AuthState, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    },
    refreshTokenStart: (state: AuthState) => {
      state.loading = true;
    },
    refreshTokenSuccess: (state: AuthState, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
    },
    refreshTokenFailure: (state: AuthState, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
} = authSlice.actions;

export default authSlice.reducer; 