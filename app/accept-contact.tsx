import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { Button } from '@/src/components/ui/Button';
import { Loader } from '@/src/components/ui/Loader';
import { OnboardingBackground } from '@/src/components/ui/OnboardingBackground';
import { supabase } from '@/src/services/supabaseClient';
import { respondToContactInvitation } from '@/src/services/contactService';
import {
  scaledSpacing,
  scaledFontSize,
  scaledLineHeight,
  scaledRadius,
  scaledIcon,
  ms,
} from '@/src/utils/scaling';

const APP_STORE_URL = 'https://apps.apple.com/app/prudency';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.prudency.app';

interface InviterInfo {
  inviterName: string;
  contactName: string;
  contactId: string;
  validationStatus: string;
}

type ScreenState = 'loading' | 'ready' | 'already_handled' | 'accepted' | 'refused' | 'error';

export default function AcceptContactScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [state, setState] = useState<ScreenState>('loading');
  const [inviter, setInviter] = useState<InviterInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMessage("Lien d'invitation invalide.");
      setState('error');
      return;
    }

    void fetchInvitation(token);
  }, [token]);

  async function fetchInvitation(inviteToken: string) {
    try {
      const { data: contact, error } = await supabase
        .from('trusted_contacts')
        .select('id, name, user_id, validation_status')
        .eq('invitation_token', inviteToken)
        .single();

      if (error || !contact) {
        setErrorMessage("Cette invitation n'existe pas ou a expire.");
        setState('error');
        return;
      }

      if (contact.validation_status === 'accepted') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', contact.user_id)
          .single();

        const inviterName = profile
          ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
          : 'Quelqu\'un';

        setInviter({
          inviterName: inviterName || 'Quelqu\'un',
          contactName: contact.name,
          contactId: contact.id,
          validationStatus: contact.validation_status,
        });
        setState('already_handled');
        return;
      }

      if (contact.validation_status === 'refused') {
        setErrorMessage("Cette invitation a deja ete refusee.");
        setState('error');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', contact.user_id)
        .single();

      const inviterName = profile
        ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
        : 'Quelqu\'un';

      setInviter({
        inviterName: inviterName || 'Quelqu\'un',
        contactName: contact.name,
        contactId: contact.id,
        validationStatus: contact.validation_status,
      });
      setState('ready');
    } catch {
      setErrorMessage("Impossible de charger l'invitation.");
      setState('error');
    }
  }

  const handleAccept = async () => {
    if (!inviter || !token) return;
    setProcessing(true);
    try {
      await respondToContactInvitation(token, 'accepted');
      setState('accepted');
    } catch {
      setErrorMessage('Une erreur est survenue. Veuillez reessayer.');
      setState('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuse = async () => {
    if (!inviter || !token) return;
    setProcessing(true);
    try {
      await respondToContactInvitation(token, 'refused');
      setState('refused');
    } catch {
      setErrorMessage('Une erreur est survenue. Veuillez reessayer.');
      setState('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadApp = () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    void Linking.openURL(storeUrl);
  };

  const handleClose = () => {
    router.replace('/');
  };

  return (
    <OnboardingBackground>
      <View style={styles.content}>
        {state === 'loading' && (
          <View style={styles.centered}>
            <Loader size="lg" color={colors.primary[50]} />
            <Text style={styles.loadingText}>Chargement de l'invitation...</Text>
          </View>
        )}

        {state === 'ready' && inviter && (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={scaledIcon(48)} color={colors.primary[50]} />
            </View>
            <Text style={styles.title}>Invitation de confiance</Text>
            <Text style={styles.subtitle}>
              {inviter.inviterName} souhaite t'ajouter comme personne de confiance sur Prudency.
            </Text>
            <Text style={styles.description}>
              En acceptant, tu seras prevenu(e) si un probleme survient pendant ses trajets.
              Tu pourras recevoir des notifications et des SMS d'alerte.
            </Text>

            <View style={styles.actions}>
              <Button
                title="Accepter"
                onPress={handleAccept}
                loading={processing}
                fullWidth
              />
              <Button
                title="Refuser"
                variant="outline"
                onPress={handleRefuse}
                loading={processing}
                fullWidth
                style={styles.refuseButton}
              />
            </View>

            <View style={styles.downloadSection}>
              <Text style={styles.downloadText}>
                Tu n'as pas encore l'application ?
              </Text>
              <Button
                title="Telecharger Prudency"
                variant="ghost"
                onPress={handleDownloadApp}
                size="sm"
              />
            </View>
          </>
        )}

        {state === 'already_handled' && inviter && (
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={scaledIcon(64)} color={colors.success[400]} />
            </View>
            <Text style={styles.title}>Deja acceptee</Text>
            <Text style={styles.subtitle}>
              Tu es deja contact de confiance de {inviter.inviterName}.
            </Text>
            <View style={styles.actions}>
              <Button title="Fermer" onPress={handleClose} fullWidth />
            </View>
          </View>
        )}

        {state === 'accepted' && (
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={scaledIcon(64)} color={colors.success[400]} />
            </View>
            <Text style={styles.title}>Invitation acceptee</Text>
            <Text style={styles.subtitle}>
              Tu es desormais contact de confiance de {inviter?.inviterName}.
            </Text>
            <Text style={styles.description}>
              Tu recevras des notifications si un probleme survient pendant ses trajets.
            </Text>
            <View style={styles.actions}>
              <Button title="Fermer" onPress={handleClose} fullWidth />
            </View>
          </View>
        )}

        {state === 'refused' && (
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={scaledIcon(64)} color={colors.error[400]} />
            </View>
            <Text style={styles.title}>Invitation refusee</Text>
            <Text style={styles.subtitle}>
              Tu as refuse l'invitation de {inviter?.inviterName}.
            </Text>
            <View style={styles.actions}>
              <Button title="Fermer" onPress={handleClose} fullWidth />
            </View>
          </View>
        )}

        {state === 'error' && (
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={scaledIcon(64)} color={colors.error[400]} />
            </View>
            <Text style={styles.title}>Erreur</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
            <View style={styles.actions}>
              <Button title="Fermer" onPress={handleClose} fullWidth />
            </View>
          </View>
        )}
      </View>

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>PRUDENCY</Text>
      </View>
    </OnboardingBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scaledSpacing(40),
    paddingTop: scaledSpacing(80),
  },
  centered: {
    alignItems: 'center',
  },
  iconContainer: {
    width: ms(96, 0.5),
    height: ms(96, 0.5),
    borderRadius: scaledRadius(48),
    backgroundColor: 'rgba(232, 234, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: scaledSpacing(24),
  },
  title: {
    fontSize: scaledFontSize(24),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    marginBottom: scaledSpacing(12),
  },
  subtitle: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(24),
    opacity: 0.9,
    marginBottom: scaledSpacing(8),
  },
  description: {
    fontSize: scaledFontSize(14),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    textAlign: 'center',
    lineHeight: scaledLineHeight(22),
    opacity: 0.7,
    marginBottom: scaledSpacing(32),
  },
  loadingText: {
    fontSize: scaledFontSize(16),
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    marginTop: scaledSpacing(16),
    opacity: 0.8,
  },
  actions: {
    width: '100%',
    gap: scaledSpacing(12),
    marginTop: scaledSpacing(8),
  },
  refuseButton: {
    borderColor: colors.primary[50],
  },
  downloadSection: {
    alignItems: 'center',
    marginTop: scaledSpacing(32),
  },
  downloadText: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_400Regular',
    color: colors.primary[50],
    opacity: 0.7,
    marginBottom: scaledSpacing(4),
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: scaledSpacing(40),
  },
  logo: {
    fontSize: scaledFontSize(35),
    fontWeight: '200',
    fontFamily: 'Montserrat_200ExtraLight',
    color: colors.white,
    letterSpacing: ms(2, 0.3),
    textAlign: 'center',
  },
});
