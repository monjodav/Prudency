import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { typography } from '@/src/theme/typography';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledLineHeight } from '@/src/utils/scaling';

export default function TermsScreen() {
  return (
    <DarkScreen scrollable headerTitle="Conditions Générales d'Utilisation">
      <Text style={styles.bold}>Objet</Text>
      <Text style={styles.body}>
        Les présentes conditions définissent les règles d'utilisation de l'application Prudency.
      </Text>

      <Text style={styles.bold}>Accès au service</Text>
      <Text style={styles.body}>
        Prudency est accessible gratuitement avec des fonctionnalités limitées.
      </Text>
      <Text style={styles.body}>
        Certaines fonctionnalités avancées sont disponibles via un abonnement payant.
      </Text>

      <Text style={styles.bold}>Responsabilité</Text>
      <Text style={styles.body}>
        Prudency est un outil d'assistance à la vigilance et à la prévention.
      </Text>
      <Text style={styles.body}>
        L'application ne se substitue en aucun cas aux services d'urgence ou aux autorités compétentes.
      </Text>

      <Text style={styles.bold}>Utilisation des alertes</Text>
      <Text style={styles.body}>
        Les alertes publiées doivent refléter une situation réelle.
      </Text>
      <Text style={styles.body}>
        Tout usage abusif peut entraîner une suspension du compte.
      </Text>

      <Text style={styles.bold}>Modification du service</Text>
      <Text style={styles.body}>
        Prudency se réserve le droit de faire évoluer ses fonctionnalités à tout moment.
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
