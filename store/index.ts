import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  createTransform,
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
import { offlineAssetsReducer, OfflineAssetsState } from './slices/offlineAssetsSlice';
import { offlineMediaReducer, OfflineMediaState } from './slices/offlineMediaSlice';
import { preferencesReducer, PreferencesState } from './slices/preferencesSlice';

const authPersistConfig: PersistConfig<AuthState> = {
  key: 'lenga:auth',
  storage: AsyncStorage,
};

const preferencesPersistConfig: PersistConfig<PreferencesState> = {
  key: 'lenga:preferences',
  storage: AsyncStorage,
  transforms: [
    createTransform(
      (state: PreferencesState) => ({ ...state, locale: 'rw' as const }),
      (state: PreferencesState) => ({ ...state, locale: 'rw' as const }),
    ),
  ],
};

const offlineMediaPersistConfig: PersistConfig<OfflineMediaState> = {
  key: 'lenga:offlineMedia',
  storage: AsyncStorage,
};

const offlineAssetsPersistConfig: PersistConfig<OfflineAssetsState> = {
  key: 'lenga:offlineAssets',
  storage: AsyncStorage,
};

const Reducers = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  preferences: persistReducer(preferencesPersistConfig, preferencesReducer),
  offlineMedia: persistReducer(offlineMediaPersistConfig, offlineMediaReducer),
  offlineAssets: persistReducer(offlineAssetsPersistConfig, offlineAssetsReducer),
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
