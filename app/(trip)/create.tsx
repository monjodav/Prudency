import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { formatDuration } from '@/src/utils/formatters';
import { APP_CONFIG } from '@/src/utils/constants';

const DURATION_PRESETS = [15, 30, 60, 120];

export default function CreateTripScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState<number>(APP_CONFIG.DEFAULT_TRIP_DURATION_MINUTES);
  const [departureAddress, setDepartureAddress] = useState('');
  const [arrivalAddress, setArrivalAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTrip = async () => {
    setLoading(true);
    // Placeholder: will use useTrip hook to create trip
    setTimeout(() => {
      setLoading(false);
      router.replace('/(trip)/active');
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {APP_CONFIG.MIN_TRIP_DURATION_MINUTES} min
            </Text>
            <View style={styles.sliderWrapper}>
              {/* Slider from @react-native-community/slider --
                  if not installed, fallback to basic View */}
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderFill,
                    {
                      width: `${((duration - APP_CONFIG.MIN_TRIP_DURATION_MINUTES) / (APP_CONFIG.MAX_TRIP_DURATION_MINUTES - APP_CONFIG.MIN_TRIP_DURATION_MINUTES)) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.sliderLabel}>
              {formatDuration(APP_CONFIG.MAX_TRIP_DURATION_MINUTES)}
            </Text>
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

        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Adresses (optionnel)</Text>
          <Input
            label="Depart"
            placeholder="Adresse de depart"
            value={departureAddress}
            onChangeText={setDepartureAddress}
          />
          <Input
            label="Arrivee"
            placeholder="Adresse d'arrivee"
            value={arrivalAddress}
            onChangeText={setArrivalAddress}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Demarrer le trajet"
            onPress={handleCreateTrip}
            loading={loading}
            fullWidth
            size="lg"
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
  durationCard: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
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
    minWidth: 60,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.gray[500],
    minWidth: 36,
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  quickAdjust: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
  },
  adjustButton: {
    minWidth: 50,
  },
  addressSection: {
    marginBottom: spacing[6],
  },
  actions: {
    gap: spacing[3],
  },
});
