import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, shadows } from '@/src/theme/spacing';
import { useTripStore } from '@/src/stores/tripStore';
import { useAuthStore } from '@/src/stores/authStore';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { TripStatusIndicator } from '@/src/components/trip/TripStatus';
import { TRIP_STATUS } from '@/src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { activeTripId } = useTripStore();
  const { user } = useAuthStore();

  const handleStartTrip = () => {
    if (activeTripId) {
      router.push('/(trip)/active');
    } else {
      router.push('/(trip)/create');
    }
  };

  const handleAlert = () => {
    // Placeholder: will trigger alert via useAlert hook
  };

  const firstName = user?.user_metadata?.first_name;
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Ou allez-vous aujourd'hui ?</Text>
      </View>

      <View style={styles.content}>
        {activeTripId && (
          <View style={styles.activeTrip}>
            <TripStatusIndicator status={TRIP_STATUS.ACTIVE} />
            <Pressable
              style={styles.viewTripButton}
              onPress={() => router.push('/(trip)/active')}
            >
              <FontAwesome name="chevron-right" size={14} color={colors.primary[500]} />
            </Pressable>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
            activeTripId && styles.activeButton,
          ]}
          onPress={handleStartTrip}
        >
          <FontAwesome
            name={activeTripId ? 'road' : 'plus'}
            size={32}
            color={colors.white}
          />
          <Text style={styles.startButtonText}>
            {activeTripId ? 'Voir mon trajet' : 'Demarrer un trajet'}
          </Text>
        </Pressable>

        {!activeTripId && (
          <View style={styles.quickAlert}>
            <AlertButton onTrigger={handleAlert} size={80} />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <FontAwesome
            name="shield"
            size={16}
            color={colors.primary[500]}
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>
            Vos contacts de confiance seront prevenus en cas de probleme
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },
  greeting: {
    ...typography.h1,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing[2],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  activeTrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.info[50],
    borderRadius: 12,
    marginBottom: spacing[8],
  },
  viewTripButton: {
    padding: spacing[2],
  },
  startButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
  },
  activeButton: {
    backgroundColor: colors.success[500],
    shadowColor: colors.success[500],
  },
  startButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    marginTop: spacing[2],
  },
  quickAlert: {
    marginTop: spacing[10],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing[4],
    borderRadius: 12,
  },
  footerIcon: {
    marginRight: spacing[3],
  },
  footerText: {
    ...typography.caption,
    color: colors.primary[800],
    flex: 1,
  },
});
