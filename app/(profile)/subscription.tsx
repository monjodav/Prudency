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
import { usePremium } from '@/src/hooks/usePremium';

const FREE_FEATURES = [
  { label: '1 personne de confiance', icon: 'user' as const },
  { label: 'Trajet avec suivi GPS', icon: 'map-marker' as const },
  { label: 'Bouton d\'alerte manuelle', icon: 'exclamation-circle' as const },
  { label: 'Partage de position', icon: 'share-alt' as const },
] as const;

const PREMIUM_FEATURES = [
  { label: 'Jusqu\'a 5 personnes de confiance', icon: 'users' as const },
  { label: 'Notes de trajet chiffrees', icon: 'lock' as const },
  { label: 'Detection d\'anomalies (detour, retard)', icon: 'shield' as const },
  { label: 'Historique complet des trajets', icon: 'history' as const },
  { label: 'Nettoyage auto des donnees anciennes', icon: 'trash' as const },
] as const;

export default function SubscriptionScreen() {
  const { isPremium, isLoading, activate, isActivating } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'plus'>(
    isPremium ? 'plus' : 'standard',
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({
    title: '',
    subtitle: '',
    variant: 'info' as 'info' | 'success' | 'error',
  });

  const handleActivatePlus = async () => {
    try {
      await activate();
      setSnackbarMessage({
        title: 'Prudency Plus active',
        subtitle: 'Tu beneficies maintenant de toutes les fonctionnalites.',
        variant: 'success',
      });
    } catch {
      setSnackbarMessage({
        title: 'Erreur',
        subtitle: 'Impossible d\'activer Prudency Plus pour le moment.',
        variant: 'error',
      });
    }
    setSnackbarVisible(true);
  };

  const currentPlanLabel = isPremium
    ? 'Tu utilises actuellement Prudency Plus.'
    : 'Tu utilises actuellement Prudency en version Standard.';

  return (
    <DarkScreen scrollable headerTitle="Mon abonnement">
      <View style={styles.header}>
        <Text style={styles.title}>Mon abonnement</Text>
        <Text style={styles.subtitle}>{currentPlanLabel}</Text>
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
          badge={isPremium ? 'Actif' : undefined}
          badgeColor={isPremium ? colors.primary[400] : undefined}
          selected={selectedPlan === 'plus'}
          onPress={() => setSelectedPlan('plus')}
        />
      </View>

      {selectedPlan === 'standard' ? (
        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>Standard</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Gratuit</Text>
            </View>
          </View>
          {FREE_FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <FontAwesome name={feature.icon} size={scaledIcon(14)} color={colors.success[500]} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Text style={styles.featuresTitle}>Prudency Plus</Text>
            <View style={[styles.freeBadge, { backgroundColor: colors.primary[400] }]}>
              <Text style={styles.freeBadgeText}>Premium</Text>
            </View>
          </View>
          <Text style={styles.includesText}>Tout le Standard, plus :</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <FontAwesome name={feature.icon} size={scaledIcon(14)} color={colors.primary[300]} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>
        Abonnement mensuel sans engagement, resiliable a tout moment. En continuant, tu acceptes les CGU, CGV et la Politique de confidentialite.
      </Text>

      {!isPremium && selectedPlan === 'plus' && (
        <Button
          title="Activer le Prudency Plus"
          onPress={handleActivatePlus}
          fullWidth
          style={styles.ctaButton}
          loading={isActivating || isLoading}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        title={snackbarMessage.title}
        subtitle={snackbarMessage.subtitle}
        variant={snackbarMessage.variant}
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
  selected,
  onPress,
}: {
  label: string;
  badge?: string;
  badgeColor?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.planOption, selected && styles.planOptionSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.planContent}>
        <Text style={styles.planLabel}>{label}</Text>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
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
  includesText: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[2],
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
