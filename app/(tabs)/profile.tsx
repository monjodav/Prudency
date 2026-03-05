import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { useAuth } from '@/src/hooks/useAuth';
import { usePremium } from '@/src/hooks/usePremium';
import { getProfile } from '@/src/services/authService';
import { LogoutDialog } from '@/src/components/profile/LogoutDialog';
import { ms, mvs, scaledRadius, scaledIcon } from '@/src/utils/scaling';
import { ScreenBackground } from '@/src/components/ui/ScreenBackground';

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
      <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.primary[300]} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { isPremium } = usePremium();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const handleLogoutConfirm = async () => {
    setLogoutDialogVisible(false);
    await signOut();
  };

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top + mvs(16, 0.3), paddingBottom: insets.bottom + mvs(90, 0.4) }]}>
      <ScreenBackground />
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{isPremium ? 'Prudency Plus' : 'Membre Prudency'}</Text>
        </View>
      </View>

      {/* Tes informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tes informations</Text>
        <MenuItem
          icon="person-outline"
          label="Infos personnelles"
          onPress={() => router.push('/(profile)/personal-info')}
        />
        <MenuItem
          icon="image-outline"
          label="À propos de Prudency"
          onPress={() => router.push('/(profile)/about')}
        />
      </View>

      {/* Adapte Prudency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adapte Prudency à ton usage</Text>
        <MenuItem
          icon="options-outline"
          label="Préférences"
          onPress={() => router.push('/(profile)/preferences')}
        />
      </View>

      {/* Sécurité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurise Prudency à ton niveau</Text>
        <MenuItem
          icon="settings-outline"
          label="Sécurité et confidentialité"
          onPress={() => router.push('/(profile)/security')}
        />
      </View>

      {/* Clôture */}
      <View style={styles.logoutSection}>
        <Text style={styles.sectionTitle}>Clôture du compte</Text>
        <Pressable
          style={({ pressed }) => [styles.menuItem, styles.logoutItem, pressed && styles.menuItemPressed]}
          onPress={() => setLogoutDialogVisible(true)}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={scaledIcon(20)} color={colors.error[400]} />
          </View>
          <Text style={styles.logoutText}>Déconnexion</Text>
          <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.error[400]} />
        </Pressable>
      </View>

      {/* Navigation footer */}
      <View style={[styles.navFooter, { bottom: insets.bottom + spacing[2] }]}>
        <Pressable style={[styles.navItemActive, styles.navItemLeft]}>
          <Ionicons name="person" size={scaledIcon(20)} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.navItemInactive}
          onPress={() => router.replace('/')}
        >
          <View style={styles.navDot} />
        </Pressable>
        <Pressable
          style={[styles.navItemInactive, styles.navItemRight]}
          onPress={() => Alert.alert('Abonnement', 'Bientôt disponible')}
        >
          <Ionicons name="star" size={scaledIcon(20)} color={colors.gray[400]} />
        </Pressable>
      </View>

      <LogoutDialog
        visible={logoutDialogVisible}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutDialogVisible(false)}
      />
    </View>
  );
}

const AVATAR_SIZE = ms(90, 0.4);
const RING_SIZE = AVATAR_SIZE + ms(10, 0.4);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: mvs(12, 0.3),
    paddingHorizontal: spacing[6],
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: mvs(10, 0.3),
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '600',
  },
  displayName: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '600',
    marginBottom: mvs(6, 0.3),
  },
  badge: {
    paddingHorizontal: spacing[4],
    paddingVertical: mvs(3, 0.3),
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary[300],
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing[6],
    marginTop: mvs(14, 0.3),
    gap: mvs(8, 0.3),
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: mvs(12, 0.3),
    paddingHorizontal: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  logoutSection: {
    marginTop: 'auto',
    paddingHorizontal: spacing[6],
    marginBottom: mvs(16, 0.3),
    gap: mvs(8, 0.3),
  },
  logoutItem: {
    backgroundColor: 'rgba(202, 31, 31, 0.08)',
    borderColor: 'rgba(202, 31, 31, 0.2)',
  },
  logoutIconContainer: {
    width: ms(32, 0.5),
    height: ms(32, 0.5),
    borderRadius: ms(8, 0.5),
    backgroundColor: 'rgba(202, 31, 31, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  logoutText: {
    ...typography.body,
    color: colors.error[400],
    flex: 1,
  },
  navFooter: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(10, 10, 20, 0.9)',
    borderRadius: scaledRadius(28),
    overflow: 'hidden',
    zIndex: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navItemInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3] + spacing[2],
  },
  navItemLeft: {
    borderRightWidth: 1,
  },
  navItemRight: {
    borderLeftWidth: 1,
  },
  navDot: {
    width: ms(12, 0.4),
    height: ms(12, 0.4),
    borderRadius: ms(6, 0.4),
    backgroundColor: colors.brandPosition[50],
    borderWidth: 2,
    borderColor: 'rgba(204, 99, 249, 0.4)',
  },
});
