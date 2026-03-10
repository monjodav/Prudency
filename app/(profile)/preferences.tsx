import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Slider } from '@/src/components/ui/Slider';
import { scaledIcon, scaledSpacing } from '@/src/utils/scaling';
import { usePreferencesStore } from '@/src/stores/preferencesStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

interface RowProps {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
}

function Row({ icon, label, subtitle, right }: RowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={scaledIcon(18)} color={colors.primary[300]} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  subtitle,
  value,
  onValueChange,
}: {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Row
      icon={icon}
      label={label}
      subtitle={subtitle}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray[700], true: colors.primary[400] }}
          thumbColor={value ? colors.primary[500] : colors.gray[400]}
        />
      }
    />
  );
}

function SliderRow({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  icon: IoniconsName;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.sliderRow, disabled && styles.sliderRowDisabled]}>
      <View style={styles.sliderRowHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={scaledIcon(18)} color={colors.primary[300]} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Slider
        label=""
        value={value}
        min={min}
        max={max}
        step={step}
        unit={unit}
        onChange={onChange}
        disabled={disabled}
      />
    </View>
  );
}

function RadioRow({
  icon,
  label,
  subtitle,
  selected,
  onPress,
}: {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={scaledIcon(18)} color={colors.primary[300]} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

export default function PreferencesScreen() {
  const [alertTime, setAlertTime] = useState(15);
  const [delayTolerance, setDelayTolerance] = useState(15);
  const [alertDistance, setAlertDistance] = useState(2);
  const [stopTime, setStopTime] = useState(10);

  const [questionCancelTrip, setQuestionCancelTrip] = useState(true);
  const [questionEndTrip, setQuestionEndTrip] = useState(true);
  const [securityQuestion, setSecurityQuestion] = useState('Quel est le prénom de ton père ?');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const [passwordCancelTrip, setPasswordCancelTrip] = useState(false);
  const [passwordEndTrip, setPasswordEndTrip] = useState(false);

  const { mapTheme, setMapTheme } = usePreferencesStore();

  return (
    <DarkScreen scrollable avoidKeyboard headerTitle="Préférences">
      {/* Alertes automatiques */}
      <SectionHeader title="Alertes automatiques" />
      <SliderRow
        icon="time-outline"
        label="Temps avant envoi d'alerte"
        value={alertTime}
        min={5}
        max={30}
        step={5}
        unit=" min"
        onChange={setAlertTime}
      />
      <SliderRow
        icon="hourglass-outline"
        label="Retard acceptable"
        value={delayTolerance}
        min={5}
        max={30}
        step={5}
        unit=" min"
        onChange={setDelayTolerance}
      />
      <View style={styles.warningBanner}>
        <Text style={styles.warningText}>Fonctionnalité à venir</Text>
      </View>
      <SliderRow
        icon="navigate-outline"
        label="Distance avant envoi d'alerte"
        value={alertDistance}
        min={0.5}
        max={5}
        step={0.5}
        unit=" km"
        onChange={setAlertDistance}
        disabled
      />
      <SliderRow
        icon="stop-circle-outline"
        label="Temps d'arret"
        value={stopTime}
        min={5}
        max={30}
        step={5}
        unit=" min"
        onChange={setStopTime}
      />

      {/* Confirmations intelligentes */}
      <SectionHeader title="Confirmations intelligentes" />
      <ToggleRow
        icon="close-circle-outline"
        label="Annuler le trajet"
        subtitle="Question de sécurité"
        value={questionCancelTrip}
        onValueChange={setQuestionCancelTrip}
      />
      <ToggleRow
        icon="checkmark-circle-outline"
        label="Terminer le trajet"
        subtitle="Question de sécurité"
        value={questionEndTrip}
        onValueChange={setQuestionEndTrip}
      />
      <View style={styles.inputSection}>
        <Input
          label="Question actuelle"
          value={securityQuestion}
          onChangeText={setSecurityQuestion}
          placeholder="Ta question de sécurité"
        />
        <Input
          label="Réponse actuelle validée"
          value={securityAnswer}
          onChangeText={setSecurityAnswer}
          placeholder="Ta réponse"
        />
      </View>

      {/* Mot de passe */}
      <SectionHeader title="Mot de passe" />
      <ToggleRow
        icon="close-circle-outline"
        label="Annuler le trajet"
        subtitle="Requiert le mot de passe"
        value={passwordCancelTrip}
        onValueChange={setPasswordCancelTrip}
      />
      <ToggleRow
        icon="checkmark-circle-outline"
        label="Terminer le trajet"
        subtitle="Requiert le mot de passe"
        value={passwordEndTrip}
        onValueChange={setPasswordEndTrip}
      />

      {/* Thème de la map */}
      <SectionHeader title="Thème de la map" />
      <RadioRow
        icon="time-outline"
        label="Automatique (6h - 18h)"
        subtitle="Clair le jour, sombre la nuit"
        selected={mapTheme === 'auto'}
        onPress={() => setMapTheme('auto')}
      />
      <RadioRow
        icon="sunny-outline"
        label="Toujours clair"
        selected={mapTheme === 'light'}
        onPress={() => setMapTheme('light')}
      />
      <RadioRow
        icon="moon-outline"
        label="Toujours sombre"
        selected={mapTheme === 'dark'}
        onPress={() => setMapTheme('dark')}
      />

      <Button
        title="Enregistrer"
        onPress={() => {}}
        fullWidth
        style={styles.saveButton}
      />
    </DarkScreen>
  );
}

const ICON_BOX = scaledIcon(32);

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaledSpacing(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: scaledIcon(8),
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
    color: colors.white,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
  },
  sliderRow: {
    paddingVertical: scaledSpacing(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sliderRowDisabled: {
    opacity: 0.5,
  },
  sliderRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  warningBanner: {
    backgroundColor: colors.warning[600],
    borderRadius: scaledIcon(8),
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
  warningText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  inputSection: {
    paddingTop: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: scaledSpacing(14),
  },
  radio: {
    width: scaledSpacing(22),
    height: scaledSpacing(22),
    borderRadius: scaledSpacing(11),
    borderWidth: 2,
    borderColor: colors.gray[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.brandPosition[50],
  },
  radioDot: {
    width: scaledSpacing(12),
    height: scaledSpacing(12),
    borderRadius: scaledSpacing(6),
    backgroundColor: colors.brandPosition[50],
  },
  saveButton: {
    marginTop: spacing[6],
  },
});
