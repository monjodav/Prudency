import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { scaledIcon } from '@/src/utils/scaling';

interface AlertConfirmationProps {
  contactCount: number;
  onDismiss: () => void;
  onCancel?: () => void;
}

export function AlertConfirmation({
  contactCount,
  onDismiss,
  onCancel,
}: AlertConfirmationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="check-circle" size={scaledIcon(64)} color={colors.success[500]} />
      </View>

      <Text style={styles.title}>Alerte envoyee</Text>
      <Text style={styles.description}>
        {contactCount > 0
          ? `Vos ${contactCount} contact${contactCount > 1 ? 's' : ''} de confiance ${contactCount > 1 ? 'ont' : 'a'} ete prevenu${contactCount > 1 ? 's' : ''}.`
          : 'Aucun contact de confiance configure. Ajoutez des contacts dans vos parametres.'}
      </Text>

      <View style={styles.infoBox}>
        <FontAwesome
          name="map-marker"
          size={scaledIcon(16)}
          color={colors.info[600]}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>
          Votre position a ete partagee avec vos contacts.
        </Text>
      </View>

      <View style={styles.actions}>
        {onCancel && (
          <Button
            title="Fausse alerte"
            variant="outline"
            onPress={onCancel}
            fullWidth
            style={styles.cancelButton}
          />
        )}
        <Button title="Compris" onPress={onDismiss} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[6],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing[5],
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
    width: '100%',
  },
  infoIcon: {
    marginRight: spacing[3],
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.info[800],
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  cancelButton: {
    marginBottom: spacing[0],
  },
});
