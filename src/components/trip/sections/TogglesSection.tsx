import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ListItem } from '@/src/components/ui/ListItem';
import { Toggle } from '@/src/components/ui/Toggle';

interface TogglesSectionProps {
  shareLocation: boolean;
  onToggleShareLocation: (value: boolean) => void;
  silentNotifications: boolean;
  onToggleSilentNotifications: (value: boolean) => void;
}

export function TogglesSection({
  shareLocation,
  onToggleShareLocation,
  silentNotifications,
  onToggleSilentNotifications,
}: TogglesSectionProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Position</Text>
        <Text style={styles.sectionHint}>Partage de position en direct</Text>
        <ListItem
          text="Partager ma position"
          iconRight={
            <Toggle active={shareLocation} onToggle={onToggleShareLocation} />
          }
          style={styles.toggleItem}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Option</Text>
        <Text style={styles.sectionHint}>Notifications silencieuses sauf en cas de retard</Text>
        <ListItem
          text="Notifications silencieuses"
          secondaryText="(Sauf urgence)"
          iconRight={
            <Toggle active={silentNotifications} onToggle={onToggleSilentNotifications} />
          }
          style={styles.toggleItem}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    ...typography.label,
    color: colors.gray[300],
    marginBottom: spacing[1],
  },
  sectionHint: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[3],
  },
  toggleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
});
