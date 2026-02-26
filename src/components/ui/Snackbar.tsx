import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, scaledShadow } from '@/src/utils/scaling';

type SnackbarVariant = 'success' | 'error' | 'info';

interface SnackbarProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  variant?: SnackbarVariant;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const VARIANT_CONFIG: Record<SnackbarVariant, { bgColor: string; iconName: string }> = {
  success: { bgColor: colors.success[900], iconName: 'check-circle' },
  error: { bgColor: colors.error[900], iconName: 'exclamation-circle' },
  info: { bgColor: colors.secondary[700], iconName: 'info-circle' },
};

export function Snackbar({
  visible,
  title,
  subtitle,
  variant = 'success',
  duration = 3000,
  onHide,
  action,
}: SnackbarProps) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  }, [onHide, translateY, opacity]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(hide, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, hide, translateY, opacity]);

  if (!visible) return null;

  const config = VARIANT_CONFIG[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bgColor, transform: [{ translateY }], opacity },
      ]}
    >
      <FontAwesome
        name={config.iconName as React.ComponentProps<typeof FontAwesome>['name']}
        size={scaledIcon(24)}
        color={colors.white}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && (
        <Pressable onPress={action.onPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing[12],
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    ...scaledShadow({
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    }),
    zIndex: 9999,
  },
  icon: {
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '400',
  },
  subtitle: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
  actionButton: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  actionText: {
    ...typography.buttonSmall,
    color: colors.white,
    textDecorationLine: 'underline',
  },
});
