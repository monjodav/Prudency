import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Snackbar } from '@/src/components/ui/Snackbar';
import { appVersion } from '@/src/config/env';
import { ms, scaledRadius, scaledIcon, scaledLineHeight } from '@/src/utils/scaling';

function LinkItem({
  icon,
  title,
  url,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  url: string;
}) {
  return (
    <Pressable style={styles.linkItem} onPress={() => Linking.openURL(url)}>
      <FontAwesome name={icon} size={scaledIcon(18)} color={colors.gray[400]} style={styles.linkIcon} />
      <Text style={styles.linkText}>{title}</Text>
      <FontAwesome name="external-link" size={scaledIcon(14)} color={colors.gray[500]} />
    </Pressable>
  );
}

function StepItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  return (
    <DarkScreen scrollable>
      <View style={styles.logoSection}>
        <View style={styles.logo}>
          <View style={styles.shield}>
            <Text style={styles.shieldLetter}>P</Text>
          </View>
        </View>
        <Text style={styles.appName}>Prudency</Text>
        <Text style={styles.tagline}>Ta protection au quotidien</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notre mission</Text>
        <View style={styles.card}>
          <Text style={styles.missionText}>
            Prudency est une application de securite personnelle concue pour proteger
            les femmes lors de leurs deplacements. Notre mission est de te permettre de
            te deplacer en toute serenite, en partageant ta position avec tes proches
            et en declenchant des alertes en cas de besoin.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment ca marche</Text>
        <View style={styles.card}>
          <StepItem
            number={1}
            title="Cree un trajet"
            description="Definis ton point de depart, ta destination et ton heure d'arrivee estimee."
          />
          <StepItem
            number={2}
            title="Choisis ton cercle"
            description="Selectionne les personnes de confiance qui seront alertees en cas de probleme."
          />
        </View>
      </View>

      <Pressable
        style={styles.demoButton}
        onPress={() => setSnackbarVisible(true)}
      >
        <FontAwesome name="play-circle" size={scaledIcon(20)} color={colors.white} />
        <Text style={styles.demoButtonText}>Voir la demo</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <View style={styles.linksCard}>
          <LinkItem
            icon="envelope"
            title="support@prudency.app"
            url="mailto:support@prudency.app"
          />
          <LinkItem
            icon="instagram"
            title="@prudency_app"
            url="https://instagram.com/prudency_app"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>
          {new Date().getFullYear()} Prudency. Tous droits reserves.
        </Text>
        <Text style={styles.madeWith}>
          Fait avec amour en France
        </Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        title="Fonctionnalite a venir"
        subtitle="La demo sera disponible prochainement."
        variant="info"
        duration={3000}
        onHide={() => setSnackbarVisible(false)}
      />
    </DarkScreen>
  );
}

const STEP_SIZE = ms(28, 0.4);

const styles = StyleSheet.create({
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    backgroundColor: colors.primary[500],
    borderRadius: scaledRadius(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  shield: {
    width: ms(40, 0.5),
    height: ms(48, 0.5),
    backgroundColor: colors.white,
    borderRadius: scaledRadius(20),
    borderBottomLeftRadius: scaledRadius(24),
    borderBottomRightRadius: scaledRadius(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldLetter: {
    fontSize: ms(24, 0.5),
    fontWeight: '700',
    color: colors.primary[500],
  },
  appName: {
    ...typography.h1,
    color: colors.white,
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
  sectionTitle: {
    ...typography.label,
    color: colors.gray[400],
    textTransform: 'uppercase',
    marginBottom: spacing[3],
  },
  card: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
  },
  missionText: {
    ...typography.body,
    color: colors.gray[300],
    lineHeight: scaledLineHeight(22),
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  stepNumber: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderRadius: STEP_SIZE / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  stepDescription: {
    ...typography.bodySmall,
    color: colors.gray[400],
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.secondary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  demoButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  linksCard: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[950],
  },
  linkIcon: {
    width: ms(28, 0.5),
  },
  linkText: {
    ...typography.body,
    color: colors.gray[300],
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[4],
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.primary[900],
  },
  copyright: {
    ...typography.caption,
    color: colors.gray[500],
  },
  madeWith: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[2],
  },
});
