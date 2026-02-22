import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useBiometric } from '@/src/hooks/useBiometric';
import { useTripStore } from '@/src/stores/tripStore';
import { fetchDirections } from '@/src/services/directionsService';
import { triggerAlert } from '@/src/services/alertService';
import { ArrivalConfirmationView } from '@/src/components/trip/ArrivalConfirmationView';
import { PasswordValidationView } from '@/src/components/trip/PasswordValidationView';
import { CompletedView } from '@/src/components/trip/CompletedView';
import { APP_CONFIG } from '@/src/utils/constants';
import type { DecodedRoute } from '@/src/services/directionsService';

const COUNTDOWN_SECONDS = APP_CONFIG.ALERT_TIMEOUT_BUFFER_MINUTES * 60;
const HALFWAY_SECONDS = Math.floor(COUNTDOWN_SECONDS / 2);

type ScreenPhase = 'arrival_confirmation' | 'password_validation' | 'completed';

export default function CompleteTripScreen() {
  const router = useRouter();
  const { trip } = useActiveTrip();
  const { completeTrip, isCompleting, extendTrip, isExtending } = useTrip();
  const { stopTracking } = useLocation();
  const { reset: resetTripStore } = useTripStore();
  const { isAvailable: isBiometricAvailable, isEnabled: isBiometricEnabled, authenticate } = useBiometric();

  const [phase, setPhase] = useState<ScreenPhase>('arrival_confirmation');
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<DecodedRoute | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(COUNTDOWN_SECONDS);
  const [alertSent, setAlertSent] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const halfwayTriggeredRef = useRef(false);
  const alertTriggeredRef = useRef(false);

  const departure = trip?.departure_lat != null && trip?.departure_lng != null
    ? { lat: trip.departure_lat, lng: trip.departure_lng }
    : null;

  const arrival = trip?.arrival_lat != null && trip?.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  useEffect(() => {
    if (departure && arrival && !route) {
      fetchDirections(departure, arrival).then((r) => {
        if (r) setRoute(r);
      });
    }
  }, [departure?.lat, departure?.lng, arrival?.lat, arrival?.lng]);

  const handleTimeoutAlert = useCallback(async () => {
    if (alertTriggeredRef.current || !trip) return;
    alertTriggeredRef.current = true;

    try {
      await triggerAlert({
        tripId: trip.id,
        type: 'timeout',
        reason: 'Delai de confirmation depasse',
      });
      setAlertSent(true);
    } catch (err) {
      if (__DEV__) console.warn('Auto-alert failed:', err);
      setError("Erreur lors de l'envoi de l'alerte automatique.");
      alertTriggeredRef.current = false;
    }
  }, [trip]);

  // Countdown timer for arrival confirmation phase
  useEffect(() => {
    if (phase !== 'arrival_confirmation') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;

        // Halfway nudge
        if (next === HALFWAY_SECONDS && !halfwayTriggeredRef.current) {
          halfwayTriggeredRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        // Timeout reached
        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          handleTimeoutAlert();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, handleTimeoutAlert]);

  const handleExtendFromArrival = async () => {
    if (!trip) return;
    try {
      await extendTrip({ id: trip.id, minutes: 15 });
      router.replace('/(trip)/active');
    } catch (err) {
      if (__DEV__) console.warn('Trip extend failed:', err);
      setError('Erreur lors du prolongement. Veuillez reessayer.');
    }
  };

  const handleProceedToValidation = () => {
    setPhase('password_validation');
    setError(null);
  };

  const handleBiometricValidation = async () => {
    setError(null);
    const verified = await authenticate('Confirmez votre arrivee');
    if (!verified) {
      setError('Verification biometrique echouee.');
      return;
    }
    await doCompleteTrip();
  };

  const doCompleteTrip = async () => {
    if (!trip) return;
    try {
      await stopTracking();
      await completeTrip(trip.id);
      setPhase('completed');
    } catch (err) {
      if (__DEV__) console.warn('Trip complete failed:', err);
      setError('Erreur lors de la confirmation. Veuillez reessayer.');
    }
  };

  const handleGoHome = () => {
    resetTripStore();
    router.replace('/(tabs)');
  };

  if (phase === 'completed') {
    return <CompletedView onGoHome={handleGoHome} />;
  }

  if (phase === 'arrival_confirmation') {
    return (
      <ArrivalConfirmationView
        onExtend={handleExtendFromArrival}
        onEndTrip={handleProceedToValidation}
        isExtending={isExtending}
        error={error}
        departure={departure}
        arrival={arrival}
        route={route}
        remainingSeconds={remainingSeconds}
        alertSent={alertSent}
      />
    );
  }

  return (
    <PasswordValidationView
      isBiometricAvailable={isBiometricAvailable && isBiometricEnabled}
      onBiometricValidation={handleBiometricValidation}
      onPasswordValidation={doCompleteTrip}
      isCompleting={isCompleting}
      error={error}
      setError={setError}
    />
  );
}
