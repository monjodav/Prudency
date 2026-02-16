import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    features: [
      { text: '3 contacts de confiance', included: true },
      { text: 'Trajets illimites', included: true },
      { text: 'Alertes manuelles', included: true },
      { text: 'Alertes automatiques', included: false },
      { text: 'Historique 7 jours', included: true },
      { text: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '4,99€',
    period: '/mois',
    recommended: true,
    features: [
      { text: '5 contacts de confiance', included: true },
      { text: 'Trajets illimites', included: true },
      { text: 'Alertes manuelles', included: true },
      { text: 'Alertes automatiques', included: true },
      { text: 'Historique 30 jours', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
];

export default function SubscriptionScreen() {
  const [currentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const handleSubscribe = () => {
    // Placeholder: open subscription flow
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Choisissez votre plan</Text>
        <Text style={styles.subtitle}>
          Debloquez toutes les fonctionnalites pour une protection optimale
        </Text>
      </View>

      <View style={styles.plans}>
        {PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.recommended && styles.planCardRecommended,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommande</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <FontAwesome
                    name={feature.included ? 'check' : 'times'}
                    size={14}
                    color={feature.included ? colors.success[500] : colors.gray[400]}
                  />
                  <Text
                    style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled,
                    ]}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>

            {currentPlan === plan.id && (
              <Badge label="Plan actuel" variant="info" />
            )}
          </Pressable>
        ))}
      </View>

      {selectedPlan !== currentPlan && (
        <View style={styles.footer}>
          <Button
            title={selectedPlan === 'premium' ? 'Passer a Premium' : 'Passer au plan gratuit'}
            onPress={handleSubscribe}
            fullWidth
          />
          <Text style={styles.disclaimer}>
            Vous pouvez annuler a tout moment. Les paiements sont securises.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing[6],
  },
  header: {
    marginBottom: spacing[8],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing[2],
  },
  plans: {
    gap: spacing[4],
  },
  planCard: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  planCardRecommended: {
    borderColor: colors.primary[500],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  recommendedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  planName: {
    ...typography.h3,
    color: colors.gray[900],
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    ...typography.h2,
    color: colors.primary[500],
  },
  planPeriod: {
    ...typography.caption,
    color: colors.gray[500],
  },
  planFeatures: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  featureText: {
    ...typography.body,
    color: colors.gray[700],
  },
  featureTextDisabled: {
    color: colors.gray[400],
  },
  footer: {
    marginTop: spacing[8],
  },
  disclaimer: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[4],
  },
});
