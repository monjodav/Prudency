import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetroIcon } from './MetroIcon';
import { TramIcon } from './TramIcon';
import { BusIcon } from './BusIcon';
import { colors } from '@/src/theme/colors';
import { fontFamilies, typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import type { TransitLine } from '@/src/services/directionsService';

interface TransitLineBadgeProps {
  line: TransitLine;
  departureStop: string;
  arrivalStop: string;
}

export type TransitMode = 'metro' | 'tram' | 'rer' | 'bus' | 'generic';

export function getTransitMode(vehicleType: string, shortName: string): TransitMode {
  switch (vehicleType) {
    case 'SUBWAY':
    case 'TRAIN':
      return 'metro';
    case 'TRAM':
      return 'tram';
    case 'RAIL':
      return /^[A-E]$/.test(shortName) ? 'rer' : 'generic';
    case 'BUS':
      return 'bus';
    default:
      return 'generic';
  }
}

function getGenericIcon(vehicleType: string): keyof typeof Ionicons.glyphMap {
  switch (vehicleType) {
    case 'RAIL':
      return 'train-outline';
    case 'FERRY':
      return 'boat-outline';
    default:
      return 'bus-outline';
  }
}

/** Standalone transit line icon (pastille only, no stops text) */
export function TransitLineIcon({ line, size }: { line: TransitLine; size?: number }) {
  const lineId = line.shortName || line.name;
  const mode = getTransitMode(line.vehicleType, lineId);
  const resolvedSize = size ?? scaledIcon(16);
  return <LineBadge line={line} mode={mode} size={resolvedSize} />;
}

function LineBadge({ line, mode, size }: { line: TransitLine; mode: TransitMode; size: number }) {
  const bgColor = line.color || colors.primary[500];
  const txtColor = line.textColor || colors.white;
  const lineId = line.shortName || line.name;

  if (mode === 'metro') {
    return (
      <View
        style={[
          styles.metroBadge,
          { backgroundColor: bgColor, width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.badgeText, { color: txtColor, fontSize: size * 0.55 }]}>
          {lineId}
        </Text>
      </View>
    );
  }

  if (mode === 'rer') {
    return (
      <View style={[styles.rerBadge, { backgroundColor: bgColor, height: size }]}>
        <Text style={[styles.badgeText, { color: txtColor, fontSize: size * 0.55 }]}>
          {lineId}
        </Text>
      </View>
    );
  }

  if (mode === 'tram') {
    const barHeight = size * 0.15;
    return (
      <View style={[styles.tramBadge, { height: size, borderRadius: ms(2, 0.3), overflow: 'hidden' }]}>
        <View style={{ height: barHeight, backgroundColor: bgColor, width: '100%' }} />
        <View style={styles.tramCenter}>
          <Text style={[styles.badgeText, { color: '#25303B', fontSize: size * 0.5 }]}>
            {lineId}
          </Text>
        </View>
        <View style={{ height: barHeight, backgroundColor: bgColor, width: '100%' }} />
      </View>
    );
  }

  if (mode === 'bus') {
    return (
      <View style={[styles.busBadge, { backgroundColor: bgColor, height: size }]}>
        <Text style={[styles.badgeText, { color: txtColor, fontSize: size * 0.5 }]}>
          {lineId}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.genericBadge, { backgroundColor: bgColor, height: size }]}>
      <Text style={[styles.badgeText, { color: txtColor, fontSize: size * 0.5 }]}>
        {lineId}
      </Text>
    </View>
  );
}

export function TransitLineBadge({ line, departureStop, arrivalStop }: TransitLineBadgeProps) {
  const lineId = line.shortName || line.name;
  const mode = getTransitMode(line.vehicleType, lineId);
  const iconSize = scaledIcon(16);

  return (
    <View style={styles.pill}>
      {mode === 'metro' && <MetroIcon size={iconSize} />}
      {mode === 'tram' && <TramIcon size={iconSize} />}
      {mode === 'bus' && <BusIcon size={iconSize} />}
      {(mode === 'rer' || mode === 'generic') && (
        <Ionicons
          name={mode === 'rer' ? 'train-outline' : getGenericIcon(line.vehicleType)}
          size={iconSize}
          color="#25303B"
        />
      )}
      <LineBadge line={line} mode={mode} size={iconSize} />
      <Text style={styles.stationText} numberOfLines={2}>
        {departureStop} → {arrivalStop}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3, 0.3),
    flexShrink: 1,
  },
  badgeText: {
    fontFamily: fontFamilies.inter.bold,
    fontWeight: '700',
    textAlign: 'center',
  },
  metroBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rerBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(4, 0.3),
    borderRadius: ms(3, 0.3),
    minWidth: ms(18, 0.3),
  },
  tramBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    minWidth: ms(22, 0.3),
  },
  tramCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(3, 0.3),
  },
  busBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(4, 0.3),
    borderRadius: ms(3, 0.3),
    minWidth: ms(18, 0.3),
  },
  genericBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
    minWidth: ms(22, 0.3),
  },
  stationText: {
    ...typography.caption,
    fontSize: ms(10, 0.4),
    color: colors.gray[300],
    flexShrink: 1,
  },
});
