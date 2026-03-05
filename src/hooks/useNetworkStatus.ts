import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';

const CHECK_INTERVAL_MS = 15_000;
const PING_TIMEOUT_MS = 5_000;

async function checkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const isOnlineRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onReconnectCallbacks = useRef<Array<() => void>>([]);

  const check = useCallback(async () => {
    const nowOnline = await checkConnectivity();
    setIsOnline(nowOnline);

    if (!isOnlineRef.current && nowOnline) {
      onReconnectCallbacks.current.forEach((cb) => cb());
    }

    isOnlineRef.current = nowOnline;
  }, []);

  const onReconnect = useCallback((callback: () => void) => {
    onReconnectCallbacks.current.push(callback);
    return () => {
      onReconnectCallbacks.current = onReconnectCallbacks.current.filter(
        (cb) => cb !== callback,
      );
    };
  }, []);

  useEffect(() => {
    checkConnectivity().then((online) => {
      setIsOnline(online);
      isOnlineRef.current = online;
    });

    intervalRef.current = setInterval(check, CHECK_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        check();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [check]);

  return {
    isOnline,
    checkNow: check,
    onReconnect,
  };
}
