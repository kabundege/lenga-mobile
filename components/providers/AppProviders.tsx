import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkProvider } from '@/components/providers/NetworkProvider';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persistor, store } from '@/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;

/**
 * QueryClient configured for offline-first:
 *  - staleTime: 5 min  – data is "fresh" for 5 min; background refetch afterwards
 *  - gcTime: 1 week    – cached data survives in memory (and on disk) for a week
 *  - retry: 1          – single retry on failure; persisted cache makes extra retries useless
 *  - networkMode: offlineFirst – queries run even when the device is offline
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: ONE_WEEK_MS,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'lenga:query-cache',
  throttleTime: 1000,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NetworkProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: asyncStoragePersister,
              maxAge: ONE_WEEK_MS,
              dehydrateOptions: {
                shouldDehydrateQuery: (query) =>
                  query.state.status === 'success',
              },
            }}
          >
            {children}
          </PersistQueryClientProvider>
        </NetworkProvider>
      </PersistGate>
    </Provider>
  );
}
