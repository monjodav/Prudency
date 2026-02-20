import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { scaledIcon } from '@/src/utils/scaling';
import type { PlaceAutocompleteResult } from '@/src/services/placesService';

interface Contact {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean | null;
}

// --- Departure ---

interface DepartureSectionProps {
  address: string;
  onChangeAddress: (text: string) => void;
  onUseCurrentLocation: () => void;
}

export function DepartureSection({ address, onChangeAddress, onUseCurrentLocation }: DepartureSectionProps) {
  return (
    <View>
      <Input
        label="Lieu de depart"
        placeholder="D'ou pars-tu ?"
        value={address}
        onChangeText={onChangeAddress}
        variant="dark"
      />
      <Pressable style={styles.currentLocationBtn} onPress={onUseCurrentLocation}>
        <Ionicons name="locate-outline" size={scaledIcon(18)} color={colors.primary[400]} />
        <Text style={styles.currentLocationText}>Utiliser ma position actuelle</Text>
      </Pressable>
    </View>
  );
}

// --- Destination ---

interface DestinationSectionProps {
  address: string;
  onChangeAddress: (text: string) => void;
  isSearching: boolean;
  searchResults: PlaceAutocompleteResult[];
  onSelectPlace: (result: PlaceAutocompleteResult) => void;
}

