import { useEffect, useRef, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useTripStore } from '@/src/stores/tripStore';
import { locationQueue, flushLocationQueue } from '@/src/services/locationService';

export function useOfflineSync() {
  const { isOnline, onReconnect } = useNetworkStatus();
  const activeTripId = useTripStore((s) => s.activeTripId);
  const isSyncing = useRef(false);

  const syncPendingData = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      await flushLocationQueue();
    } catch {
      // Flush errors are non-critical
    } finally {
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!activeTripId) return;

    const unsubscribe = onReconnect(() => {
      syncPendingData();
    });

    return unsubscribe;
  }, [activeTripId, onReconnect, syncPendingData]);

  // Try flushing on mount if we have pending items
  useEffect(() => {
    if (isOnline && activeTripId && locationQueue.size > 0) {
      syncPendingData();
    }
  }, [isOnline, activeTripId, syncPendingData]);

  return {
    isOnline,
    pendingLocationCount: locationQueue.size,
    syncPendingData,
  };
}
