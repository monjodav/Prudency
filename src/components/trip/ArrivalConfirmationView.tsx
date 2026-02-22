import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { TripMap } from '@/src/components/map/TripMap';
import { scaledIcon, ms } from '@/src/utils/scaling';
import type { DecodedRoute } from '@/src/services/directionsService';

type ArrivalConfirmationViewProps = {
  onExtend: () => void;
  onEndTrip: () => void;
  isExtending: boolean;
  error: string | null;
  departure: { lat: number; lng: number } | null;
  arrival: { lat: number; lng: number } | null;
  route: DecodedRoute | null;
  remainingSeconds: number;
  alertSent: boolean;
};

export function ArrivalConfirmationView({
  onExtend,
  onEndTrip,
  isExtending,
  error,
  departure,
  arrival,
  route,
  remainingSeconds,
  alertSent,
}: ArrivalConfirmationViewProps) {
  const isUrgent = remainingSeconds <= 60 && remainingSeconds > 0;
  const minutes = Math.floor(Math.max(0, remainingSeconds) / 60);
  const seconds = Math.max(0, remainingSeconds) % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const timerColor = isUrgent ? colors.error[400] : colors.warning[400];
  const warningBgColor = isUrgent
    ? 'rgba(202, 31, 31, 0.15)'
    : 'rgba(245, 158, 11, 0.1)';

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

          {alertSent ? (
            <View style={styles.alertSentBox}>
              <Ionicons
                name="warning"
                size={scaledIcon(18)}
                color={colors.error[400]}
              />
              <Text style={styles.alertSentText}>
                Le delai est ecoule. Une alerte a ete envoyee a ta personne de confiance.
              </Text>
            </View>
          ) : (
            <View style={[styles.warningBox, { backgroundColor: warningBgColor }]}>
              <Ionicons
                name="time-outline"
                size={scaledIcon(18)}
                color={timerColor}
              />
              <View style={styles.warningContent}>
                <Text style={[styles.warningText, { color: isUrgent ? colors.error[300] : colors.warning[300] }]}>
                  Tu disposes de{' '}
                  <Text style={styles.timerText}>{formattedTime}</Text>
                  {' '}pour finaliser ton trajet.
                  Passe ce delai, une alerte sera envoyee a ta personne de confiance.
                </Text>
              </View>
            </View>
          )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
  },
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
  warningContent: {
    flex: 1,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning[300],
    lineHeight: ms(20, 0.4),
  },
  timerText: {
    ...typography.bodySmall,
    fontWeight: '700',
    lineHeight: ms(20, 0.4),
  },
  alertSentBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(202, 31, 31, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[6],
    alignItems: 'flex-start',
  },
  alertSentText: {
    ...typography.bodySmall,
    color: colors.error[300],
    flex: 1,
    lineHeight: ms(20, 0.4),
  },
  arrivalActions: {
    width: '100%',
    gap: spacing[3],
  },
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
});
