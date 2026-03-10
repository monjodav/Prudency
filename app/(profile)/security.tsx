import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { scaledIcon, scaledSpacing } from '@/src/utils/scaling';
import { openSettings } from '@/src/utils/systemUtils';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function mapStatus(status: string): PermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function statusLabel(status: PermissionStatus, grantedLabel = 'Activées'): string {
  if (status === 'granted') return grantedLabel;
  return 'Désactivées';
}

function usePermissions() {
  const [location, setLocation] = useState<PermissionStatus>('undetermined');
  const [locationBg, setLocationBg] = useState<PermissionStatus>('undetermined');
  const [notifications, setNotifications] = useState<PermissionStatus>('undetermined');
  const [camera, setCamera] = useState<PermissionStatus>('undetermined');
  const [contacts, setContacts] = useState<PermissionStatus>('undetermined');

  const refresh = useCallback(async () => {
    const [loc, locBg, notif, cam, ct] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.getBackgroundPermissionsAsync(),
      Notifications.getPermissionsAsync(),
      ImagePicker.getCameraPermissionsAsync(),
      Contacts.getPermissionsAsync(),
    ]);
    setLocation(mapStatus(loc.status));
    setLocationBg(mapStatus(locBg.status));
    setNotifications(mapStatus(notif.status));
    setCamera(mapStatus(cam.status));
    setContacts(mapStatus(ct.status));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { location, locationBg, notifications, camera, contacts, refresh };
}

interface RowProps {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

function Row({ icon, label, subtitle, onPress }: RowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={scaledIcon(18)} color={colors.primary[300]} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={scaledIcon(16)} color={colors.gray[500]} />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function SecurityScreen() {
  const router = useRouter();
  const perms = usePermissions();

  const locationLabel =
    perms.locationBg === 'granted'
      ? 'Toujours activée'
      : perms.location === 'granted'
        ? "Lorsque l'app est ouverte"
        : 'Désactivée';


  const showComingSoon = () => {
    Alert.alert('Page en construction', 'Cette page sera disponible prochainement.');
  };

  return (
    <DarkScreen scrollable headerTitle="Sécurité et confidentialité">
      {/* Autorisations système */}
      <SectionHeader title="Autorisations système" />
      <Row
        icon="location-outline"
        label="Service de localisation"
        subtitle={locationLabel}
        onPress={openSettings}
      />
      <Row
        icon="notifications-outline"
        label="Notifications"
        subtitle={statusLabel(perms.notifications)}
        onPress={openSettings}
      />
      <Row
        icon="images-outline"
        label="Photos"
        subtitle={statusLabel(perms.camera)}
        onPress={openSettings}
      />
      <Row
        icon="people-outline"
        label="Contacts"
        subtitle={statusLabel(perms.contacts, 'Autorisés')}
        onPress={openSettings}
      />

      {/* Sécurité du compte */}
      <SectionHeader title="Sécurité du compte" />
      <Row
        icon="lock-closed-outline"
        label="Changer le mot de passe"
        onPress={() => router.push('/(profile)/change-password')}
      />

      {/* Données */}
      <SectionHeader title="Données" />
      <Row icon="server-outline" label="Gestion des données" onPress={showComingSoon} />

      {/* Informations légales */}
      <SectionHeader title="Informations légales" />
      <Row icon="document-text-outline" label="Mentions légales" onPress={() => router.push('/(profile)/legal-notices')} />
      <Row icon="document-text-outline" label="Conditions Générales d'Utilisation" onPress={() => router.push('/(profile)/terms')} />
      <Row icon="shield-outline" label="Politique de confidentialité" onPress={() => router.push('/(profile)/privacy')} />
      <Row icon="document-text-outline" label="Conditions Générales de Vente" onPress={() => router.push('/(profile)/sales-terms')} />

    </DarkScreen>
  );
}

const ICON_BOX = scaledIcon(32);

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaledSpacing(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: scaledIcon(8),
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
    color: colors.white,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
});
