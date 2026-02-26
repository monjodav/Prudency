import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { useBiometric } from '@/src/hooks/useBiometric';
import { useAuth } from '@/src/hooks/useAuth';
import * as authService from '@/src/services/authService';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

function mapPermissionStatus(status: string): PermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function usePermissionStatuses() {
  const [location, setLocation] = useState<PermissionStatus>('undetermined');
  const [notifications, setNotifications] = useState<PermissionStatus>('undetermined');
  const [camera, setCamera] = useState<PermissionStatus>('undetermined');

  const refresh = useCallback(async () => {
    const [loc, notif] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Notifications.getPermissionsAsync(),
    ]);
    setLocation(mapPermissionStatus(loc.status));
    setNotifications(mapPermissionStatus(notif.status));
    setCamera('undetermined');
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { location, notifications, camera, refresh };
}

function openSystemSettings() {
  if (Platform.OS === 'ios') {
    void Linking.openURL('app-settings:');
  } else {
    void Linking.openSettings();
  }
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

function SettingRow({ icon, title, description, trailing, onPress }: SettingRowProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container style={styles.settingItem} onPress={onPress}>
      <FontAwesome name={icon} size={scaledIcon(20)} color={colors.gray[400]} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      {trailing}
      {onPress && !trailing ? (
        <FontAwesome name="chevron-right" size={scaledIcon(12)} color={colors.gray[500]} />
      ) : null}
    </Container>
  );
}

function PermissionToggle({
  label,
  status,
  icon,
}: {
  label: string;
  status: PermissionStatus;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}) {
  const isGranted = status === 'granted';
  const statusLabel = isGranted ? 'Actif' : 'Désactivé';

  return (
    <SettingRow
      icon={icon}
      title={label}
      description={statusLabel}
      onPress={openSystemSettings}
      trailing={
        <Switch
          value={isGranted}
          onValueChange={openSystemSettings}
          trackColor={{ false: colors.gray[700], true: colors.primary[400] }}
          thumbColor={isGranted ? colors.primary[500] : colors.gray[400]}
        />
      }
    />
  );
}

export default function SecurityScreen() {
  const { isAvailable, isEnabled: biometricEnabled, setEnabled: setBiometricEnabled } = useBiometric();
  const { signOut } = useAuth();
  const permissions = usePermissionStatuses();

  const handleChangePassword = () => {
    Alert.alert(
      'Changer le mot de passe',
      'Un email te sera envoyé pour réinitialiser ton mot de passe.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => {
            Alert.alert('Email envoye', 'Vérifie ta boîte mail.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes tes données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              await signOut();
            } catch {
              Alert.alert(
                'Erreur',
                'La suppression du compte a échoué. Réessaie.',
              );
            }
          },
        },
      ]
    );
  };

  const showComingSoon = () => {
    Alert.alert('Page en construction', 'Cette page sera disponible prochainement.');
  };

  return (
    <DarkScreen scrollable>
      <Section title="Autorisations systeme">
        <PermissionToggle label="Localisation" status={permissions.location} icon="map-marker" />
        <PermissionToggle label="Notifications" status={permissions.notifications} icon="bell" />
        <PermissionToggle label="Camera" status={permissions.camera} icon="camera" />
      </Section>

      <Section title="Authentification">
        <SettingRow
          icon="lock"
          title="Biometrie"
          description="Face ID / Touch ID pour confirmer tes trajets"
          trailing={
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => void setBiometricEnabled(value)}
              disabled={!isAvailable}
              trackColor={{ false: colors.gray[700], true: colors.primary[400] }}
              thumbColor={biometricEnabled ? colors.primary[500] : colors.gray[400]}
            />
          }
        />
        <SettingRow
          icon="lock"
          title="Changer le mot de passe"
          onPress={handleChangePassword}
        />
      </Section>

      <Section title="Informations légales">
        <SettingRow icon="file-text-o" title="Mentions légales" onPress={showComingSoon} />
        <SettingRow icon="file-text-o" title="CGU" onPress={showComingSoon} />
        <SettingRow icon="shield" title="Politique de confidentialité" onPress={showComingSoon} />
        <SettingRow icon="file-text-o" title="CGV" onPress={showComingSoon} />
      </Section>

      <Section title="Zone de danger">
        <View style={styles.dangerContent}>
          <Text style={styles.dangerDescription}>
            La suppression de ton compte est irréversible. Toutes tes données, trajets et contacts seront supprimés.
          </Text>
          <Button
            title="Supprimer mon compte"
            variant="danger"
            onPress={handleDeleteAccount}
            fullWidth
          />
        </View>
      </Section>
    </DarkScreen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[400],
    textTransform: 'uppercase',
    paddingVertical: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[950],
  },
  settingIcon: {
    width: ms(28, 0.5),
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  settingTitle: {
    ...typography.body,
    color: colors.white,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[1],
  },
  dangerContent: {
    padding: spacing[4],
  },
  dangerDescription: {
    ...typography.bodySmall,
    color: colors.gray[300],
    marginBottom: spacing[4],
  },
});
