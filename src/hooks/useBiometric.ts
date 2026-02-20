import { useCallback, useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'prudency_biometric_enabled';

interface UseBiometricReturn {
  /** Whether the device supports biometric authentication */
  isAvailable: boolean;
  /** Whether the user has enabled biometric verification */
  isEnabled: boolean;
  /** Whether the initial check is still loading */
  isLoading: boolean;
  /** Toggle the biometric preference on/off */
  setEnabled: (enabled: boolean) => Promise<void>;
  /** Prompt biometric authentication. Returns true if verified or if biometric is disabled. */
  authenticate: (reason?: string) => Promise<boolean>;
}

export function useBiometric(): UseBiometricReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware
        ? await LocalAuthentication.isEnrolledAsync()
        : false;

      const stored = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);

      if (mounted) {
        setIsAvailable(hasHardware && enrolled);
        setIsEnabled(stored === 'true');
        setIsLoading(false);
      }
    }

    void init();
    return () => { mounted = false; };
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmez votre identite pour activer la biometrie',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
      });
      if (!result.success) return;
    }
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, String(enabled));
    setIsEnabled(enabled);
  }, []);

  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!isEnabled || !isAvailable) return true;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason ?? 'Confirmez votre identite',
      cancelLabel: 'Annuler',
      disableDeviceFallback: false,
    });

    return result.success;
  }, [isEnabled, isAvailable]);

  return { isAvailable, isEnabled, isLoading, setEnabled, authenticate };
}
