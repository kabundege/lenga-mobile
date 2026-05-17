import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type NetworkSnapshot = Pick<NetInfoState, 'type' | 'isConnected' | 'isInternetReachable'>;

type NetworkContextValue = {
  snapshot: NetworkSnapshot | null;
  /** True while `snapshot` has not received the first listener event yet. */
  isBootstrapped: boolean;
  /**
   * True when disconnected or the OS reports no internet reachability.
   * `null` reachability stays permissive so flaky NetInfo does not block playback.
   */
  isOffline: boolean;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

function deriveOffline(
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
): boolean {
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<NetworkSnapshot | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const mergeState = useCallback((next: NetInfoState) => {
    setBootstrapped(true);
    setSnapshot({
      type: next.type,
      isConnected: next.isConnected,
      isInternetReachable: next.isInternetReachable,
    });
  }, []);

  useEffect(() => {
    void NetInfo.fetch().then((s) => {
      mergeState(s);
    });

    const unsubscribe = NetInfo.addEventListener((s: NetInfoState) => {
      mergeState(s);
    });

    return () => {
      unsubscribe();
    };
  }, [mergeState]);

  const isOffline = useMemo(() => {
    if (!snapshot) return false;
    return deriveOffline(snapshot);
  }, [snapshot]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      snapshot,
      isBootstrapped: bootstrapped,
      isOffline,
    }),
    [bootstrapped, isOffline, snapshot],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStatus(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetworkStatus must be used within NetworkProvider');
  }
  return ctx;
}
