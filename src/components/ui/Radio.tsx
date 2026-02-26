import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { ms } from '@/src/utils/scaling';

type RadioState = 'default' | 'disabled' | 'focused';

interface RadioProps {
  selected: boolean;
  onSelect: () => void;
  state?: RadioState;
  style?: ViewStyle;
}

export function Radio({
  selected,
  onSelect,
  state = 'default',
  style,
}: RadioProps) {
  const isDisabled = state === 'disabled';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.outer,
        state === 'focused' && styles.outerFocused,
        isDisabled && styles.outerDisabled,
        pressed && !isDisabled && styles.outerPressed,
        style,
      ]}
      onPress={onSelect}
      disabled={isDisabled}
      hitSlop={8}
    >
      {selected && (
        <View
          style={[
            styles.inner,
            isDisabled && styles.innerDisabled,
          ]}
        />
      )}
    </Pressable>
  );
}

const OUTER_SIZE = ms(24, 0.4);
const INNER_SIZE = ms(12, 0.4);

const styles = StyleSheet.create({
  outer: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerFocused: {
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  outerDisabled: {
    borderColor: colors.button.disabledText,
  },
  outerPressed: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: ms(12, 0.4),
    elevation: 4,
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: colors.primary[200],
  },
  innerDisabled: {
    backgroundColor: colors.button.disabledText,
  },
});
