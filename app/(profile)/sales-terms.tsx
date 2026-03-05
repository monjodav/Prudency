import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { typography } from '@/src/theme/typography';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledLineHeight } from '@/src/utils/scaling';

export default function SalesTermsScreen() {
  return (
    <DarkScreen scrollable headerTitle="Conditions Générales de Vente">
      <Text style={styles.bold}>Abonnements</Text>
      <Text style={styles.body}>
        Prudency propose un abonnement payant donnant accès à des fonctionnalités avancées.
      </Text>

      <Text style={styles.bold}>Paiement</Text>
      <Text style={styles.body}>
        Le paiement est effectué via les plateformes Apple ou Google selon l'appareil utilisé.
      </Text>

      <Text style={styles.bold}>Renouvellement</Text>
      <Text style={styles.body}>
        L'abonnement est renouvelé automatiquement sauf résiliation avant la date d'échéance.
      </Text>

      <Text style={styles.bold}>Résiliation</Text>
      <Text style={styles.body}>
        La résiliation se fait depuis les réglages du compte Apple ou Google de l'utilisateur.
      </Text>

      <Text style={styles.bold}>Remboursement</Text>
      <Text style={styles.body}>
        Les conditions de remboursement dépendent des règles appliquées par les stores Apple et Google.
      </Text>
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
  bold: {
    ...typography.body,
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  body: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
    marginBottom: spacing[3],
  },
});
