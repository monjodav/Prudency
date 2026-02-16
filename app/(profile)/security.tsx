import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';

export default function SecurityScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [shareLocationWithContacts, setShareLocationWithContacts] = useState(true);
  const [dataRetentionDays, setDataRetentionDays] = useState(30);

  const handleChangePassword = () => {
    Alert.alert(
      'Changer le mot de passe',
      'Un email vous sera envoye pour reinitialiser votre mot de passe.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => {
            // Placeholder: send password reset email
            Alert.alert('Email envoye', 'Verifiez votre boite mail.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exporter mes donnees',
      'Vous recevrez un email avec un lien pour telecharger vos donnees.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: () => {
            // Placeholder: request data export
            Alert.alert('Demande envoyee', 'Vous recevrez un email sous 24h.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irreversible. Toutes vos donnees seront supprimees definitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // Placeholder: delete account
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentification</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingItem}>
            <FontAwesome
              name="fingerprint"
              size={20}
              color={colors.gray[600]}
              style={styles.settingIcon}
            />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Biometrie</Text>
              <Text style={styles.settingDescription}>
                Face ID / Touch ID pour confirmer vos trajets
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
              thumbColor={biometricEnabled ? colors.primary[500] : colors.gray[50]}
            />
          </View>

          <Pressable style={styles.settingItem} onPress={handleChangePassword}>
            <FontAwesome name="lock" size={20} color={colors.gray[600]} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Changer le mot de passe</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.gray[400]} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialite</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingItem}>
            <FontAwesome
              name="map-marker"
              size={20}
              color={colors.gray[600]}
              style={styles.settingIcon}
            />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Partage de position</Text>
              <Text style={styles.settingDescription}>
                Partager ma position avec mes contacts de confiance pendant un trajet
              </Text>
            </View>
            <Switch
              value={shareLocationWithContacts}
              onValueChange={setShareLocationWithContacts}
              trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
              thumbColor={shareLocationWithContacts ? colors.primary[500] : colors.gray[50]}
            />
          </View>

          <View style={styles.settingItem}>
            <FontAwesome
              name="calendar"
              size={20}
              color={colors.gray[600]}
              style={styles.settingIcon}
            />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Conservation des donnees</Text>
              <Text style={styles.settingDescription}>
                Les trajets sont supprimes apres {dataRetentionDays} jours
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes donnees</Text>
        <View style={styles.sectionContent}>
          <Pressable style={styles.settingItem} onPress={handleExportData}>
            <FontAwesome
              name="download"
              size={20}
              color={colors.gray[600]}
              style={styles.settingIcon}
            />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Exporter mes donnees</Text>
              <Text style={styles.settingDescription}>
                Telecharger une copie de vos donnees (RGPD)
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.gray[400]} />
          </Pressable>
        </View>
      </View>

      <View style={styles.dangerSection}>
        <Text style={styles.sectionTitle}>Zone de danger</Text>
        <View style={styles.dangerContent}>
          <Text style={styles.dangerDescription}>
            La suppression de votre compte est irreversible. Toutes vos donnees, trajets et contacts seront supprimes.
          </Text>
          <Button
            title="Supprimer mon compte"
            variant="outline"
            onPress={handleDeleteAccount}
            fullWidth
            style={styles.deleteButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    textTransform: 'uppercase',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingIcon: {
    width: 28,
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  settingTitle: {
    ...typography.body,
    color: colors.gray[900],
  },
  settingDescription: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  dangerSection: {
    marginBottom: spacing[10],
  },
  dangerContent: {
    backgroundColor: colors.error[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.error[200],
    padding: spacing[6],
  },
  dangerDescription: {
    ...typography.bodySmall,
    color: colors.error[700],
    marginBottom: spacing[4],
  },
  deleteButton: {
    borderColor: colors.error[500],
  },
});
