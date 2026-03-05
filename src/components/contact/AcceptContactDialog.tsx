import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dialog } from '@/src/components/ui/Dialog';
import { Button } from '@/src/components/ui/Button';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledIcon, ms } from '@/src/utils/scaling';

interface AcceptContactDialogProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  onRefuse: () => void;
  contactName: string;
  isProcessing: boolean;
}

export function AcceptContactDialog({
  visible,
  onClose,
  onAccept,
  onRefuse,
  contactName,
  isProcessing,
}: AcceptContactDialogProps) {
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Accepter la demande"
      description={`${contactName} souhaite t'ajouter a ses contacts de confiance. Tu seras prevenu(e) en cas de probleme pendant ses trajets.`}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="people"
          size={scaledIcon(32)}
          color={colors.primary[300]}
        />
      </View>
      <View style={styles.actions}>
        <Button
          title="Accepter"
          onPress={onAccept}
          loading={isProcessing}
          fullWidth
        />
        <Button
          title="Refuser"
          variant="ghost"
          onPress={onRefuse}
          disabled={isProcessing}
          fullWidth
        />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: ms(64, 0.5),
    height: ms(64, 0.5),
    borderRadius: ms(64, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  actions: {
    gap: spacing[2],
  },
});
