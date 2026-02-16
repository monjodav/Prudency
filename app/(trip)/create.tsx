import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';

export default function CreateTripScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Écran de création de trajet - À implémenter en Phase 2
        </Text>
        <Text style={styles.description}>
          Configuration de la durée estimée et des adresses
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[6],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
