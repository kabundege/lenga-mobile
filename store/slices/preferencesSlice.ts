import { createSlice } from '@reduxjs/toolkit';

/** Strapi + UI content locale; app is Kinyarwanda-only. */
export type Locale = 'rw';

export type PreferencesState = {
  locale: Locale;
};

const initialState: PreferencesState = {
  locale: 'rw',
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {},
});

export const preferencesReducer = preferencesSlice.reducer;
