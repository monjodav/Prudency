import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon, scaledShadow, ms } from '@/src/utils/scaling';
import { Tag } from '@/src/components/ui/Tag';
import { Radio } from '@/src/components/ui/Radio';
import { Button } from '@/src/components/ui/Button';

interface ForfaitFeature {
  icon: string;
  label: string;
  includedFree: boolean;
  includedPremium: boolean;
}

type ForfaitVariant = 'free' | 'premium' | 'mvp';

interface ForfaitCardProps {
  variant?: ForfaitVariant;
  features?: ForfaitFeature[];
  onActivate?: () => void;
  legalText?: string;
  style?: ViewStyle;
}

export function ForfaitCard({
  variant = 'free',
  features = [],
  onActivate,
  legalText,
  style,
}: ForfaitCardProps) {
  const isPremium = variant === 'premium';
  const title = isPremium ? 'Prudency Plus' : 'Standard';
  const tagLabel = isPremium ? 'Premium' : 'Gratuit';
  const tagVariant = isPremium ? 'blue' : 'default';

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Tag label={tagLabel} variant={tagVariant} />
        </View>

        {/* Features */}
        {variant !== 'mvp' && (
          <View style={styles.featureHeaders}>
            <Text style={styles.columnLabel}>Standard</Text>
            <Text style={styles.columnLabel}>Plus</Text>
          </View>
        )}

        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureInfo}>
                <Ionicons
                  name={feature.icon as keyof typeof Ionicons.glyphMap}
                  size={scaledIcon(24)}
                  color={colors.white}
                />
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
              {variant !== 'mvp' ? (
                <View style={styles.radioGroup}>
                  <Radio
                    selected={feature.includedFree}
                    onSelect={() => {}}
                  />
                  <Radio
                    selected={feature.includedPremium}
                    onSelect={() => {}}
                  />
                </View>
              ) : (
                <Radio
                  selected={feature.includedFree}
                  onSelect={() => {}}
                />
              )}
            </View>
          ))}
        </View>

        {/* CTA */}
        {onActivate && (
          <View style={styles.ctaSection}>
            {legalText && <Text style={styles.legalText}>{legalText}</Text>}
            <Button
              title="Activer la Prudency Plus"
              variant={isPremium ? 'primary' : 'primary'}
              onPress={onActivate}
              fullWidth
              disabled={!isPremium}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 0.25,
    borderColor: colors.primary[600],
    borderRadius: borderRadius.dialog,
    overflow: 'hidden',
    ...scaledShadow({
      shadowColor: '#585858',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 13,
      elevation: 4,
    }),
  },
  content: {
    padding: spacing[6],
    gap: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    color: colors.primary[50],
  },
  featureHeaders: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: ms(32, 0.4),
    paddingHorizontal: spacing[1],
  },
  columnLabel: {
    ...typography.caption,
    color: colors.primary[50],
  },
  featureList: {
    gap: spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  featureLabel: {
    ...typography.bodySmall,
    color: colors.white,
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: ms(48, 0.4),
  },
  ctaSection: {
    gap: spacing[2],
    alignItems: 'center',
  },
  legalText: {
    ...typography.caption,
    color: 'rgba(246, 246, 246, 0.6)',
    textAlign: 'center',
    letterSpacing: ms(-0.08, 0.4),
  },
});
