import { ContactForm } from '@/src/components/contact/ContactForm';
import {
  ContactSection,
  DepartureSection,
  DepartureTimeSection,
  DestinationSection,
  FooterWarning,
  TogglesSection,
  TransportSection,
} from '@/src/components/trip/CreateTripSections';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { Button } from '@/src/components/ui/Button';
import { useTripCreation } from '@/src/hooks/useTripCreation';
import { colors } from '@/src/theme/colors';
import { borderRadius, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { mvs, scaledIcon } from '@/src/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Page = 'trip' | 'addContact';

interface CreateTripSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateTripSheet({ visible, onClose }: CreateTripSheetProps) {
  const [page, setPage] = useState<Page>('trip');

  const {
    destinationAddress,
    departureAddress,
    setDepartureAddress,
    transportMode,
    setTransportMode,
    selectedContactId,
    setSelectedContactId,
    error,
    shareLocation,
    setShareLocation,
    silentNotifications,
    setSilentNotifications,
    departureTime,
    setDepartureTime,
    searchResults,
    isSearching,
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,
    selectedPlace,
    handleUseCurrentLocation,
    handleDestinationSearch,
    handleSelectPlace,
    handleCreateTrip,
    handleAddContact,
  } = useTripCreation();

  const canLaunch = !!selectedPlace && !!transportMode;

  const handleClose = () => {
    setPage('trip');
    onClose();
  };

  const handleAddContactSubmit = async (data: Parameters<typeof handleAddContact>[0]) => {
    await handleAddContact(data);
    setPage('trip');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      snapPoints={[0.9]}
      dark
      overlayOpacity={0.2}
      title={page === 'addContact' ? 'Ajouter une personne de confiance' : undefined}
      onBack={page === 'addContact' ? () => setPage('trip') : undefined}
    >
      {page === 'trip' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Ajouter un trajet</Text>
          <Text style={styles.subtitle}>
            Tu pourras annuler ou prolonger ton trajet en cas de retard ou problèmes à tout moment.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={scaledIcon(18)} color={colors.error[400]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <DepartureSection
            address={departureAddress}
            onChangeAddress={setDepartureAddress}
            onUseCurrentLocation={handleUseCurrentLocation}
          />

          <DestinationSection
            address={destinationAddress}
            onChangeAddress={handleDestinationSearch}
            isSearching={isSearching}
            searchResults={searchResults}
            onSelectPlace={handleSelectPlace}
          />

          <DepartureTimeSection
            departureTime={departureTime}
            onChangeTime={setDepartureTime}
            onSetNow={() => setDepartureTime(new Date())}
          />

          <TransportSection
            selected={transportMode}
            onSelect={setTransportMode}
          />

          <ContactSection
            contacts={contacts}
            contactsLoading={contactsLoading}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => setSelectedContactId(selectedContactId === id ? null : id)}
            onShowAddContact={() => setPage('addContact')}
          />

          <TogglesSection
            shareLocation={shareLocation}
            onToggleShareLocation={setShareLocation}
            silentNotifications={silentNotifications}
            onToggleSilentNotifications={setSilentNotifications}
          />

          <View style={styles.actions}>
            <Button
              title="Lancer le trajet"
              variant="secondary"
              onPress={handleCreateTrip}
              loading={isCreating}
              disabled={!canLaunch}
              fullWidth
              size="lg"
              icon={<Ionicons name="navigate" size={scaledIcon(20)} color={colors.white} />}
            />
          </View>

          <FooterWarning />
        </ScrollView>
      ) : (
        <ContactForm
          onSubmit={handleAddContactSubmit}
          onCancel={() => setPage('trip')}
          loading={isCreatingContact}
          submitLabel="Envoyer une demande"
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: mvs(140, 0.5),
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(202, 31, 31, 0.15)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[400],
    flex: 1,
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
