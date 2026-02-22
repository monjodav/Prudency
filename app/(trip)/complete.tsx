import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useBiometric } from '@/src/hooks/useBiometric';
import { useTripStore } from '@/src/stores/tripStore';
import { fetchDirections } from '@/src/services/directionsService';
import { ArrivalConfirmationView } from '@/src/components/trip/ArrivalConfirmationView';
import { PasswordValidationView } from '@/src/components/trip/PasswordValidationView';
import { CompletedView } from '@/src/components/trip/CompletedView';
import type { DecodedRoute } from '@/src/services/directionsService';

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
