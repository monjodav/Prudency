import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { scaledFontSize, scaledIcon, ms } from '@/src/utils/scaling';

type TrajetRouteVariant = 'walking' | 'metro';

interface MetroSegment {
  line: string;
  color: string;
}

interface TrajetRouteProps {
  variant?: TrajetRouteVariant;
  routeDescription: string;
  metro?: MetroSegment;
  style?: ViewStyle;
}

export function TrajetRoute({
  variant = 'walking',
  routeDescription,
  metro,
  style,
}: TrajetRouteProps) {
  if (variant === 'metro' && metro) {
    return (
      <View style={[styles.container, style]}>
        <Ionicons
          name="subway-outline"
          size={scaledIcon(24)}
          color={colors.white}
        />
        <View style={styles.routeDetails}>
          <View style={styles.routeSteps}>
            <Ionicons name="walk" size={scaledIcon(16)} color={colors.white} />
            <Ionicons
              name="chevron-forward"
              size={scaledIcon(16)}
              color={colors.gray[400]}
            />
            <View style={[styles.metroBadge, { backgroundColor: metro.color }]}>
              <Text style={styles.metroLine}>{metro.line}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={scaledIcon(16)}
              color={colors.gray[400]}
            />
            <Ionicons name="walk" size={scaledIcon(16)} color={colors.white} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="walk" size={scaledIcon(24)} color={colors.white} />
      <View style={styles.textContainer}>
        <Text style={styles.routeText} numberOfLines={1}>
          <Text style={styles.viaBold}>Via</Text>
          {` ${routeDescription}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingRight: spacing[4],
    paddingVertical: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  routeText: {
    ...typography.bodySmall,
    color: colors.white,
  },
  viaBold: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  routeDetails: {
    flex: 1,
  },
  routeSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4, 0.4),
  },
  metroBadge: {
    borderRadius: ms(4, 0.3),
    paddingHorizontal: ms(5, 0.4),
  },
  metroLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: scaledFontSize(12),
    lineHeight: ms(16, 0.4),
    color: colors.black,
  },
});
