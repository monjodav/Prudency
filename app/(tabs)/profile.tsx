import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import { appVersion } from '@/src/config/env';
import { figmaScale, scaledIcon, ms, scaledSpacing } from '@/src/utils/scaling';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItemProps {
  icon: IoniconsName;
  label: string;
  onPress?: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={scaledIcon(20)} color={colors.primary[300]} />
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.gray[600]} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert('Deconnexion', 'Etes-vous sur de vouloir vous deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se deconnecter',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irreversible. Toutes vos donnees seront supprimees.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // Will call delete account service
          },
        },
      ]
    );
  };

  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? 'Non connecte'}</Text>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="person-outline"
              label="Infos personnelles"
              onPress={() => router.push('/(profile)/personal-info')}
            />
            <MenuItem
              icon="settings-outline"
              label="Preferences"
              onPress={() => router.push('/(profile)/preferences')}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Securite et confidentialite"
              onPress={() => router.push('/(profile)/security')}
            />
            <MenuItem
              icon="card-outline"
              label="Abonnement"
              onPress={() => router.push('/(profile)/subscription')}
            />
          </View>
        </View>

        {/* Help section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistance</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="help-circle-outline" label="Centre d'aide" />
            <MenuItem icon="mail-outline" label="Nous contacter" />
            <MenuItem
              icon="information-circle-outline"
              label="A propos"
              onPress={() => router.push('/(profile)/about')}
            />
          </View>
        </View>

        {/* Logout section */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={scaledIcon(20)}
              color={colors.error[400]}
              style={styles.signOutIcon}
            />
            <Text style={styles.signOutText}>Se deconnecter</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteAccountButton,
              pressed && styles.deleteAccountPressed,
            ]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>Prudency v{appVersion}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[6],
  },
  avatar: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: ms(80, 0.5) / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '600',
  },
  displayName: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  email: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  section: {
    paddingHorizontal: spacing[6],
    marginTop: spacing[6],
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.primary[300],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: scaledSpacing(1),
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  menuIconContainer: {
    width: ms(32, 0.5),
    height: ms(32, 0.5),
    borderRadius: ms(8, 0.5),
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  menuText: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    backgroundColor: 'rgba(202, 31, 31, 0.1)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(202, 31, 31, 0.2)',
    marginBottom: spacing[3],
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutIcon: {
    marginRight: spacing[2],
  },
  signOutText: {
    ...typography.button,
    color: colors.error[400],
    fontWeight: '600',
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  deleteAccountPressed: {
    opacity: 0.7,
  },
  deleteAccountText: {
    ...typography.bodySmall,
    color: colors.error[400],
    textDecorationLine: 'underline',
  },
  version: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: spacing[8],
  },
});
