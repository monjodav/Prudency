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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { ms, scaledSpacing, scaledRadius, scaledIcon } from '@/src/utils/scaling';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  secureToggle?: boolean;
  containerStyle?: ViewStyle;
  variant?: 'light' | 'dark';
}

export function Input({
  label,
  error,
  hint,
  secureToggle = false,
  secureTextEntry,
  containerStyle,
  variant = 'dark',
  ...textInputProps
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? true);
  const hasError = Boolean(error);

  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
          hasError && styles.inputError,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputTextDark : styles.inputTextLight,
          ]}
          placeholderTextColor={colors.gray[500]}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          {...textInputProps}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            style={styles.toggleButton}
            hitSlop={8}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={scaledIcon(24)}
              color={colors.gray[500]}
            />
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
    marginBottom: scaledSpacing(16),
  },
  label: {
    ...typography.label,
    marginBottom: scaledSpacing(8),
  },
  labelDark: {
    color: colors.gray[50],
  },
  labelLight: {
    color: colors.gray[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaledRadius(8),
    height: ms(48, 0.5),
    paddingHorizontal: scaledSpacing(16),
  },
  inputContainerDark: {
    backgroundColor: 'transparent',
    borderColor: colors.primary[50],
  },
  inputContainerLight: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[300],
  },
  inputError: {
    borderColor: colors.error[500],
  },
  input: {
    flex: 1,
    ...typography.inputText,
    height: '100%',
    paddingVertical: scaledSpacing(12),
  },
  inputTextDark: {
    color: colors.white,
  },
  inputTextLight: {
    color: colors.gray[900],
  },
  toggleButton: {
    padding: scaledSpacing(4),
    marginLeft: scaledSpacing(8),
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    marginTop: scaledSpacing(4),
  },
  hintText: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: scaledSpacing(4),
  },
});
