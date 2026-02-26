import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Input } from '@/src/components/ui/Input';
import { ListItem } from '@/src/components/ui/ListItem';
import { Toggle } from '@/src/components/ui/Toggle';
import { Checkbox } from '@/src/components/ui/Checkbox';
import { ms, scaledIcon } from '@/src/utils/scaling';
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
        label="Lieu de départ"
        placeholder="D'où pars-tu ?"
        value={address}
        onChangeText={onChangeAddress}
        variant="dark"
      />
      <View style={styles.currentLocationWrapper}>
        <ListItem
          text="Utiliser ma position actuelle"
          variant="outline"
          iconLeft={
            <Ionicons name="locate" size={scaledIcon(20)} color={colors.primary[300]} />
          }
          onPress={onUseCurrentLocation}
        />
      </View>
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
  savedPlaces?: { name: string; onPress: () => void }[];
  recentPlaces?: { name: string; address: string; onPress: () => void }[];
}

export function DestinationSection({
  address,
  onChangeAddress,
  isSearching,
  searchResults,
  onSelectPlace,
  savedPlaces,
  recentPlaces,
}: DestinationSectionProps) {
  return (
    <View>
      <Input
        label="Lieu d'arrivée"
        placeholder="Où vas-tu ?"
        value={address}
        onChangeText={onChangeAddress}
        variant="dark"
      />
      {isSearching && (
        <ActivityIndicator size="small" color={colors.primary[400]} style={styles.searchSpinner} />
      )}
      {searchResults.length > 0 && (
        <View style={styles.resultsCard}>
          {searchResults.map((result, i) => (
            <View key={result.placeId}>
              <ListItem
                text={result.mainText}
                secondaryText={result.secondaryText}
                iconLeft={
                  <Ionicons name="location-outline" size={scaledIcon(20)} color={colors.primary[300]} />
                }
                onPress={() => onSelectPlace(result)}
              />
              {i < searchResults.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
      {searchResults.length === 0 && !isSearching && (
        <>
          {savedPlaces && savedPlaces.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Trajets enregistrés</Text>
              <View style={styles.resultsCard}>
                {savedPlaces.map((place, i) => (
                  <View key={place.name + i}>
                    <ListItem
                      text={place.name}
                      iconLeft={
                        <Ionicons name="bookmark" size={scaledIcon(20)} color={colors.primary[300]} />
                      }
                      onPress={place.onPress}
                    />
                    {i < savedPlaces.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}
          {recentPlaces && recentPlaces.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Trajets récents</Text>
              <View style={styles.resultsCard}>
                {recentPlaces.map((place, i) => (
                  <View key={place.name + i}>
                    <ListItem
                      text={place.name}
                      secondaryText={place.address}
                      iconLeft={
                        <Ionicons name="time" size={scaledIcon(20)} color={colors.primary[300]} />
                      }
                      onPress={place.onPress}
                    />
                    {i < recentPlaces.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// --- Departure Time ---

interface DepartureTimeSectionProps {
  departureTime: Date;
  onChangeTime: (date: Date) => void;
  onSetNow: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const ITEM_HEIGHT = ms(44, 0.4);
const VISIBLE_ITEMS = 5;

function ScrollColumn({ data, selected, onSelect }: {
  data: number[];
  selected: number;
  onSelect: (val: number) => void;
}) {
  const listRef = useRef<FlatList>(null);
  const initialIndex = data.indexOf(selected);

  const handleScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    const value = data[clamped];
    if (value !== undefined && value !== selected) {
      onSelect(value);
    }
  }, [data, selected, onSelect]);

  return (
    <View style={styles.scrollColumnWrapper}>
      <View style={styles.scrollHighlight} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <Pressable onPress={() => onSelect(item)} style={styles.scrollItem}>
              <Text style={[styles.scrollItemText, isSelected && styles.scrollItemTextSelected]}>
                {String(item).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function DepartureTimeSection({ departureTime, onChangeTime, onSetNow }: DepartureTimeSectionProps) {
  const [showPicker, setShowPicker] = useState(false);
  const timeStr = departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleHourChange = useCallback((hour: number) => {
    const next = new Date(departureTime);
    next.setHours(hour);
    onChangeTime(next);
  }, [departureTime, onChangeTime]);

  const handleMinuteChange = useCallback((minute: number) => {
    const next = new Date(departureTime);
    next.setMinutes(minute);
    onChangeTime(next);
  }, [departureTime, onChangeTime]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Temps</Text>
      <Text style={styles.sectionHint}>Indique ton heure de départ</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>Départ</Text>
          <Pressable onPress={() => setShowPicker(!showPicker)} style={styles.timeValueBtn}>
            <Text style={styles.timeValue}>{timeStr}</Text>
          </Pressable>
        </View>
        <ListItem
          text="Partir maintenant"
          variant="outline"
          iconLeft={
            <Ionicons name="time" size={scaledIcon(20)} color={colors.primary[300]} />
          }
          onPress={() => {
            onSetNow();
            setShowPicker(false);
          }}
          style={styles.nowButton}
        />
      </View>
      {showPicker && (
        <View style={styles.pickerCard}>
          <View style={styles.pickerContainer}>
            <ScrollColumn data={HOURS} selected={departureTime.getHours()} onSelect={handleHourChange} />
            <Text style={styles.pickerSeparator}>:</Text>
            <ScrollColumn data={MINUTES} selected={departureTime.getMinutes()} onSelect={handleMinuteChange} />
          </View>
          <View style={styles.pickerActions}>
            <Pressable
              onPress={() => {
                onSetNow();
                setShowPicker(false);
              }}
              style={styles.pickerBtnSecondary}
            >
              <Text style={styles.pickerBtnSecondaryText}>Maintenant</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPicker(false)}
              style={styles.pickerBtnPrimary}
            >
              <Text style={styles.pickerBtnPrimaryText}>Confirmer</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  { mode: 'bike', label: 'Vélo', icon: 'bicycle-outline' },
  { mode: 'car', label: 'Voiture', icon: 'car-outline' },
];

interface TransportSectionProps {
  selected: TransportMode;
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
      <Text style={styles.sectionLabel}>Contact</Text>
      {contactsLoading ? (
        <ActivityIndicator size="small" color={colors.primary[400]} />
      ) : contacts.length === 0 ? (
        <>
          <Text style={styles.contactHint}>
            Pour activer les alertes pendant ton trajet,{' '}
            <Text style={styles.contactHintBold}>
              Prudency a besoin d'au moins une personne de confiance confirmée.
            </Text>
            {' '}La personne choisie doit avoir{' '}
            <Text style={styles.contactHintBold}>accepté ce rôle</Text>
            {' '}pour pouvoir{' '}
            <Text style={styles.contactHintBold}>
              recevoir une alerte en cas de problème.
            </Text>
          </Text>
          <ListItem
            text="Ajouter un contact de confiance"
            variant="outline"
            iconRight={
              <Ionicons name="add" size={scaledIcon(20)} color={colors.primary[300]} />
            }
            onPress={onShowAddContact}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionHint}>
            Il sera alerté en cas de retard ou anomalie durant ton trajet.
          </Text>
          <View style={styles.contactsList}>
            {contacts.map((contact) => {
              const isSelected = selectedContactId === contact.id;
              return (
                <ListItem
                  key={contact.id}
                  text={contact.name}
                  variant={isSelected ? 'selected' : 'default'}
                  iconLeft={
                    <Ionicons
                      name="person-circle"
                      size={scaledIcon(32)}
                      color={colors.secondary[400]}
                    />
                  }
                  iconRight={
                    <Checkbox
                      checked={isSelected}
                      onToggle={() => onSelectContact(contact.id)}
                    />
                  }
                  onPress={() => onSelectContact(contact.id)}
                  style={styles.contactItem}
                />
              );
            })}
          </View>
        </>
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

// --- Footer ---

export function FooterWarning() {
  return (
    <Text style={styles.footerWarning}>
      Tu disposes de 15 minutes pour finaliser ton trajet. Passé ce délai, une alerte sera envoyée à ta personne de confiance.
    </Text>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    ...typography.label,
    color: colors.gray[400],
    marginBottom: spacing[1],
  },
  sectionHint: {
    ...typography.caption,
    color: colors.gray[500],
    marginBottom: spacing[3],
  },
  currentLocationWrapper: {
    marginTop: -spacing[2],
    marginBottom: spacing[4],
  },
  searchSpinner: {
    marginVertical: spacing[2],
  },
  resultsCard: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: spacing[4],
  },
  suggestionsSection: {
    marginBottom: spacing[4],
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[2],
  },
  timeRow: {
    gap: spacing[3],
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timeLabel: {
    ...typography.body,
    color: colors.gray[300],
  },
  timeValueBtn: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  timeValue: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  pickerCard: {
    backgroundColor: colors.gray[950],
    borderRadius: borderRadius.lg,
    marginTop: spacing[3],
    overflow: 'hidden',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  pickerBtnSecondaryText: {
    ...typography.bodySmall,
    color: colors.gray[300],
    fontWeight: '500',
  },
  pickerBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  pickerBtnPrimaryText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  scrollColumnWrapper: {
    width: ms(72, 0.4),
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  scrollHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: spacing[1],
    right: spacing[1],
    height: ITEM_HEIGHT,
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.md,
    zIndex: -1,
  },
  scrollItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollItemText: {
    ...typography.body,
    color: colors.gray[600],
    fontSize: ms(18, 0.4),
  },
  scrollItemTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  pickerSeparator: {
    ...typography.h2,
    color: colors.white,
    marginHorizontal: spacing[1],
  },
  nowButton: {
    flex: 0,
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
  contactHint: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[3],
    lineHeight: ms(22, 0.4),
  },
  contactHintBold: {
    fontWeight: '700',
    color: colors.gray[300],
  },
  contactsList: {
    gap: spacing[2],
  },
  contactItem: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[800],
  },
  toggleItem: {
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  footerWarning: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
  },
});
