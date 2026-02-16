import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';

interface PreferenceItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function PreferenceItem({
  icon,
  title,
  description,
  value,
  onValueChange,
}: PreferenceItemProps) {
  return (
    <View style={styles.preferenceItem}>
      <FontAwesome name={icon} size={20} color={colors.gray[600]} style={styles.preferenceIcon} />
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        {description && (
          <Text style={styles.preferenceDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
        thumbColor={value ? colors.primary[500] : colors.gray[50]}
        ios_backgroundColor={colors.gray[300]}
      />
    </View>
  );
}

interface SelectItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  value: string;
  onPress: () => void;
}

function SelectItem({ icon, title, value, onPress }: SelectItemProps) {
  return (
    <Pressable style={styles.preferenceItem} onPress={onPress}>
      <FontAwesome name={icon} size={20} color={colors.gray[600]} style={styles.preferenceIcon} />
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>
      </View>
      <Text style={styles.selectValue}>{value}</Text>
      <FontAwesome name="chevron-right" size={12} color={colors.gray[400]} />
    </Pressable>
  );
}

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState({
    notifications: true,
    soundAlerts: true,
    hapticFeedback: true,
    autoStartLocation: false,
    darkMode: false,
    language: 'Francais',
    units: 'Kilometres',
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionContent}>
          <PreferenceItem
            icon="bell"
            title="Notifications push"
            description="Recevoir des alertes sur votre telephone"
            value={preferences.notifications}
            onValueChange={() => handleToggle('notifications')}
          />
          <PreferenceItem
            icon="volume-up"
            title="Alertes sonores"
            description="Jouer un son lors des alertes"
            value={preferences.soundAlerts}
            onValueChange={() => handleToggle('soundAlerts')}
          />
          <PreferenceItem
            icon="hand-paper-o"
            title="Retour haptique"
            description="Vibrations lors des interactions"
            value={preferences.hapticFeedback}
            onValueChange={() => handleToggle('hapticFeedback')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        <View style={styles.sectionContent}>
          <PreferenceItem
            icon="location-arrow"
            title="Demarrage automatique"
            description="Demarrer le tracking GPS automatiquement"
            value={preferences.autoStartLocation}
            onValueChange={() => handleToggle('autoStartLocation')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.sectionContent}>
          <PreferenceItem
            icon="moon-o"
            title="Mode sombre"
            description="Utiliser le theme sombre"
            value={preferences.darkMode}
            onValueChange={() => handleToggle('darkMode')}
          />
          <SelectItem
            icon="globe"
            title="Langue"
            value={preferences.language}
            onPress={() => {}}
          />
          <SelectItem
            icon="tachometer"
            title="Unites"
            value={preferences.units}
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[500],
    textTransform: 'uppercase',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  preferenceIcon: {
    width: 28,
  },
  preferenceContent: {
    flex: 1,
    marginLeft: spacing[3],
  },
  preferenceTitle: {
    ...typography.body,
    color: colors.gray[900],
  },
  preferenceDescription: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  selectValue: {
    ...typography.body,
    color: colors.gray[500],
    marginRight: spacing[2],
  },
});
