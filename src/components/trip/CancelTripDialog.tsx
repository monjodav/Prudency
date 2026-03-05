import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Dialog } from '@/src/components/ui/Dialog';
import { scaledIcon } from '@/src/utils/scaling';

interface CancelTripDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
  hasContact: boolean;
}

export function CancelTripDialog({
  visible,
  onClose,
  onConfirm,
  isCancelling,
  hasContact,
}: CancelTripDialogProps) {
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="Annuler le trajet ?"
      description={
        hasContact
          ? 'Ton contact de confiance sera notifie de l\'annulation du trajet.'
          : 'Es-tu sure de vouloir annuler ton trajet en cours ?'
      }
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="warning-outline"
          size={scaledIcon(40)}
          color={colors.error[400]}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Non, continuer"
          variant="outline"
          onPress={onClose}
          style={styles.button}
        />
        <Button
          title="Oui, annuler"
          variant="danger"
          onPress={onConfirm}
          loading={isCancelling}
          style={styles.button}
        />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  button: {
    flex: 1,
  },
});
