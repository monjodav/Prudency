import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledSpacing } from '@/src/utils/scaling';

interface CarInfoProps {
  label: string;
  count?: number;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CarInfo({
  label,
  count,
  icon,
  selected = false,
  onPress,
  style,
}: CarInfoProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.container,
          selected ? styles.containerSelected : styles.containerDefault,
          style,
        ]}
      >
        <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.topRow}>
          {count !== undefined && <Text style={styles.count}>{count}</Text>}
          {icon}
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ms(79, 0.4),
    borderColor: colors.brandPosition[50],
    borderStyle: 'solid',
    borderRadius: borderRadius.tag,
    padding: spacing[4],
    gap: spacing[2],
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(82, 51, 96, 0.43)',
  },
  containerDefault: {
    borderWidth: 0.25,
  },
  containerSelected: {
    borderWidth: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  count: {
    ...typography.bodySmall,
    color: colors.white,
  },
  label: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
