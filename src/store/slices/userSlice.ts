import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserStart: (state: UserState) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess: (state: UserState, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchUserFailure: (state: UserState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserStart: (state: UserState) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state: UserState, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure: (state: UserState, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUser: (state: UserState) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer; 