export function DestinationSection({
  address,
  onChangeAddress,
  isSearching,
  searchResults,
  onSelectPlace,
}: DestinationSectionProps) {
  return (
    <View>
      <Input
        label="Lieu d'arrivee"
        placeholder="Ou vas-tu ?"
        value={address}
        onChangeText={onChangeAddress}
        variant="dark"
      />
      {isSearching && (
        <ActivityIndicator size="small" color={colors.primary[400]} style={styles.searchSpinner} />
      )}
      {searchResults.length > 0 && (
        <View style={styles.autocompleteList}>
          {searchResults.map((result) => (
            <Pressable
              key={result.placeId}
              style={styles.autocompleteItem}
              onPress={() => onSelectPlace(result)}
            >
              <Ionicons name="location-outline" size={scaledIcon(18)} color={colors.gray[400]} />
              <View style={styles.autocompleteText}>
                <Text style={styles.autocompleteMain} numberOfLines={1}>{result.mainText}</Text>
                <Text style={styles.autocompleteSecondary} numberOfLines={1}>{result.secondaryText}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// --- Departure Time ---

interface DepartureTimeSectionProps {
  departureTime: Date;
  onSetNow: () => void;
}

export function DepartureTimeSection({ departureTime, onSetNow }: DepartureTimeSectionProps) {
  const timeStr = departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Indique ton heure de depart</Text>
      <View style={styles.departureTimeRow}>
        <View style={styles.departureTimeDisplay}>
          <Text style={styles.departureTimeLabel}>Depart</Text>
          <Text style={styles.departureTimeValue}>{timeStr}</Text>
        </View>
        <Pressable onPress={onSetNow}>
          <Text style={styles.departureNowText}>Partir maintenant</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Transport ---

type TransportMode = 'walk' | 'car' | 'transit' | 'bike';

interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  { mode: 'walk', label: 'Marche', icon: 'walk-outline' },
  { mode: 'transit', label: 'Transports', icon: 'bus-outline' },
  { mode: 'bike', label: 'Velo', icon: 'bicycle-outline' },
  { mode: 'car', label: 'Voiture', icon: 'car-outline' },
];

interface TransportSectionProps {
  selected: TransportMode;
  onSelect: (mode: TransportMode) => void;
}

export function TransportSection({ selected, onSelect }: TransportSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choisis ton mode de transport</Text>
      <View style={styles.transportRow}>
        {TRANSPORT_OPTIONS.map((option) => {
          const isSelected = selected === option.mode;
          return (
            <Pressable
              key={option.mode}
              style={[styles.transportOption, isSelected && styles.transportOptionSelected]}
              onPress={() => onSelect(option.mode)}
            >
              <Ionicons
                name={option.icon}
                size={scaledIcon(24)}
                color={isSelected ? colors.white : colors.gray[400]}
              />
              <Text style={[styles.transportLabel, isSelected && styles.transportLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// --- Contact ---

interface ContactSectionProps {
  contacts: Contact[];
  contactsLoading: boolean;
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onShowAddContact: () => void;
}

export function ContactSection({
  contacts,
  contactsLoading,
  selectedContactId,
  onSelectContact,
  onShowAddContact,
}: ContactSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact de confiance</Text>
      {contactsLoading ? (
        <ActivityIndicator size="small" color={colors.primary[400]} />
      ) : contacts.length === 0 ? (
        <View style={styles.noContactsBanner}>
          <Ionicons name="person-add-outline" size={scaledIcon(20)} color={colors.gray[300]} />
          <View style={styles.noContactsContent}>
            <Text style={styles.noContactsText}>
              Aucun contact de confiance configure.
            </Text>
            <Pressable style={styles.addContactLink} onPress={onShowAddContact}>
              <Ionicons name="add-circle-outline" size={scaledIcon(16)} color={colors.primary[400]} />
              <Text style={styles.addContactLinkText}>Ajouter un contact de confiance +</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.contactsList}>
          {contacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;
            return (
              <Pressable
                key={contact.id}
                style={[styles.contactItem, isSelected && styles.contactItemSelected]}
                onPress={() => onSelectContact(contact.id)}
              >
                <View style={styles.contactInfo}>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'person-circle-outline'}
                    size={scaledIcon(24)}
                    color={isSelected ? colors.primary[400] : colors.gray[500]}
                  />
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                </View>
                {contact.is_primary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Principal</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// --- Toggles ---

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
    <View style={styles.section}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Partager ma position</Text>
        <Switch
          value={shareLocation}
          onValueChange={onToggleShareLocation}
          trackColor={{ false: colors.gray[700], true: colors.primary[500] }}
          thumbColor={colors.white}
        />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Notifications silencieuses (Sauf urgence)</Text>
        <Switch
          value={silentNotifications}
          onValueChange={onToggleSilentNotifications}
          trackColor={{ false: colors.gray[700], true: colors.primary[500] }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
}

// --- Footer ---

export function FooterWarning() {
  return (
    <Text style={styles.footerWarning}>
      Tu disposes de 15 minutes pour finaliser ton trajet. Passe ce delai, une alerte sera envoyee a ta personne de confiance.
    </Text>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.label,
    color: colors.gray[400],
    marginBottom: spacing[3],
    textTransform: 'uppercase',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },
  currentLocationText: {
    ...typography.bodySmall,
    color: colors.primary[400],
    fontWeight: '600',
  },
  searchSpinner: {
    marginVertical: spacing[2],
  },
  autocompleteList: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[800],
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  autocompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[800],
  },
  autocompleteText: {
    flex: 1,
  },
  autocompleteMain: {
    ...typography.body,
    color: colors.white,
    fontWeight: '500',
  },
  autocompleteSecondary: {
    ...typography.caption,
    color: colors.gray[500],
  },
  departureTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[900],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  departureTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  departureTimeLabel: {
    ...typography.body,
    color: colors.gray[300],
  },
  departureTimeValue: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  departureNowText: {
    ...typography.bodySmall,
    color: colors.primary[400],
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  transportOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: colors.primary[800],
    gap: spacing[1],
  },
  transportOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  transportLabel: {
    ...typography.caption,
    color: colors.gray[400],
  },
  transportLabelSelected: {
    color: colors.white,
  },
  noContactsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  noContactsContent: {
    flex: 1,
    gap: spacing[2],
  },
  noContactsText: {
    ...typography.bodySmall,
    color: colors.gray[300],
  },
  addContactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  addContactLinkText: {
    ...typography.bodySmall,
    color: colors.primary[400],
    fontWeight: '600',
  },
  contactsList: {
    gap: spacing[2],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[900],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  contactItemSelected: {
    borderColor: colors.primary[400],
    backgroundColor: 'rgba(44, 65, 188, 0.2)',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  contactPhone: {
    ...typography.caption,
    color: colors.gray[500],
  },
  primaryBadge: {
    backgroundColor: 'rgba(44, 65, 188, 0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    ...typography.caption,
    color: colors.primary[400],
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[900],
  },
  toggleLabel: {
    ...typography.body,
    color: colors.white,
    flex: 1,
    marginRight: spacing[3],
  },
  footerWarning: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
});
