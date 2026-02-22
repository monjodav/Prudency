import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

const EXTEND_OPTIONS = [15, 30, 45, 60] as const;

interface ExtendModalProps {
  visible: boolean;
  onClose: () => void;
  onExtend: (minutes: number) => void;
  isExtending: boolean;
}

export function ExtendModal({
  visible,
  onClose,
  onExtend,
  isExtending,
}: ExtendModalProps) {
  const [selected, setSelected] = useState<number>(15);

  return (
    <Modal visible={visible} onClose={onClose} title="Prolonger mon trajet">
      <Text style={styles.extendSubtitle}>
        De combien de temps souhaites-tu prolonger ton trajet ?
      </Text>

      <View style={styles.extendOptions}>
        {EXTEND_OPTIONS.map((minutes) => (
          <Pressable
            key={minutes}
            style={[
              styles.extendOption,
              selected === minutes && styles.extendOptionSelected,
            ]}
            onPress={() => setSelected(minutes)}
          >
            <Text style={[
              styles.extendOptionText,
              selected === minutes && styles.extendOptionTextSelected,
            ]}>
              {minutes} min
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.extendActions}>
        <Button
          title="Annuler"
          variant="outline"
          onPress={onClose}
          style={styles.extendButton}
        />
        <Button
          title="Prolonger"
          onPress={() => onExtend(selected)}
          loading={isExtending}
          style={styles.extendButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  extendSubtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[6],
  },
  extendOptions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  extendOption: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  extendOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  extendOptionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.gray[600],
  },
  extendOptionTextSelected: {
    color: colors.primary[600],
  },
  extendActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  extendButton: {
    flex: 1,
  },
});
