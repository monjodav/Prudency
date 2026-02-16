import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prudency</Text>
        <Text style={styles.subtitle}>Sécurité des trajets</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Écran de connexion - À implémenter en Phase 2
        </Text>
        <Link href="/(auth)/register" style={styles.link}>
          Créer un compte
        </Link>
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
  header: {
    paddingTop: spacing[20],
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary[500],
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
  },
  placeholder: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
  link: {
    ...typography.button,
    color: colors.primary[500],
    marginTop: spacing[4],
  },
});
