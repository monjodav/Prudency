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
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { DarkScreen } from '@/src/components/ui/DarkScreen';
import { Slider } from '@/src/components/ui/Slider';
import { ms, scaledIcon, scaledSpacing } from '@/src/utils/scaling';
import { usePreferencesStore, type MapTheme } from '@/src/stores/preferencesStore';

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[700], true: colors.primary[400] }}
        thumbColor={value ? colors.primary[500] : colors.gray[400]}
      />
    </View>
  );
}

function MapThemeOption({
  label,
  subtitle,
  icon,
  selected,
  onPress,
}: {
  label: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.themeOption} onPress={onPress}>
      <Ionicons name={icon} size={scaledIcon(20)} color={colors.primary[300]} />
      <View style={styles.themeOptionContent}>
        <Text style={styles.themeOptionLabel}>{label}</Text>
        {subtitle ? <Text style={styles.themeOptionSubtitle}>{subtitle}</Text> : null}
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
      <SectionHeader title="Alertes automatiques" />
      <View style={styles.card}>
        <Slider
          label="Temps avant envoi d'alerte"
          value={alertTime}
          min={5}
          max={30}
          step={5}
          unit=" min"
          onChange={setAlertTime}
        />
        <Slider
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
        <Slider
          label="Distance avant envoi d'alerte"
          value={alertDistance}
          min={0.5}
          max={5}
          step={0.5}
          unit=" km"
          onChange={setAlertDistance}
          disabled
        />

        <Slider
          label="Temps d'arret"
          value={stopTime}
          min={5}
          max={30}
          step={5}
          unit=" min"
          onChange={setStopTime}
        />
      </View>

      <SectionHeader title="Confirmations intelligentes" />
      <View style={styles.card}>
        <Text style={styles.sublabel}>Question de sécurité à double sens</Text>
        <ToggleRow
          label="Annuler le trajet"
          value={questionCancelTrip}
          onValueChange={setQuestionCancelTrip}
        />
        <ToggleRow
          label="Terminer le trajet"
          value={questionEndTrip}
          onValueChange={setQuestionEndTrip}
        />
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

      <SectionHeader title="Mot de passe" />
      <View style={styles.card}>
        <ToggleRow
          label="Annuler le trajet"
          value={passwordCancelTrip}
          onValueChange={setPasswordCancelTrip}
        />
        <ToggleRow
          label="Terminer le trajet"
          value={passwordEndTrip}
          onValueChange={setPasswordEndTrip}
        />
      </View>

      <SectionHeader title="Thème de la map" />
      <View style={styles.card}>
        <MapThemeOption
          label="Automatique (6h - 18h)"
          subtitle="Clair le jour, sombre la nuit"
          icon="time-outline"
          selected={mapTheme === 'auto'}
          onPress={() => setMapTheme('auto')}
        />
        <MapThemeOption
          label="Toujours clair"
          icon="sunny-outline"
          selected={mapTheme === 'light'}
          onPress={() => setMapTheme('light')}
        />
        <MapThemeOption
          label="Toujours sombre"
          icon="moon-outline"
          selected={mapTheme === 'dark'}
          onPress={() => setMapTheme('dark')}
        />
      </View>

      <Button
        title="Enregistrer"
        onPress={() => {}}
        fullWidth
        style={styles.saveButton}
      />
    </DarkScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.label,
    color: colors.gray[400],
    textTransform: 'uppercase',
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  card: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  sublabel: {
    ...typography.bodySmall,
    color: colors.gray[300],
    marginBottom: spacing[3],
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[950],
  },
  toggleLabel: {
    ...typography.body,
    color: colors.white,
  },
  warningBanner: {
    backgroundColor: colors.warning[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
  },
  warningText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: spacing[3],
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionLabel: {
    ...typography.body,
    color: colors.white,
  },
  themeOptionSubtitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 2,
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
