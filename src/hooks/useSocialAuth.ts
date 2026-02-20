import { useGoogleAuth } from './useGoogleAuth';
import { useAppleAuth } from './useAppleAuth';

export function useSocialAuth() {
  const google = useGoogleAuth();
  const apple = useAppleAuth();

  const isLoading = google.isLoading || apple.isLoading;

  return {
    signInWithGoogle: google.signInWithGoogle,
    isGoogleLoading: google.isLoading,
    googleError: google.error,
    signInWithApple: apple.signInWithApple,
    isAppleLoading: apple.isLoading,
    appleError: apple.error,
    isLoading,
  };
}
