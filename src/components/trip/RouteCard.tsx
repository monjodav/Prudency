import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radio } from '@/src/components/ui/Radio';
import { TransitLineIcon, getTransitMode } from '@/src/components/transit/TransitLineBadge';
import { MetroIcon } from '@/src/components/transit/MetroIcon';
import { TramIcon } from '@/src/components/transit/TramIcon';
import { BusIcon } from '@/src/components/transit/BusIcon';
import { colors } from '@/src/theme/colors';
import { fontFamilies, typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import type { DecodedRoute, RouteStep } from '@/src/services/directionsService';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const km = meters / 1000;
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
}

type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

const TRANSPORT_ICONS: Record<TransportMode, keyof typeof Ionicons.glyphMap> = {
  walk: 'walk',
  transit: 'bus',
  bike: 'bicycle',
  car: 'car',
};

interface RouteCardProps {
  route: DecodedRoute;
  isSelected: boolean;
  onSelect: () => void;
  transportMode: TransportMode;
  departureTime: Date;
}

export function RouteCard({ route, isSelected, onSelect, transportMode, departureTime }: RouteCardProps) {
  const isTransit = transportMode === 'transit';

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <Ionicons
        name={TRANSPORT_ICONS[transportMode]}
        size={scaledIcon(20)}
        color={colors.white}
        style={styles.transportIcon}
      />

      <View style={styles.content}>
        {isTransit ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.timeRange}>
                {formatTime(departureTime)} - {formatTime(new Date(departureTime.getTime() + route.duration.value * 1000))}
              </Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.duration}>{formatDuration(route.duration.value)}</Text>
            </View>
            <View style={styles.compactSequence}>
              <CompactSummary steps={route.steps} />
            </View>
          </>
        ) : (
          <View>
            {route.summary !== '' && (
              <Text style={styles.summary} numberOfLines={1}>
                <Text style={styles.viaBold}>Via </Text>{route.summary}
              </Text>
            )}
            <Text style={styles.subInfo}>
              {formatDuration(route.duration.value)} | {formatDistance(route.distance.value)}
            </Text>
          </View>
        )}
      </View>

      <Radio selected={isSelected} onSelect={onSelect} style={styles.radio} />
    </Pressable>
  );
}

/** Compact walk chip with minutes */
function CompactWalkChip({ durationSeconds }: { durationSeconds: number }) {
  return (
    <View style={styles.compactWalk}>
      <Ionicons name="walk" size={scaledIcon(12)} color={colors.gray[200]} />
      <Text style={styles.compactWalkText}>
        {Math.max(1, Math.ceil(durationSeconds / 60))}
      </Text>
    </View>
  );
}

/** Compact inline summary: walk(min) > pastille > walk(min) */
function CompactSummary({ steps }: { steps: RouteStep[] }) {
  const items: React.ReactNode[] = [];
  const chevronSize = scaledIcon(8);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (step.travelMode === 'WALKING') {
      if (items.length > 0) {
        items.push(
          <Ionicons key={`c${i}`} name="chevron-forward" size={chevronSize} color={colors.gray[200]} />,
        );
      }
      items.push(
        <CompactWalkChip key={`w${i}`} durationSeconds={step.duration.value} />,
      );
    } else if (step.travelMode === 'TRANSIT' && step.transitDetails) {
      if (items.length > 0) {
        items.push(
          <Ionicons key={`c${i}`} name="chevron-forward" size={chevronSize} color={colors.gray[200]} />,
        );
      }
      const lineId = step.transitDetails.line.shortName || step.transitDetails.line.name;
      const mode = getTransitMode(step.transitDetails.line.vehicleType, lineId);
      const badgeSize = scaledIcon(16);
      items.push(
        <View key={`t${i}`} style={styles.compactTransit}>
          {mode === 'metro' && <MetroIcon size={badgeSize} />}
          {mode === 'tram' && <TramIcon size={badgeSize} />}
          {mode === 'bus' && <BusIcon size={badgeSize} />}
          {(mode === 'rer' || mode === 'generic') && (
            <Ionicons name={mode === 'rer' ? 'train-outline' : 'bus-outline'} size={badgeSize} color={colors.gray[200]} />
          )}
          <TransitLineIcon line={step.transitDetails.line} size={badgeSize} />
        </View>,
      );
    }
  }

  return <>{items}</>;
}


const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[4],
    gap: spacing[3],
  },
  cardSelected: {
    borderColor: colors.primary[400],
    backgroundColor: 'rgba(44, 65, 188, 0.1)',
  },
  transportIcon: {},
  radio: {},
  content: {
    flex: 1,
    gap: spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  timeRange: {
    ...typography.caption,
    color: colors.gray[300],
  },
  separator: {
    ...typography.caption,
    color: colors.gray[500],
  },
  duration: {
    ...typography.body,
    fontFamily: fontFamilies.inter.semibold,
    fontWeight: '600',
    color: colors.white,
  },
  summary: {
    ...typography.caption,
    color: colors.gray[200],
  },
  viaBold: {
    fontFamily: fontFamilies.inter.bold,
    fontWeight: '700',
  },
  subInfo: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: ms(2, 0.3),
  },

  // Compact sequence (collapsed state)
  compactSequence: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(5, 0.3),
  },
  compactTransit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2, 0.3),
  },
  compactWalk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(1, 0.3),
  },
  compactWalkText: {
    ...typography.caption,
    fontSize: ms(10, 0.4),
    color: colors.gray[200],
  },

});
