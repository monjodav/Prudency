import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';

export default function ContactsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts de confiance</Text>
        <Text style={styles.subtitle}>
          Ajoutez jusqu'à 5 personnes à prévenir en cas d'alerte
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Liste des contacts - À implémenter en Phase 2
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
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing[2],
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
});
