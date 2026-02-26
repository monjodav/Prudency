import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Dimensions,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { Button } from '@/src/components/ui/Button';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { ContactForm } from '@/src/components/contact/ContactForm';
import { TripMap } from '@/src/components/map/TripMap';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.90;
const DISMISS_THRESHOLD = 120;

export default function CreateTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT - SHEET_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        const newY = SCREEN_HEIGHT - SHEET_HEIGHT + gestureState.dy;
        if (newY >= SCREEN_HEIGHT - SHEET_HEIGHT) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - SHEET_HEIGHT,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }).start();
        }
      },
    })
  ).current;

  return (
    <>
      <View style={styles.container}>
        {/* Backdrop — tap to dismiss */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { height: SHEET_HEIGHT, transform: [{ translateY }] },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Handle bar — swipe to dismiss */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
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
                  <Text style={styles.arrivalTimeLabel}>Heure d'arrivée estimée</Text>
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
                onChangeTime={setDepartureTime}
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
              </View>

              <FooterWarning />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      <BottomSheet
        visible={showAddContact}
        onClose={() => setShowAddContact(false)}
        title="Ajouter une personne de confiance"
        snapPoints={[0.7]}
        dark
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
  },
  flex: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopLeftRadius: scaledRadius(25),
    borderTopRightRadius: scaledRadius(25),
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: ms(40, 0.5),
    height: ms(4, 0.5),
    backgroundColor: '#6d6d6d',
    borderRadius: scaledRadius(2),
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing[2],
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
