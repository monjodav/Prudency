import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon } from '@/src/utils/scaling';

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Dialog({ visible, onClose, title, description, children }: DialogProps) {
  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.dialog}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={scaledIcon(24)} color={colors.white} />
          </Pressable>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          {children && <View style={styles.content}>{children}</View>}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.medium,
  },
  dialog: {
    backgroundColor: colors.primary[950],
    borderRadius: borderRadius.dialog,
    padding: scaledSpacing(24),
    marginHorizontal: spacing[6],
    width: '85%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: scaledSpacing(12),
    right: scaledSpacing(12),
    zIndex: 1,
    padding: scaledSpacing(4),
  },
  title: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  description: {
    ...typography.bodySmall,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing[4],
    opacity: 0.85,
  },
  content: {
    marginTop: spacing[2],
  },
});
