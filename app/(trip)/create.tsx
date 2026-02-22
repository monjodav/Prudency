import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { ContactForm } from '@/src/components/contact/ContactForm';
import { TripMap } from '@/src/components/map/TripMap';
import { scaledIcon } from '@/src/utils/scaling';
import { useTripCreation } from '@/src/hooks/useTripCreation';
import {
  DepartureSection,
  DestinationSection,
  DepartureTimeSection,
  TransportSection,
  ContactSection,
  TogglesSection,
  FooterWarning,
} from '@/src/components/trip/CreateTripSections';

export default function CreateTripScreen() {
  const router = useRouter();
  const {
    destinationAddress,
    departureAddress,
    setDepartureAddress,
    transportMode,
    setTransportMode,
    selectedContactId,
    setSelectedContactId,
    error,
    showAddContact,
    setShowAddContact,
    shareLocation,
    setShareLocation,
    silentNotifications,
    setSilentNotifications,
    departureTime,
    setDepartureTime,
    searchResults,
    isSearching,
    selectedPlace,
    departureLoc,
    route,
    estimatedArrivalTime,
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,
    handleUseCurrentLocation,
    handleDestinationSearch,
    fetchRoute,
    handleSelectPlace,
    handleCreateTrip,
    handleAddContact,
  } = useTripCreation();

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Tu pourras annuler ou prolonger ton trajet en cas de retard ou problemes a tout moment.
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

          {(selectedPlace || departureLoc) && (
            <TripMap
              departure={departureLoc}
              arrival={selectedPlace}
              routeCoordinates={route?.polyline}
              style={styles.mapPreview}
            />
          )}

          {route && (
            <View style={styles.routeInfo}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate-outline" size={scaledIcon(16)} color={colors.primary[400]} />
                <Text style={styles.routeInfoText}>{route.distance.text}</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time-outline" size={scaledIcon(16)} color={colors.primary[400]} />
                <Text style={styles.routeInfoText}>{route.duration.text}</Text>
              </View>
            </View>
          )}

          {estimatedArrivalTime && (
            <View style={styles.arrivalTimeContainer}>
              <Ionicons name="flag-outline" size={scaledIcon(16)} color={colors.primary[300]} />
              <Text style={styles.arrivalTimeLabel}>Heure d'arrivee estimee</Text>
              <Text style={styles.arrivalTimeValue}>
                {estimatedArrivalTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}

          <TransportSection
            selected={transportMode}
            onSelect={(mode) => {
              setTransportMode(mode);
              if (departureLoc && selectedPlace) {
                fetchRoute(departureLoc, selectedPlace, mode);
              }
            }}
          />

          <DepartureTimeSection
            departureTime={departureTime}
            onSetNow={() => setDepartureTime(new Date())}
          />

          <ContactSection
            contacts={contacts}
            contactsLoading={contactsLoading}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => setSelectedContactId(selectedContactId === id ? null : id)}
            onShowAddContact={() => setShowAddContact(true)}
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
              fullWidth
              size="lg"
              icon={<Ionicons name="navigate" size={scaledIcon(20)} color={colors.white} />}
            />
            <Button
              title="Annuler"
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
            />
          </View>

          <FooterWarning />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Ajouter un contact"
        snapPoints={[0.7]}
      >
        <ContactForm
          onSubmit={handleAddContact}
          onCancel={() => setShowAddContact(false)}
          loading={isCreatingContact}
          submitLabel="Ajouter"
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginBottom: spacing[6],
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
  mapPreview: {
    marginBottom: spacing[4],
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[6],
    marginBottom: spacing[4],
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  routeInfoText: {
    ...typography.body,
    color: colors.gray[300],
    fontWeight: '600',
  },
  arrivalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[900],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
  },
  arrivalTimeLabel: {
    ...typography.bodySmall,
    color: colors.gray[300],
    flex: 1,
  },
  arrivalTimeValue: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
