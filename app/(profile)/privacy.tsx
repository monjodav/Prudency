import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { typography } from '@/src/theme/typography';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledLineHeight } from '@/src/utils/scaling';

export default function PrivacyScreen() {
  return (
    <DarkScreen scrollable headerTitle="Politique de confidentialité">
      <Text style={styles.body}>
        La protection de tes données est une priorité pour Prudency.
      </Text>

      <Text style={styles.bold}>Données collectées</Text>
      <Text style={styles.body}>
        Prudency peut collecter les données suivantes :
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>
          {'\u2022'} Données de localisation (lors de l'utilisation des trajets)
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Données de compte (email, numéro de téléphone)
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Données liées aux trajets et alertes
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Contenus partagés volontairement (commentaires, photos, vidéos)
        </Text>
      </View>

      <Text style={styles.bold}>Utilisation des données</Text>
      <Text style={styles.body}>
        Ces données sont utilisées uniquement pour :
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>{'\u2022'} Assurer le suivi des trajets</Text>
        <Text style={styles.listItem}>
          {'\u2022'} Envoyer des alertes aux contacts de confiance
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Améliorer la sécurité et l'expérience utilisateur
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Fournir les fonctionnalités de l'application
        </Text>
      </View>

      <Text style={styles.bold}>Partage des données</Text>
      <Text style={styles.body}>
        Les données ne sont jamais vendues.{'\n'}
        Elles peuvent être partagées uniquement :
      </Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>
          {'\u2022'} Avec les contacts de confiance choisis par l'utilisateur
        </Text>
        <Text style={styles.listItem}>
          {'\u2022'} Lorsque cela est nécessaire au bon fonctionnement du service
        </Text>
      </View>

      <Text style={styles.bold}>Conservation des données</Text>
      <Text style={styles.body}>
        Les données sont conservées pendant la durée strictement nécessaire à leur usage.
      </Text>

      <Text style={styles.bold}>Droits de l'utilisateur</Text>
      <Text style={styles.body}>Tu peux à tout moment :</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>{'\u2022'} Accéder à tes données</Text>
        <Text style={styles.listItem}>{'\u2022'} Les modifier</Text>
        <Text style={styles.listItem}>{'\u2022'} Demander leur suppression</Text>
      </View>
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
  list: {
    marginBottom: spacing[3],
    paddingLeft: spacing[2],
  },
  listItem: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
    marginBottom: spacing[1],
  },
});
