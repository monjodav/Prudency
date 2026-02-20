import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { scaledIcon, ms, scaledSpacing } from '@/src/utils/scaling';
import * as authService from '@/src/services/authService';

interface LogoutDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONSEQUENCES = [
  'La deconnexion entraine la desactivation de ton compte.',
  "Tu n'auras plus acces aux trajets, alertes ni personnes de confiance.",
  'Tes personnes de confiance seront informees que ton compte est inactif.',
  'Tes donnees seront conservees 30 jours. Passe ce delai, elles seront supprimees definitivement.',
] as const;

export function LogoutDialog({
  visible,
  onConfirm,
  onCancel,
}: LogoutDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Saisis ton mot de passe pour confirmer.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await authService.verifyPassword(password);

      if (!isValid) {
        setError('Ton mot de passe est invalide.');
        return;
      }

      onConfirm();
    } catch {
      setError('Une erreur est survenue. Reessaie.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  const handleForgotPassword = () => {
    handleCancel();
    Alert.alert(
      'Mot de passe oublie',
      'Un email de reinitialisation te sera envoye.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => {
            Alert.alert('Email envoye', 'Verifie ta boite mail.');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={handleCancel} />
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="log-out-outline"
                size={scaledIcon(28)}
                color={colors.error[400]}
              />
            </View>
            <Text style={styles.title}>Deconnexion</Text>
          </View>

          <View style={styles.consequencesList}>
            {CONSEQUENCES.map((text, index) => (
              <View key={index} style={styles.consequenceItem}>
                <View style={styles.bullet} />
                <Text style={styles.consequenceText}>{text}</Text>
              </View>
            ))}
          </View>

          <Input
            label="Mot de passe"
            placeholder="Confirme ton mot de passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
            secureTextEntry
            secureToggle
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputContainer}
          />

          <Pressable onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublie ?</Text>
          </Pressable>

          <View style={styles.actions}>
            <Button
              title="Je me deconnecte"
              variant="danger"
              onPress={handleConfirm}
              loading={isVerifying}
              disabled={!password.trim()}
              fullWidth
            />
            <Button
              title="Annuler"
              variant="ghost"
              onPress={handleCancel}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialog: {
    width: '90%',
    maxWidth: ms(400, 0.5),
    backgroundColor: colors.primary[950],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.primary[900],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  iconContainer: {
    width: ms(56, 0.5),
    height: ms(56, 0.5),
    borderRadius: ms(56, 0.5) / 2,
    backgroundColor: colors.error[950],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  title: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  consequencesList: {
    marginBottom: spacing[5],
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  bullet: {
    width: ms(6, 0.3),
    height: ms(6, 0.3),
    borderRadius: ms(3, 0.3),
    backgroundColor: colors.error[400],
    marginTop: scaledSpacing(6),
    marginRight: spacing[3],
    flexShrink: 0,
  },
  consequenceText: {
    ...typography.bodySmall,
    color: colors.gray[300],
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing[1],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing[5],
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary[300],
  },
  actions: {
    gap: spacing[2],
  },
});
