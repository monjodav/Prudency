import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon, ms } from '@/src/utils/scaling';

export type AnomalyReason =
  | 'transport_delay'
  | 'detour'
  | 'roadblock'
  | 'destination_change'
  | 'waiting'
  | 'voluntary_pause'
  | 'other'
  | 'fatigue'
  | 'technical_issue'
  | 'all_good';

interface AnomalyOption {
  reason: AnomalyReason;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
}

const ANOMALY_OPTIONS: AnomalyOption[] = [
  {
    reason: 'transport_delay',
    icon: 'time-outline',
    label: 'Retard de transport',
    description: 'Mon bus, metro ou train a du retard',
  },
  {
    reason: 'detour',
    icon: 'git-branch-outline',
    label: 'Detour imprevu / volontaire',
    description: "J'ai change de chemin volontairement",
  },
  {
    reason: 'roadblock',
    icon: 'construct-outline',
    label: 'Travaux / route barree',
    description: 'La route est bloquee ou en travaux',
  },
  {
    reason: 'destination_change',
    icon: 'navigate-outline',
    label: 'Changement de destination',
    description: "Je me rends a un autre endroit",
  },
  {
    reason: 'waiting',
    icon: 'hourglass-outline',
    label: 'Attente (transport / ami / rendez-vous)',
    description: "J'attends quelqu'un ou quelque chose",
  },
  {
    reason: 'voluntary_pause',
    icon: 'cafe-outline',
    label: 'Pause volontaire',
    description: "J'ai decide de faire une pause",
  },
  {
    reason: 'other',
    icon: 'ellipsis-horizontal-circle-outline',
    label: 'Autre raison',
    description: 'Une autre raison non listee',
  },
  {
    reason: 'fatigue',
    icon: 'bed-outline',
    label: "Fatigue / besoin de s'arreter",
    description: "J'ai besoin de me reposer",
  },
  {
    reason: 'technical_issue',
    icon: 'warning-outline',
    label: 'Probleme technique',
    description: 'Un souci technique avec mon vehicule ou appareil',
  },
  {
    reason: 'all_good',
    icon: 'checkmark-circle-outline',
    label: 'Tout va bien',
    description: "L'anomalie detectee est normale",
  },
];

interface AnomalyDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: AnomalyReason) => void;
}

export function AnomalyDialog({ visible, onClose, onSelect }: AnomalyDialogProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Que se passe-t-il ?"
      snapPoints={[0.75]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {ANOMALY_OPTIONS.map((option) => (
          <AnomalyOptionRow
            key={option.reason}
            option={option}
            onPress={() => onSelect(option.reason)}
          />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

function AnomalyOptionRow({
  option,
  onPress,
}: {
  option: AnomalyOption;
  onPress: () => void;
}) {
  const isAllGood = option.reason === 'all_good';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        isAllGood && styles.optionRowAllGood,
        pressed && styles.optionRowPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          isAllGood && styles.iconContainerAllGood,
        ]}
      >
        <Ionicons
          name={option.icon}
          size={scaledIcon(22)}
          color={isAllGood ? colors.success[600] : colors.primary[600]}
        />
      </View>
      <View style={styles.optionText}>
        <Text
          style={[styles.optionLabel, isAllGood && styles.optionLabelAllGood]}
        >
          {option.label}
        </Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={scaledIcon(18)}
        color={colors.gray[400]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing[10],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.lg,
    gap: spacing[3],
  },
  optionRowAllGood: {
    backgroundColor: colors.success[50],
    marginTop: spacing[2],
  },
  optionRowPressed: {
    backgroundColor: colors.gray[50],
  },
  iconContainer: {
    width: ms(40, 0.5),
    height: ms(40, 0.5),
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerAllGood: {
    backgroundColor: colors.success[100],
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.gray[900],
  },
  optionLabelAllGood: {
    color: colors.success[700],
  },
  optionDescription: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[0],
  },
});
