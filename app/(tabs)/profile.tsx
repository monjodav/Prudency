import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email ?? 'Non connecté'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Paramètres</Text>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Confidentialité</Text>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuText}>À propos</Text>
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
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
    alignItems: 'center',
    paddingVertical: spacing[8],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
  },
  email: {
    ...typography.body,
    color: colors.gray[600],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    marginBottom: spacing[4],
    textTransform: 'uppercase',
  },
  menuItem: {
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuText: {
    ...typography.body,
    color: colors.gray[900],
  },
  signOutButton: {
    marginTop: spacing[8],
    paddingVertical: spacing[4],
    alignItems: 'center',
    backgroundColor: colors.error[50],
    borderRadius: spacing[2],
  },
  signOutText: {
    ...typography.button,
    color: colors.error[600],
  },
});
