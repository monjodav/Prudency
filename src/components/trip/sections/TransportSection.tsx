import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledIcon } from '@/src/utils/scaling';

type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  { mode: 'walk', label: 'Marche', icon: 'walk' },
  { mode: 'transit', label: 'Transports', icon: 'bus-outline' },
  { mode: 'bike', label: 'Vélo', icon: 'bicycle-outline' },
  { mode: 'car', label: 'Voiture', icon: 'car-outline' },
];

interface TransportSectionProps {
  selected: TransportMode | null;
  onSelect: (mode: TransportMode) => void;
}

export function TransportSection({ selected, onSelect }: TransportSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Transport</Text>
      <Text style={styles.sectionHint}>Choisis ton mode de transport</Text>
      <View style={styles.transportRow}>
        {TRANSPORT_OPTIONS.map((option) => {
          const isSelected = selected === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => onSelect(option.mode)}
              style={[
                styles.transportOption,
                isSelected ? styles.transportOptionSelected : styles.transportOptionOutline,
              ]}
            >
              <Ionicons
                name={option.icon}
                size={scaledIcon(24)}
                color={isSelected ? colors.white : colors.gray[400]}
              />
              <Text style={[
                styles.transportLabel,
                isSelected && styles.transportLabelSelected,
              ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  transportRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  transportOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[1],
    borderRadius: borderRadius.md,
  },
  transportOptionOutline: {
    borderWidth: 1,
    borderColor: colors.secondary[400],
  },
  transportOptionSelected: {
    borderWidth: 1,
    borderColor: colors.secondary[400],
    backgroundColor: colors.secondary[900],
  },
  transportLabel: {
    ...typography.caption,
    color: colors.gray[400],
  },
  transportLabelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
});
