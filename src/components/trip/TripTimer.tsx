import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

interface TripTimerProps {
  estimatedArrivalAt: string;
  style?: ViewStyle;
}

function computeRemaining(target: Date): { minutes: number; seconds: number; isOvertime: boolean } {
  const diffMs = target.getTime() - Date.now();
  const isOvertime = diffMs < 0;
  const totalSeconds = Math.abs(Math.floor(diffMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds, isOvertime };
}

export function TripTimer({ estimatedArrivalAt, style }: TripTimerProps) {
  const targetDate = useRef(new Date(estimatedArrivalAt)).current;
  const [remaining, setRemaining] = useState(() => computeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(computeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const { minutes, seconds, isOvertime } = remaining;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return (
    <View
      style={[
        styles.container,
        isOvertime ? styles.overtime : styles.normal,
        style,
      ]}
    >
      <Text style={styles.label}>
        {isOvertime ? 'Temps depasse' : 'Temps restant'}
      </Text>
      <Text
        style={[
          styles.timer,
          isOvertime ? styles.timerOvertime : styles.timerNormal,
        ]}
      >
        {isOvertime ? '+' : ''}
        {formattedMinutes}:{formattedSeconds}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.xl,
  },
  normal: {
    backgroundColor: colors.primary[50],
  },
  overtime: {
    backgroundColor: colors.error[50],
  },
  label: {
    ...typography.caption,
    color: colors.gray[600],
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerNormal: {
    color: colors.gray[900],
  },
  timerOvertime: {
    color: colors.error[600],
  },
});
