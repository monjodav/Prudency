import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/services/supabaseClient';
import { appVersion } from '@/src/config/env';

interface MenuItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, danger = false }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <FontAwesome
        name={icon}
        size={18}
        color={danger ? colors.error[500] : colors.gray[600]}
        style={styles.menuIcon}
      />
      <Text style={[styles.menuText, danger && styles.menuTextDanger]}>
        {label}
      </Text>
      <FontAwesome name="chevron-right" size={12} color={colors.gray[400]} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
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
            // Placeholder: will call delete account service
          },
        },
      ]
    );
  };

  const emailInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{emailInitial}</Text>
        </View>
        <Text style={styles.email}>{user?.email ?? 'Non connecte'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon compte</Text>
        <MenuItem
          icon="user"
          label="Infos personnelles"
          onPress={() => router.push('/(profile)/personal-info')}
        />
        <MenuItem
          icon="sliders"
          label="Preferences"
          onPress={() => router.push('/(profile)/preferences')}
        />
        <MenuItem
          icon="lock"
          label="Securite et confidentialite"
          onPress={() => router.push('/(profile)/security')}
        />
        <MenuItem
          icon="credit-card"
          label="Abonnement"
          onPress={() => router.push('/(profile)/subscription')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistance</Text>
        <MenuItem icon="question-circle" label="Centre d'aide" />
        <MenuItem icon="envelope" label="Nous contacter" />
        <MenuItem
          icon="info-circle"
          label="A propos"
          onPress={() => router.push('/(profile)/about')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
          onPress={handleSignOut}
        >
          <FontAwesome
            name="sign-out"
            size={18}
            color={colors.error[600]}
            style={styles.menuIcon}
          />
          <Text style={styles.signOutText}>Se deconnecter</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Supprimer mon compte</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>Prudency v{appVersion}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing[10],
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
  section: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemPressed: {
    backgroundColor: colors.gray[50],
  },
  menuIcon: {
    width: 28,
    marginRight: spacing[3],
  },
  menuText: {
    ...typography.body,
    color: colors.gray[900],
    flex: 1,
  },
  menuTextDanger: {
    color: colors.error[600],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    ...typography.button,
    color: colors.error[600],
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.error[400],
    textDecorationLine: 'underline',
  },
  version: {
    ...typography.caption,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing[8],
  },
});
