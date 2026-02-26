import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledFontSize, scaledShadow, ms } from '@/src/utils/scaling';

interface CardPriceProps {
  title: string;
  subtitle?: string;
  price?: string;
  infoPrice?: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CardPrice({
  title,
  subtitle,
  price,
  infoPrice,
  selected = false,
  onPress,
  style,
}: CardPriceProps) {
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
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
            </View>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.priceSection}>
            {price && <Text style={styles.price}>{price}</Text>}
            {infoPrice && <Text style={styles.infoPrice}>{infoPrice}</Text>}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.dialog,
    padding: spacing[6],
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderColor: colors.primary[600],
    borderStyle: 'solid',
    ...scaledShadow({
      shadowColor: '#585858',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 13,
      elevation: 4,
    }),
  },
  containerDefault: {
    borderWidth: 0.25,
  },
  containerSelected: {
    borderWidth: 2,
  },
  content: {
    gap: spacing[4],
  },
  header: {
    gap: scaledSpacing(4),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    color: colors.primary[50],
  },
  subtitle: {
    ...typography.caption,
    color: colors.button.disabledText,
  },
  priceSection: {
    gap: scaledSpacing(4),
  },
  price: {
    ...typography.h2,
    color: colors.gray[50],
  },
  infoPrice: {
    ...typography.caption,
    color: colors.brandPosition[50],
    textAlign: 'center',
    letterSpacing: ms(-0.32, 0.4),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
