import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';

export default function ActiveTripScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Écran de trajet actif - À implémenter en Phase 2
        </Text>
        <Text style={styles.description}>
          Carte temps réel, statut trajet, bouton d'alerte
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  placeholder: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
  description: {
    ...typography.bodySmall,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
