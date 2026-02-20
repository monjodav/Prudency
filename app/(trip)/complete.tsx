import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { TripMap } from '@/src/components/map/TripMap';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useLocation } from '@/src/hooks/useLocation';
import { useBiometric } from '@/src/hooks/useBiometric';
import { useTripStore } from '@/src/stores/tripStore';
import { verifyPassword } from '@/src/services/authService';
import { fetchDirections } from '@/src/services/directionsService';
import { scaledIcon, ms } from '@/src/utils/scaling';
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
    } catch {
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
    } catch {
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

function ArrivalConfirmationView({
  onExtend,
  onEndTrip,
  isExtending,
  error,
  departure,
  arrival,
  route,
}: {
  onExtend: () => void;
  onEndTrip: () => void;
  isExtending: boolean;
  error: string | null;
  departure: { lat: number; lng: number } | null;
  arrival: { lat: number; lng: number } | null;
  route: DecodedRoute | null;
}) {
  return (
    <View style={styles.container}>
      <TripMap
        departure={departure}
        arrival={arrival}
        routeCoordinates={route?.polyline}
        style={styles.fullScreenMap}
      />

      <View style={styles.overlayContent}>
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalIconContainer}>
            <Ionicons
              name="location"
              size={scaledIcon(40)}
              color={colors.primary[400]}
            />
          </View>

          <Text style={styles.arrivalTitle}>
            Es-tu bien arrivee a destination ?
          </Text>

          <View style={styles.warningBox}>
            <Ionicons
              name="time-outline"
              size={scaledIcon(18)}
              color={colors.warning[400]}
            />
            <Text style={styles.warningText}>
              Tu disposes de 15 minutes pour finaliser ton trajet.
              Passe ce delai, une alerte sera envoyee a ta personne de confiance.
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={scaledIcon(16)} color={colors.error[400]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.arrivalActions}>
            <Button
              title="Prolonger mon trajet"
              onPress={onExtend}
              loading={isExtending}
              fullWidth
              size="lg"
              icon={<Ionicons name="time-outline" size={scaledIcon(20)} color={colors.white} />}
            />
            <Button
              title="Terminer mon trajet"
              variant="outline"
              onPress={onEndTrip}
              fullWidth
              size="lg"
              icon={<Ionicons name="checkmark-circle-outline" size={scaledIcon(20)} color={colors.primary[50]} />}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PasswordValidationView({
  isBiometricAvailable,
  onBiometricValidation,
  onPasswordValidation,
  isCompleting,
  error,
  setError,
}: {
  isBiometricAvailable: boolean;
  onBiometricValidation: () => void;
  onPasswordValidation: () => void;
  isCompleting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError('Veuillez entrer votre mot de passe.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const valid = await verifyPassword(password);
      if (!valid) {
        setError('Mot de passe incorrect.');
        return;
      }
      await onPasswordValidation();
    } catch {
      setError('Erreur de verification. Veuillez reessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.validationContent}>
        <View style={styles.validationIconContainer}>
          <Ionicons
            name="shield-checkmark"
            size={scaledIcon(64)}
            color={colors.primary[400]}
          />
        </View>

        <Text style={styles.validationTitle}>Trajet termine</Text>

        {isBiometricAvailable ? (
          <BiometricFirstView
            onBiometricValidation={onBiometricValidation}
            isCompleting={isCompleting}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onPasswordSubmit={handlePasswordSubmit}
            isVerifying={isVerifying}
            error={error}
          />
        ) : (
          <PasswordOnlyView
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onPasswordSubmit={handlePasswordSubmit}
            isVerifying={isVerifying}
            error={error}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function BiometricFirstView({
  onBiometricValidation,
  isCompleting,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onPasswordSubmit,
  isVerifying,
  error,
}: {
  onBiometricValidation: () => void;
  isCompleting: boolean;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onPasswordSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  return (
    <View style={styles.validationBody}>
      <Text style={styles.validationSubtitle}>
        Valide avec la biometrie pour confirmer ton arrivee.
      </Text>

      <Button
        title="Verifier avec la biometrie"
        onPress={onBiometricValidation}
        loading={isCompleting}
        fullWidth
        size="lg"
        icon={<Ionicons name="finger-print" size={scaledIcon(20)} color={colors.white} />}
      />

      {!showPasswordInput ? (
        <Pressable
          style={styles.passwordLink}
          onPress={() => setShowPasswordInput(true)}
        >
          <Text style={styles.passwordLinkText}>
            Ou utilise ton mot de passe
          </Text>
        </Pressable>
      ) : (
        <PasswordInput
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onSubmit={onPasswordSubmit}
          isVerifying={isVerifying}
          error={error}
        />
      )}
    </View>
  );
}

function PasswordOnlyView({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onPasswordSubmit,
  isVerifying,
  error,
}: {
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onPasswordSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  return (
    <View style={styles.validationBody}>
      <Text style={styles.validationSubtitle}>
        Valide avec ton mot de passe pour confirmer ton arrivee.
      </Text>

      <PasswordInput
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={onPasswordSubmit}
        isVerifying={isVerifying}
        error={error}
      />
    </View>
  );
}

function PasswordInput({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmit,
  isVerifying,
  error,
}: {
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSubmit: () => void;
  isVerifying: boolean;
  error: string | null;
}) {
  return (
    <View style={styles.passwordSection}>
      <Text style={styles.passwordLabel}>Mot de passe</Text>
      <View style={styles.passwordInputRow}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor={colors.gray[500]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Pressable
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={scaledIcon(20)}
            color={colors.gray[400]}
          />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={scaledIcon(14)} color={colors.error[400]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title="Valider"
        onPress={onSubmit}
        loading={isVerifying}
        fullWidth
        size="lg"
        style={styles.passwordSubmitButton}
      />
    </View>
  );
}

function CompletedView({ onGoHome }: { onGoHome: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.completedContent}>
        <View style={styles.completedIconContainer}>
          <Ionicons name="checkmark-circle" size={scaledIcon(80)} color={colors.success[400]} />
        </View>

        <Text style={styles.completedTitle}>Trajet termine</Text>
        <Text style={styles.completedSubtitle}>
          Trajet fini avec succes. Tes contacts ont ete prevenus de ton arrivee.
        </Text>

        <Button
          title="Retour a l'accueil"
          onPress={onGoHome}
          fullWidth
          size="lg"
          icon={<Ionicons name="home-outline" size={scaledIcon(20)} color={colors.white} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },

  // Full-screen map
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },

  // Arrival confirmation overlay
  overlayContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  arrivalCard: {
    backgroundColor: 'rgba(4, 9, 36, 0.95)',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
    alignItems: 'center',
  },
  arrivalIconContainer: {
    marginBottom: spacing[4],
  },
  arrivalTitle: {
    ...typography.h2,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[6],
    alignItems: 'flex-start',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning[300],
    flex: 1,
    lineHeight: ms(20, 0.4),
  },
  arrivalActions: {
    width: '100%',
    gap: spacing[3],
  },

  // Validation screen
  validationContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  validationIconContainer: {
    marginBottom: spacing[6],
  },
  validationTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  validationSubtitle: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  validationBody: {
    width: '100%',
    alignItems: 'center',
  },
  passwordLink: {
    paddingVertical: spacing[4],
  },
  passwordLinkText: {
    ...typography.bodySmall,
    color: colors.primary[300],
    fontWeight: '500',
  },

  // Password input
  passwordSection: {
    width: '100%',
    marginTop: spacing[6],
  },
  passwordLabel: {
    ...typography.label,
    color: colors.gray[300],
    marginBottom: spacing[2],
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  passwordInput: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  passwordToggle: {
    padding: spacing[3],
  },
  passwordSubmitButton: {
    marginTop: spacing[4],
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  errorText: {
    ...typography.caption,
    color: colors.error[400],
  },

  // Completed screen
  completedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  completedIconContainer: {
    marginBottom: spacing[6],
  },
  completedTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  completedSubtitle: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
});
