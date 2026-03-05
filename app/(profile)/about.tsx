import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { PrudencyLogo } from '@/src/components/ui/PrudencyLogo';
import { appVersion } from '@/src/config/env';
import { scaledIcon, scaledLineHeight, scaledRadius } from '@/src/utils/scaling';

export default function AboutScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  return (
    <DarkScreen scrollable headerTitle="À propos de Prudency">
      {/* Logo + App info */}
      <View style={styles.logoSection}>
        <PrudencyLogo size="lg" />
        <Text style={styles.appName}>Prudency</Text>
        <Text style={styles.tagline}>Ta protection au quotidien !</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      {/* Notre mission */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.missionTitle}>Notre mission</Text>
          <Text style={styles.missionText}>
            Prudency te protège lors de tes déplacements quotidiens en partageant
            ta position avec tes proches de confiance. Simple, discrète et
            rassurante, l'app veille sur toi sans jamais dramatiser.
          </Text>
        </View>
      </View>

      {/* Voir la démo */}
      <Pressable
        style={styles.demoButton}
        onPress={() => setSnackbarVisible(true)}
      >
        <Ionicons name="images-outline" size={scaledIcon(20)} color={colors.white} />
        <Text style={styles.demoButtonText}>Voir la démo</Text>
        <View style={styles.demoArrow}>
          <Ionicons name="chevron-forward" size={scaledIcon(18)} color={colors.primary[400]} />
        </View>
      </Pressable>

      {/* Comment ça marche ? */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Comment ça marche ?</Text>

        <View style={styles.stepsContainer}>
          <StepItem
            number={1}
            title="Crée un trajet"
            description="Définis ta destination et ton heure de départ prévue"
          />
          <StepItem
            number={2}
            title="Choisis une personne de confiance"
            description="Partage ta position uniquement en cas d'urgence ou en temps réel avec une personne de confiance."
          />
          <StepItem
            number={3}
            title="Voyage sereinement"
            description="Si un problème survient (retard, arrêt suspect, changement de direction non notifié), ton contact sera automatiquement alerté"
          />
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        title="Fonctionnalité à venir"
        subtitle="La démo sera disponible prochainement."
        variant="info"
        duration={3000}
        onHide={() => setSnackbarVisible(false)}
      />
    </DarkScreen>
  );
}

function StepItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <View style={styles.stepItem}>
      <Text style={styles.stepTitle}>
        <Text style={styles.stepNumber}>{number}. </Text>
        <Text style={styles.stepTitleBold}>{title}</Text>
      </Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  appName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
    marginTop: spacing[4],
  },
  tagline: {
    ...typography.body,
    color: colors.gray[300],
    marginTop: spacing[1],
  },
  version: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  card: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
  },
  missionTitle: {
    ...typography.h3,
    color: colors.primary[300],
    marginBottom: spacing[3],
  },
  missionText: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  demoButtonText: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  demoArrow: {
    width: scaledIcon(28),
    height: scaledIcon(28),
    borderRadius: scaledRadius(14),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[4],
  },
  stepsContainer: {
    gap: spacing[5],
  },
  stepItem: {
    gap: spacing[1],
  },
  stepNumber: {
    color: colors.primary[300],
    fontWeight: '700',
  },
  stepTitle: {
    ...typography.body,
    lineHeight: scaledLineHeight(20),
  },
  stepTitleBold: {
    ...typography.body,
    color: colors.primary[300],
    fontWeight: '700',
  },
  stepDescription: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
  },
});
