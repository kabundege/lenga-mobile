import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { StrapiUser } from '@/types/api';
import { setAuthToken } from '@/utils/api';

type AuthState = {
  jwt: string | null;
  user: StrapiUser | null;
};

const initialState: AuthState = {
  jwt: null,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ jwt: string; user: StrapiUser }>
    ) => {
      state.jwt = action.payload.jwt;
      state.user = action.payload.user;
      setAuthToken(action.payload.jwt);
    },
    setUser: (state, action: PayloadAction<StrapiUser>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.jwt = null;
      state.user = null;
      setAuthToken(null);
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
