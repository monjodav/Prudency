import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const TOAST_CONFIG: Record<ToastType, { icon: string; bgColor: string; textColor: string }> = {
  success: {
    icon: 'check-circle',
    bgColor: colors.success[500],
    textColor: colors.white,
  },
  error: {
    icon: 'exclamation-circle',
    bgColor: colors.error[500],
    textColor: colors.white,
  },
  warning: {
    icon: 'exclamation-triangle',
    bgColor: colors.warning[500],
    textColor: colors.gray[900],
  },
  info: {
    icon: 'info-circle',
    bgColor: colors.info[500],
    textColor: colors.white,
  },
};

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  action,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <FontAwesome
        name={config.icon as React.ComponentProps<typeof FontAwesome>['name']}
        size={20}
        color={config.textColor}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
        {message}
      </Text>
      {action && (
        <Pressable onPress={action.onPress} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: config.textColor }]}>
            {action.label}
          </Text>
        </Pressable>
      )}
      <Pressable onPress={hideToast} style={styles.closeButton}>
        <FontAwesome name="times" size={16} color={config.textColor} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing[12],
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  icon: {
    marginRight: spacing[3],
  },
  message: {
    ...typography.body,
    flex: 1,
  },
  actionButton: {
    marginLeft: spacing[2],
    paddingHorizontal: spacing[2],
  },
  actionText: {
    ...typography.button,
    textDecorationLine: 'underline',
  },
  closeButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
  },
});
