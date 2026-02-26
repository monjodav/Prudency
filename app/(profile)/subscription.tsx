import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { ms, scaledIcon, scaledSpacing, scaledLineHeight } from '@/src/utils/scaling';

const FEATURES = [
  'Garder mon trajet secret',
  'Ajout de notes',
  'Détection d\'anomalie durant le trajet',
  'Envoie alerte à ta/tes personne(s) de confiance',
] as const;

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'plus'>('standard');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleActivatePlus = () => {
    setSnackbarVisible(true);
  };

  return (
    <DarkScreen scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>Mon abonnement</Text>
        <Text style={styles.subtitle}>
          Tu utilises actuellement Prudency en version Standard.
        </Text>
      </View>

      <View style={styles.plans}>
        <PlanOption
          label="Standard"
          badge="Gratuit"
          badgeColor={colors.success[500]}
          selected={selectedPlan === 'standard'}
          onPress={() => setSelectedPlan('standard')}
        />
        <PlanOption
          label="Prudency Plus"
          note="Fonctionnalités à venir"
          selected={selectedPlan === 'plus'}
          onPress={() => {
            setSelectedPlan('plus');
            setSnackbarVisible(true);
          }}
          disabled
        />
      </View>

      <View style={styles.featuresCard}>
        <View style={styles.featuresHeader}>
          <Text style={styles.featuresTitle}>Standard</Text>
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Gratuit</Text>
          </View>
        </View>
        {FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <FontAwesome name="check" size={scaledIcon(14)} color={colors.success[500]} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        Abonnement mensuel sans engagement, résiliable à tout moment. En continuant, tu acceptes les CGU, CGV et la Politique de confidentialité.
      </Text>

      <Button
        title="Activer le Prudency Plus"
        onPress={handleActivatePlus}
        fullWidth
        style={styles.ctaButton}
      />

      <Snackbar
        visible={snackbarVisible}
        title="Fonctionnalité à venir"
        subtitle="Les abonnements seront disponibles prochainement."
        variant="info"
        duration={3000}
        onHide={() => setSnackbarVisible(false)}
      />
    </DarkScreen>
  );
}

function PlanOption({
  label,
  badge,
  badgeColor,
  note,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  badge?: string;
  badgeColor?: string;
  note?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.planOption, selected && styles.planOptionSelected, disabled && styles.planDisabled]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.planContent}>
        <Text style={[styles.planLabel, disabled && styles.planLabelDisabled]}>{label}</Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        {note ? <Text style={styles.planNote}>{note}</Text> : null}
      </View>
    </Pressable>
  );
}

const RADIO_SIZE = ms(22, 0.4);
const DOT_SIZE = ms(12, 0.4);

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[6],
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[300],
    marginTop: spacing[2],
  },
  plans: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: colors.primary[900],
  },
  planOptionSelected: {
    borderColor: colors.primary[400],
  },
  planDisabled: {
    opacity: 0.5,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.gray[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  radioSelected: {
    borderColor: colors.primary[400],
  },
  radioDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary[400],
  },
  planContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  planLabel: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  planLabelDisabled: {
    color: colors.gray[400],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: scaledSpacing(2),
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  planNote: {
    ...typography.caption,
    color: colors.gray[400],
    width: '100%',
  },
  featuresCard: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[6],
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.white,
  },
  freeBadge: {
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[3],
    paddingVertical: scaledSpacing(2),
    borderRadius: borderRadius.full,
  },
  freeBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  featureText: {
    ...typography.body,
    color: colors.gray[300],
  },
  disclaimer: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing[5],
    lineHeight: scaledLineHeight(18),
  },
  ctaButton: {
    marginBottom: spacing[4],
  },
});
