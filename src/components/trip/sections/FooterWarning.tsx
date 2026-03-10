import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';

export function FooterWarning() {
  return (
    <Text style={styles.footerWarning}>
      Tu disposes de 15 minutes pour finaliser ton trajet. Passé ce délai, une alerte sera envoyée à ta personne de confiance.
    </Text>
  );
}

const styles = StyleSheet.create({
  footerWarning: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
  },
});
