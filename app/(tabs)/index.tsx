import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { figmaScale, scaledIcon, scaledRadius, scaledShadow, ms } from '@/src/utils/scaling';
import { useTripStore } from '@/src/stores/tripStore';
import { useAuthStore } from '@/src/stores/authStore';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { TripStatusIndicator } from '@/src/components/trip/TripStatus';
import { TRIP_STATUS } from '@/src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    // Will trigger alert via useAlert hook
  };

  const firstName = user?.user_metadata?.first_name;
  const greeting = firstName ? `Bonjour ${firstName}` : 'Bonjour';

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Ou allez-vous aujourd'hui ?</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTripId && (
          <Pressable
            style={styles.activeTrip}
            onPress={() => router.push('/(trip)/active')}
          >
            <TripStatusIndicator status={TRIP_STATUS.ACTIVE} />
            <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.primary[300]} />
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
            activeTripId ? styles.activeButton : undefined,
          ]}
          onPress={handleStartTrip}
        >
          <View style={styles.startButtonInner}>
            <Ionicons
              name={activeTripId ? 'navigate' : 'add'}
              size={scaledIcon(40)}
              color={colors.white}
            />
            <Text style={styles.startButtonText}>
              {activeTripId ? 'Voir mon trajet' : 'Commencer un trajet'}
            </Text>
          </View>
        </Pressable>

        {!activeTripId && (
          <View style={styles.quickAlert}>
            <AlertButton onTrigger={handleAlert} size={ms(80, 0.5)} />
          </View>
        )}
      </View>

      {/* Footer info card */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Ionicons
            name="shield-checkmark"
            size={scaledIcon(18)}
            color={colors.primary[300]}
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
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  greeting: {
    ...typography.h1,
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.primary[200],
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
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    borderRadius: scaledRadius(12),
    borderWidth: 1,
    borderColor: 'rgba(44, 65, 188, 0.3)',
    marginBottom: spacing[8],
  },
  startButton: {
    width: ms(200, 0.5),
    height: ms(200, 0.5),
    borderRadius: ms(100, 0.5),
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...scaledShadow({
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    }),
  },
  startButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.25,
  },
  activeButton: {
    backgroundColor: colors.success[500],
    shadowColor: colors.success[500],
  },
  startButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    marginTop: spacing[2],
    fontWeight: '600',
  },
  quickAlert: {
    marginTop: spacing[10],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 65, 188, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(44, 65, 188, 0.2)',
    padding: spacing[4],
    borderRadius: scaledRadius(12),
  },
  footerIcon: {
    marginRight: spacing[3],
  },
  footerText: {
    ...typography.caption,
    color: colors.primary[200],
    flex: 1,
  },
});
