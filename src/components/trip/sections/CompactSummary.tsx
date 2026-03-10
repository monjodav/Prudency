import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { TransitLineIcon, getTransitMode } from '@/src/components/transit/TransitLineBadge';
import { MetroIcon } from '@/src/components/transit/MetroIcon';
import { TramIcon } from '@/src/components/transit/TramIcon';
import { BusIcon } from '@/src/components/transit/BusIcon';
import type { RouteStep } from '@/src/services/directionsService';

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

export function CompactSummary({ steps }: { steps: RouteStep[] }) {
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
  compactTransit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2, 0.3),
  },
});
