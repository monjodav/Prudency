import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else {
      if (password.length < 8) {
        newErrors.password = 'Minimum 8 caracteres';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Doit contenir une majuscule';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Doit contenir un chiffre';
      }
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    // Placeholder: will be connected to useAuth hook
    setTimeout(() => {
      setLoading(false);
      router.replace('/(auth)/onboarding');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Creer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez Prudency pour securiser vos trajets
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="votre@email.fr"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          placeholder="Minimum 8 caracteres"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          secureTextEntry
          secureToggle
          hint="8 caracteres min., 1 majuscule, 1 chiffre"
        />

        <Input
          label="Confirmer le mot de passe"
          placeholder="Retapez votre mot de passe"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
          secureTextEntry
          secureToggle
        />

        <Button
          title="Creer mon compte"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          disabled={!email || !password || !confirmPassword}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Deja un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.linkText}>Se connecter</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
  header: {
    paddingTop: spacing[20],
    paddingBottom: spacing[8],
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing[2],
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[6],
  },
  footerText: {
    ...typography.body,
    color: colors.gray[600],
  },
  linkText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
