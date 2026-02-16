import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { formatDuration } from '@/src/utils/formatters';
import { APP_CONFIG } from '@/src/utils/constants';
import { scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';
import { useTrip } from '@/src/hooks/useTrip';
import { useContacts } from '@/src/hooks/useContacts';
import { useLocation } from '@/src/hooks/useLocation';
import { useTripStore } from '@/src/stores/tripStore';
type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

const DURATION_PRESETS = [15, 30, 60, 120];

interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  { mode: 'walk', label: 'Marche', icon: 'walk-outline' },
  { mode: 'car', label: 'Voiture', icon: 'car-outline' },
  { mode: 'transit', label: 'Transport', icon: 'bus-outline' },
  { mode: 'bike', label: 'Velo', icon: 'bicycle-outline' },
];

export default function CreateTripScreen() {
  const router = useRouter();
  const { createTrip, isCreating } = useTrip();
  const { contacts, isLoading: contactsLoading } = useContacts();
  const { getCurrentLocation, startTracking } = useLocation();
  const { setActiveTrip } = useTripStore();

  const [duration, setDuration] = useState<number>(APP_CONFIG.DEFAULT_TRIP_DURATION_MINUTES);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('walk');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTrip = useCallback(async () => {
    setError(null);

    try {
      let departureLat: number | undefined;
      let departureLng: number | undefined;

      try {
        const location = await getCurrentLocation();
        departureLat = location.lat;
        departureLng = location.lng;
      } catch {
        // Location not available, continue without it
      }

      const trip = await createTrip({
        estimatedDurationMinutes: duration,
        arrivalAddress: destinationAddress || undefined,
        departureLat,
        departureLng,
      });

      setActiveTrip(trip.id);

      try {
        await startTracking();
      } catch {
        // Tracking failed, trip still created
      }

      router.replace('/(trip)/active');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la creation du trajet';
      setError(message);
    }
  }, [
    duration,
    destinationAddress,
    createTrip,
    getCurrentLocation,
    startTracking,
    setActiveTrip,
    router,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={scaledIcon(18)} color={colors.error[700]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          label="Destination"
          placeholder="Ou allez-vous ?"
          value={destinationAddress}
          onChangeText={setDestinationAddress}
          variant="light"
        />

        <Text style={styles.sectionTitle}>Mode de transport</Text>
        <View style={styles.transportRow}>
          {TRANSPORT_OPTIONS.map((option) => {
            const isSelected = transportMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                style={[
                  styles.transportOption,
                  isSelected && styles.transportOptionSelected,
                ]}
                onPress={() => setTransportMode(option.mode)}
              >
                <Ionicons
                  name={option.icon}
                  size={scaledIcon(24)}
                  color={isSelected ? colors.white : colors.gray[600]}
                />
                <Text
                  style={[
                    styles.transportLabel,
                    isSelected && styles.transportLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card variant="elevated" style={styles.durationCard}>
          <Text style={styles.sectionTitle}>Duree estimee</Text>
          <Text style={styles.durationDisplay}>{formatDuration(duration)}</Text>

          <View style={styles.presets}>
            {DURATION_PRESETS.map((preset) => (
              <Button
                key={preset}
                title={formatDuration(preset)}
                variant={duration === preset ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setDuration(preset)}
                style={styles.presetButton}
              />
            ))}
          </View>

          <View style={styles.quickAdjust}>
            <Button
              title="-5"
              variant="outline"
              size="sm"
              onPress={() =>
                setDuration((d) =>
                  Math.max(APP_CONFIG.MIN_TRIP_DURATION_MINUTES, d - 5)
                )
              }
              style={styles.adjustButton}
            />
            <Button
              title="+5"
              variant="outline"
              size="sm"
              onPress={() =>
                setDuration((d) =>
                  Math.min(APP_CONFIG.MAX_TRIP_DURATION_MINUTES, d + 5)
                )
              }
              style={styles.adjustButton}
            />
            <Button
              title="+15"
              variant="outline"
              size="sm"
              onPress={() =>
                setDuration((d) =>
                  Math.min(APP_CONFIG.MAX_TRIP_DURATION_MINUTES, d + 15)
                )
              }
              style={styles.adjustButton}
            />
            <Button
              title="+30"
              variant="outline"
              size="sm"
              onPress={() =>
                setDuration((d) =>
                  Math.min(APP_CONFIG.MAX_TRIP_DURATION_MINUTES, d + 30)
                )
              }
              style={styles.adjustButton}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Contact de confiance</Text>
        {contactsLoading ? (
          <Text style={styles.loadingText}>Chargement des contacts...</Text>
        ) : contacts.length === 0 ? (
          <View style={styles.noContactsBanner}>
            <Ionicons name="person-add-outline" size={scaledIcon(20)} color={colors.warning[700]} />
            <Text style={styles.noContactsText}>
              Aucun contact de confiance. Ajoutez-en dans les parametres.
            </Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact) => {
              const isSelected = selectedContactId === contact.id;
              return (
                <Pressable
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    isSelected && styles.contactItemSelected,
                  ]}
                  onPress={() =>
                    setSelectedContactId(isSelected ? null : contact.id)
                  }
                >
                  <View style={styles.contactInfo}>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'person-circle-outline'}
                      size={scaledIcon(24)}
                      color={isSelected ? colors.primary[500] : colors.gray[400]}
                    />
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  </View>
                  {contact.is_primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Principal</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Commencer"
            onPress={handleCreateTrip}
            loading={isCreating}
            fullWidth
            size="lg"
            icon={<Ionicons name="navigate" size={scaledIcon(20)} color={colors.white} />}
          />
          <Button
            title="Annuler"
            variant="ghost"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[700],
    flex: 1,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  transportRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  transportOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing[1],
  },
  transportOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  transportLabel: {
    ...typography.caption,
    color: colors.gray[600],
  },
  transportLabelSelected: {
    color: colors.white,
  },
  durationCard: {
    marginBottom: spacing[6],
  },
  durationDisplay: {
    ...typography.h1,
    color: colors.primary[500],
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  presetButton: {
    minWidth: ms(60, 0.5),
  },
  quickAdjust: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
  },
  adjustButton: {
    minWidth: ms(50, 0.5),
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  noContactsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  noContactsText: {
    ...typography.bodySmall,
    color: colors.warning[700],
    flex: 1,
  },
  contactsList: {
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  contactItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  contactPhone: {
    ...typography.caption,
    color: colors.gray[500],
  },
  primaryBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: scaledSpacing(2),
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    ...typography.caption,
    color: colors.primary[600],
    fontWeight: '600',
  },
  actions: {
    gap: spacing[3],
  },
});
