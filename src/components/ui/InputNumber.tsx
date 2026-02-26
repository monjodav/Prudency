import React, { useRef, useEffect } from 'react';
import { TextInput, StyleSheet, TextStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { ms, scaledRadius, scaledFontSize } from '@/src/utils/scaling';

interface InputNumberProps {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  onKeyPress?: (key: string) => void;
  style?: TextStyle;
}

export function InputNumber({
  value,
  onChangeText,
  autoFocus = false,
  onKeyPress,
  style,
}: InputNumberProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <TextInput
      ref={inputRef}
      style={[styles.input, style]}
      value={value}
      onChangeText={(text) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        onChangeText(digit);
      }}
      onKeyPress={(e) => onKeyPress?.(e.nativeEvent.key)}
      keyboardType="number-pad"
      maxLength={1}
      textAlign="center"
      selectionColor={colors.primary[300]}
      autoFocus={autoFocus}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: ms(32, 0.4),
    height: ms(48, 0.5),
    borderWidth: 1,
    borderColor: colors.primary[50],
    borderRadius: scaledRadius(4),
    color: colors.primary[50],
    fontSize: scaledFontSize(18),
    fontFamily: 'Inter_400Regular',
    letterSpacing: ms(-0.32, 0.4),
    overflow: 'hidden',
  },
});
