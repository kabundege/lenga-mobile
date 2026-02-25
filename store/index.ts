import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistConfig,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { authReducer, AuthState } from './slices/authSlice';
import { preferencesReducer, PreferencesState } from './slices/preferencesSlice';

const authPersistConfig: PersistConfig<AuthState> = {
  key: 'lenga:auth',
  storage: AsyncStorage,
};

const preferencesPersistConfig: PersistConfig<PreferencesState> = {
  key: 'lenga:preferences',
  storage: AsyncStorage,
};


const Reducers = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  preferences: persistReducer(preferencesPersistConfig, preferencesReducer),
});

export const store = configureStore({
  reducer: Reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
