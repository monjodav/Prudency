import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { TripMap } from '@/src/components/map/TripMap';
import { ms, scaledIcon, scaledShadow } from '@/src/utils/scaling';

export default function TrackScreen() {
  const { personId } = useLocalSearchParams<{ personId: string }>();
  const router = useRouter();

  const [personData] = useState({
    name: 'Marie Dupont',
    phone: '+33 6 12 34 56 78',
    status: 'trip_active' as const,
    batteryLevel: 72,
    currentPosition: {
      lat: 48.8566,
      lng: 2.3522,
    },
    destination: {
      name: 'Maison',
      lat: 48.8698,
      lng: 2.3298,
    },
    estimatedArrival: '18:30',
    startedAt: '17:45',
  });

  const handleCall = () => {
    // Placeholder: initiate phone call
  };

  const handleMessage = () => {
    // Placeholder: open SMS
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <TripMap
          userLocation={personData.currentPosition}
          arrival={personData.destination}
        />
      </View>

      <View style={styles.infoPanel}>
        <View style={styles.personHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {personData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{personData.name}</Text>
            <Text style={styles.tripStatus}>En trajet vers {personData.destination.name}</Text>
          </View>
          <View style={styles.batteryContainer}>
            <FontAwesome
              name={personData.batteryLevel > 20 ? 'battery-three-quarters' : 'battery-quarter'}
              size={scaledIcon(16)}
              color={personData.batteryLevel > 20 ? colors.success[500] : colors.error[500]}
            />
            <Text style={styles.batteryText}>{personData.batteryLevel}%</Text>
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="clock-o" size={scaledIcon(16)} color={colors.gray[500]} />
            <Text style={styles.detailText}>
              Depart : {personData.startedAt}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="flag-checkered" size={scaledIcon(16)} color={colors.gray[500]} />
            <Text style={styles.detailText}>
              Arrivee prevue : {personData.estimatedArrival}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="map-marker" size={scaledIcon(16)} color={colors.primary[500]} />
            <Text style={styles.detailText}>{personData.destination.name}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleCall}>
            <FontAwesome name="phone" size={scaledIcon(20)} color={colors.primary[500]} />
            <Text style={styles.actionText}>Appeler</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleMessage}>
            <FontAwesome name="comment" size={scaledIcon(20)} color={colors.primary[500]} />
            <Text style={styles.actionText}>Message</Text>
          </Pressable>
        </View>

        <Button
          title="Fermer"
          variant="outline"
          onPress={() => router.back()}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapContainer: {
    flex: 1,
  },
  infoPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[6],
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }),
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  avatarPlaceholder: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary[600],
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.h3,
    color: colors.gray[900],
  },
  tripStatus: {
    ...typography.bodySmall,
    color: colors.info[600],
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  batteryText: {
    ...typography.bodySmall,
    color: colors.gray[600],
  },
  tripDetails: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  detailText: {
    ...typography.body,
    color: colors.gray[700],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  actionText: {
    ...typography.button,
    color: colors.primary[500],
  },
});
