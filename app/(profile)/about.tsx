import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { appVersion } from '@/src/config/env';
import { ms, scaledRadius, scaledLineHeight, scaledIcon } from '@/src/utils/scaling';

interface LinkItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  url: string;
}

function LinkItem({ icon, title, url }: LinkItemProps) {
  return (
    <Pressable
      style={styles.linkItem}
      onPress={() => Linking.openURL(url)}
    >
      <FontAwesome name={icon} size={scaledIcon(18)} color={colors.gray[600]} style={styles.linkIcon} />
      <Text style={styles.linkText}>{title}</Text>
      <FontAwesome name="external-link" size={scaledIcon(14)} color={colors.gray[400]} />
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoSection}>
        <View style={styles.logo}>
          <View style={styles.shield}>
            <View style={styles.shieldInner} />
          </View>
        </View>
        <Text style={styles.appName}>Prudency</Text>
        <Text style={styles.tagline}>Securite des trajets</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>A propos</Text>
        <Text style={styles.description}>
          Prudency est une application de securite personnelle concue pour proteger
          les femmes lors de leurs deplacements. Elle permet de partager sa position
          en temps reel avec des contacts de confiance et de declencher des alertes
          en cas de danger.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liens utiles</Text>
        <View style={styles.links}>
          <LinkItem
            icon="globe"
            title="Site web"
            url="https://prudency.app"
          />
          <LinkItem
            icon="file-text-o"
            title="Conditions d'utilisation"
            url="https://prudency.app/terms"
          />
          <LinkItem
            icon="shield"
            title="Politique de confidentialite"
            url="https://prudency.app/privacy"
          />
          <LinkItem
            icon="question-circle"
            title="Centre d'aide"
            url="https://prudency.app/help"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        <View style={styles.links}>
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
          <LinkItem
            icon="twitter"
            title="@prudency_app"
            url="https://twitter.com/prudency_app"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} Prudency. Tous droits reserves.
        </Text>
        <Text style={styles.madeWith}>
          Fait avec <FontAwesome name="heart" size={scaledIcon(12)} color={colors.primary[500]} /> en France
        </Text>
      </View>
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
  shieldInner: {
    width: ms(12, 0.5),
    height: ms(12, 0.5),
    backgroundColor: colors.primary[500],
    borderRadius: ms(12, 0.5) / 2,
  },
  appName: {
    ...typography.h1,
    color: colors.gray[900],
  },
  tagline: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing[1],
  },
  version: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    textTransform: 'uppercase',
    marginBottom: spacing[3],
  },
  description: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: scaledLineHeight(24),
  },
  links: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  linkIcon: {
    width: ms(28, 0.5),
  },
  linkText: {
    ...typography.body,
    color: colors.gray[700],
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[8],
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  copyright: {
    ...typography.caption,
    color: colors.gray[500],
  },
  madeWith: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[2],
  },
});
