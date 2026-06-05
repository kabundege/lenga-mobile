import type { StrapiUser } from '@/types/api';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
  jwt: string | null;
  user: StrapiUser | null;
  /** Name entered at registration, applied when creating extended-profile. */
  pendingFullName: string | null;
};

const initialState: AuthState = {
  jwt: null,
  user: null,
  pendingFullName: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ jwt: string; user: StrapiUser; fullName?: string | null }>
    ) => {
      state.jwt = action.payload.jwt;
      state.user = action.payload.user;
      if (action.payload.fullName !== undefined) {
        state.pendingFullName = action.payload.fullName?.trim() || null;
      }
    },
    setPendingFullName: (state, action: PayloadAction<string | null>) => {
      state.pendingFullName = action.payload?.trim() || null;
    },
    clearPendingFullName: (state) => {
      state.pendingFullName = null;
    },
    setUser: (state, action: PayloadAction<StrapiUser>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.jwt = null;
      state.user = null;
      state.pendingFullName = null;
    },
  },
});

export const { setCredentials, setUser, setPendingFullName, clearPendingFullName, logout } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
