import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Locale = 'en' | 'fr' | 'rw';

type PreferencesState = {
  locale: Locale;
};

const initialState: PreferencesState = {
  locale: 'rw',
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
