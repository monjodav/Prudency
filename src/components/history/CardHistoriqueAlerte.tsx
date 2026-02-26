import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledFontSize, ms } from '@/src/utils/scaling';
import { TagAlerte } from '@/src/components/alert/TagAlerte';

type AlertHistoryStatus = 'active' | 'resolved' | 'expired' | 'deleted';

interface CardHistoriqueAlerteProps {
  emoji: string;
  title: string;
  description: string;
  date: string;
  status: AlertHistoryStatus;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CardHistoriqueAlerte({
  emoji,
  title,
  description,
  date,
  status,
  onPress,
  style,
}: CardHistoriqueAlerteProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.description} numberOfLines={1}>
                {description}
              </Text>
            </View>
          </View>
          <TagAlerte variant={status} />
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary[900],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    gap: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  emoji: {
    fontSize: scaledFontSize(20),
    width: ms(24, 0.4),
    textAlign: 'center',
  },
  headerText: {
    flex: 1,
    gap: scaledSpacing(2),
  },
  title: {
    ...typography.bodySmall,
    color: colors.white,
  },
  description: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.6,
  },
  date: {
    ...typography.caption,
    color: colors.button.disabledText,
  },
  pressed: {
    opacity: 0.7,
  },
});
