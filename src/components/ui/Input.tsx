import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
  ViewStyle,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  secureToggle?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  secureToggle = false,
  secureTextEntry,
  containerStyle,
  ...textInputProps
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? true);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          {...textInputProps}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            style={styles.toggleButton}
            hitSlop={8}
          >
            <Text style={styles.toggleText}>
              {isSecure ? 'Voir' : 'Masquer'}
            </Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && hint && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.label,
    color: colors.gray[700],
    marginBottom: spacing[1],
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[50],
  },
  inputError: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.gray[900],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  toggleButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  toggleText: {
    ...typography.buttonSmall,
    color: colors.primary[500],
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    marginTop: spacing[1],
  },
  hintText: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
});
