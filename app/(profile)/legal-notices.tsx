import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { typography } from '@/src/theme/typography';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledLineHeight } from '@/src/utils/scaling';

const PINK = '#FF00FF';

export default function LegalNoticesScreen() {
  return (
    <DarkScreen scrollable headerTitle="Mentions légales">
      <Text style={styles.bold}>Éditeur de l'application</Text>
      <Text style={styles.body}>Prudency</Text>
      <Text style={styles.body}>
        Application mobile de sécurité et d'accompagnement des déplacements.
      </Text>

      <Text style={styles.body}>
        Éditeur : Prudency{'\n'}
        Statut juridique : <Text style={styles.pink}>Société fictive</Text>{'\n'}
        Adresse : <Text style={styles.pink}>Adresse fictive</Text>{'\n'}
        Email : contact@prudency.app
      </Text>

      <Text style={styles.bold}>Hébergement</Text>
      <Text style={styles.body}>
        L'application est hébergée par un prestataire tiers (données fictives).
      </Text>

      <Text style={styles.bold}>Responsabilité</Text>
      <Text style={styles.body}>
        Prudency fournit des outils d'assistance à la sécurité personnelle.{'\n'}
        L'application ne remplace ni les services d'urgence, ni les autorités compétentes.{'\n'}
        L'utilisateur reste responsable de ses déplacements et décisions.
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
  pink: {
    color: PINK,
  },
});
