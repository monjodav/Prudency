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
import { RouteSuggestions } from '@/src/components/trip/RouteSuggestions';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { Button } from '@/src/components/ui/Button';
import { useTripCreation } from '@/src/hooks/useTripCreation';
import { colors } from '@/src/theme/colors';
import { borderRadius, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { mvs, scaledIcon } from '@/src/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Page = 'trip' | 'addContact';

interface CreateTripSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateTripSheet({ visible, onClose }: CreateTripSheetProps) {
  const [page, setPage] = useState<Page>('trip');
  const scrollRef = useRef<ScrollView>(null);
  const destinationY = useRef(0);
  const timeY = useRef(0);
  const transportY = useRef(0);

  const {
    destinationAddress,
    departureAddress,
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
    departureSearchResults,
    isDepartureSearching,
    isGeocodingDeparture,
    isResolvingDeparture,
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,
    selectedPlace,
    departureLoc,
    route,
    routes,
    selectedRouteIndex,
    isLoadingRoutes,
    estimatedArrivalTime,
    handleUseCurrentLocation,
    handleDepartureSearch,
    handleSelectDeparturePlace,
    dismissDepartureResults,
    handleDestinationSearch,
    fetchRoute,
    handleSelectPlace,
    dismissDestinationResults,
    handleCreateTrip,
    handleAddContact,
    swapAddresses,
    selectRoute,
    clearDeparture,
    clearDestination,
    savedPlaces,
    recentPlaces,
    handleSelectRecentPlace,
  } = useTripCreation();

  const canLaunch = !!selectedPlace && !!transportMode && routes.length > 0;

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
          ref={scrollRef}
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
            onChangeAddress={handleDepartureSearch}
            onUseCurrentLocation={handleUseCurrentLocation}
            onClear={clearDeparture}
            isGeocoding={isGeocodingDeparture}
            isResolving={isResolvingDeparture}
            isSearching={isDepartureSearching}
            searchResults={departureSearchResults}
            onSelectPlace={handleSelectDeparturePlace}
            onDismissResults={dismissDepartureResults}
          />

          <View style={styles.swapRow}>
            <View style={styles.swapLine} />
            <Pressable
              onPress={swapAddresses}
              style={styles.swapButton}
              hitSlop={8}
            >
              <Ionicons name="swap-vertical" size={scaledIcon(20)} color={colors.gray[400]} />
            </Pressable>
            <View style={styles.swapLine} />
          </View>

          <View onLayout={(e) => { destinationY.current = e.nativeEvent.layout.y; }}>
            <DestinationSection
              address={destinationAddress}
              onChangeAddress={handleDestinationSearch}
              onClear={clearDestination}
              isSearching={isSearching}
              searchResults={searchResults}
              onSelectPlace={handleSelectPlace}
              onDismissResults={dismissDestinationResults}
              savedPlaces={savedPlaces.map((p) => ({
                name: p.name,
                onPress: () => handleSelectRecentPlace(p),
              }))}
              recentPlaces={recentPlaces.map((p) => ({
                name: p.name,
                address: p.address,
                onPress: () => handleSelectRecentPlace(p),
              }))}
              onFocus={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: destinationY.current, animated: true });
                }, 300);
              }}
            />
          </View>

          <View onLayout={(e) => { timeY.current = e.nativeEvent.layout.y; }}>
            <DepartureTimeSection
              departureTime={departureTime}
              onChangeTime={setDepartureTime}
              onSetNow={() => setDepartureTime(new Date())}
              onScrollTo={() => {
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: timeY.current, animated: true });
                }, 100);
              }}
            />
          </View>

          <View onLayout={(e) => { transportY.current = e.nativeEvent.layout.y; }}>
            <TransportSection
              selected={transportMode}
              onSelect={(mode) => {
                Keyboard.dismiss();
                setTransportMode(mode);
                if (departureLoc && selectedPlace) {
                  fetchRoute(departureLoc, selectedPlace, mode);
                }
                setTimeout(() => {
                  scrollRef.current?.scrollTo({ y: transportY.current, animated: true });
                }, 100);
              }}
            />
          </View>

          <RouteSuggestions
            routes={routes}
            selectedIndex={selectedRouteIndex}
            onSelectRoute={selectRoute}
            isLoading={isLoadingRoutes}
            transportMode={transportMode}
            departureTime={departureTime}
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
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[1],
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[800],
  },
  swapButton: {
    padding: spacing[2],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
