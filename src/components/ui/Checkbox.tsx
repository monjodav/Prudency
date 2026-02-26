import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';

type CheckboxState = 'default' | 'disabled' | 'focused';

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  state?: CheckboxState;
  style?: ViewStyle;
}

export function Checkbox({
  checked,
  onToggle,
  state = 'default',
  style,
}: CheckboxProps) {
  const isDisabled = state === 'disabled';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        state === 'focused' && styles.containerFocused,
        isDisabled && styles.containerDisabled,
        pressed && !isDisabled && styles.containerPressed,
        style,
      ]}
      onPress={() => onToggle(!checked)}
      disabled={isDisabled}
      hitSlop={8}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={scaledIcon(18)}
          color={isDisabled ? colors.button.disabledText : colors.primary[200]}
        />
      )}
    </Pressable>
  );
}

const SIZE = ms(24, 0.4);

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: scaledRadius(2),
    borderWidth: 1,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerFocused: {
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  containerDisabled: {
    borderColor: colors.button.disabledText,
  },
  containerPressed: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: ms(12, 0.4),
    elevation: 4,
  },
});
