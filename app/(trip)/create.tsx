import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
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
  Keyboard,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography, fontFamilies } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, mvs, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { Button } from '@/src/components/ui/Button';
import { ContactForm } from '@/src/components/contact/ContactForm';
import { TripMap } from '@/src/components/map/TripMap';
import { RouteSuggestions } from '@/src/components/trip/RouteSuggestions';
import { useTripCreation } from '@/src/hooks/useTripCreation';
import { useTripStore } from '@/src/stores/tripStore';
import { TransitLineIcon, getTransitMode } from '@/src/components/transit/TransitLineBadge';
import { MetroIcon } from '@/src/components/transit/MetroIcon';
import { TramIcon } from '@/src/components/transit/TramIcon';
import { BusIcon } from '@/src/components/transit/BusIcon';
import type { RouteStep } from '@/src/services/directionsService';
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
const SHEET_HEIGHT_FULL = SCREEN_HEIGHT * 0.82;
const SHEET_HEIGHT_REDUCED = ms(220, 0.4);

const TRANSPORT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  walk: 'walk',
  transit: 'bus',
  bike: 'bicycle',
  car: 'car',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const km = meters / 1000;
  return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
}

function CompactWalkChip({ durationSeconds }: { durationSeconds: number }) {
  return (
    <View style={styles.compactWalk}>
      <Ionicons name="walk" size={scaledIcon(12)} color={colors.gray[200]} />
      <Text style={styles.compactWalkText}>
        {Math.max(1, Math.ceil(durationSeconds / 60))}
      </Text>
    </View>
  );
}

function CompactSummary({ steps }: { steps: RouteStep[] }) {
  const items: React.ReactNode[] = [];
  const chevronSize = scaledIcon(8);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (step.travelMode === 'WALKING') {
      if (items.length > 0) {
        items.push(
          <Ionicons key={`c${i}`} name="chevron-forward" size={chevronSize} color={colors.gray[200]} />,
        );
      }
      items.push(
        <CompactWalkChip key={`w${i}`} durationSeconds={step.duration.value} />,
      );
    } else if (step.travelMode === 'TRANSIT' && step.transitDetails) {
      if (items.length > 0) {
        items.push(
          <Ionicons key={`c${i}`} name="chevron-forward" size={chevronSize} color={colors.gray[200]} />,
        );
      }
      const lineId = step.transitDetails.line.shortName || step.transitDetails.line.name;
      const mode = getTransitMode(step.transitDetails.line.vehicleType, lineId);
      const badgeSize = scaledIcon(16);
      items.push(
        <View key={`t${i}`} style={styles.compactTransit}>
          {mode === 'metro' && <MetroIcon size={badgeSize} />}
          {mode === 'tram' && <TramIcon size={badgeSize} />}
          {mode === 'bus' && <BusIcon size={badgeSize} />}
          {(mode === 'rer' || mode === 'generic') && (
            <Ionicons name={mode === 'rer' ? 'train-outline' : 'bus-outline'} size={badgeSize} color={colors.gray[200]} />
          )}
          <TransitLineIcon line={step.transitDetails.line} size={badgeSize} />
        </View>,
      );
    }
  }

  return <>{items}</>;
}
const DISMISS_THRESHOLD = 120;

export default function CreateTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contactSheetRef = useRef<BottomSheet>(null);
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
    selectedPlace,
    departureLoc,
    route,
    estimatedArrivalTime,
    routes,
    selectedRouteIndex,
    isLoadingRoutes,
    isResolvingDeparture,
    isGeocodingDeparture,
    contacts,
    contactsLoading,
    isCreating,
    isCreatingContact,
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
    routeSegments,
    savedPlaces,
    recentPlaces,
    handleSelectRecentPlace,
  } = useTripCreation();

  const { lastKnownLat, lastKnownLng } = useTripStore();
  const userLocation =
    lastKnownLat != null && lastKnownLng != null
      ? { lat: lastKnownLat, lng: lastKnownLng }
      : null;

  const canLaunch = !!selectedPlace && !!transportMode && routes.length > 0;

  const memoizedSavedPlaces = useMemo(
    () => savedPlaces.map((p) => ({
      name: p.name,
      onPress: () => handleSelectRecentPlace(p),
    })),
    [savedPlaces, handleSelectRecentPlace],
  );

  const memoizedRecentPlaces = useMemo(
    () => recentPlaces.map((p) => ({
      name: p.name,
      address: p.address,
      onPress: () => handleSelectRecentPlace(p),
    })),
    [recentPlaces, handleSelectRecentPlace],
  );

  // Track the current snap position so PanResponder knows where we are
  const currentSnap = useRef<'full' | 'reduced'>('full');
  const [snapState, setSnapState] = useState<'full' | 'reduced'>('full');

  const [heading, setHeading] = useState<number | null>(null);
  useEffect(() => {
    if (snapState !== 'reduced') return;

    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;
    Location.watchHeadingAsync((h) => {
      if (h.trueHeading >= 0) setHeading(h.trueHeading);
    }).then((s) => {
      if (cancelled) {
        s.remove();
      } else {
        sub = s;
      }
    });
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [snapState]);

  const animateSheet = useCallback(
    (toSnap: 'full' | 'reduced' | 'dismiss') => {
      if (toSnap === 'dismiss') {
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
        return;
      }

      currentSnap.current = toSnap;
      setSnapState(toSnap);

      if (toSnap === 'reduced') {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - SHEET_HEIGHT_REDUCED,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - SHEET_HEIGHT_FULL,
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
      }
    },
    [translateY, backdropOpacity, router],
  );

  const dismiss = useCallback(() => animateSheet('dismiss'), [animateSheet]);

  // Open sheet on mount (fire once only)
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      animateSheet('full');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap to reduced when routes are first loaded (route goes from null → value)
  const prevRouteRef = useRef(route);
  useEffect(() => {
    if (route && !prevRouteRef.current) {
      animateSheet('reduced');
    }
    prevRouteRef.current = route;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const routeRef = useRef(route);
  routeRef.current = route;

  const animateSheetRef = useRef(animateSheet);
  animateSheetRef.current = animateSheet;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const baseY = SCREEN_HEIGHT - SHEET_HEIGHT_FULL;
        const newY = baseY + gestureState.dy;
        translateY.setValue(Math.max(baseY, newY));
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        if (dy > DISMISS_THRESHOLD || vy > 0.5) {
          if (routeRef.current) {
            animateSheetRef.current('reduced');
          } else {
            animateSheetRef.current('dismiss');
          }
        } else {
          animateSheetRef.current('full');
        }
      },
    }),
  ).current;

  const [contactError, setContactError] = useState<string | null>(null);

  const handleAddContactSubmit = async (data: Parameters<typeof handleAddContact>[0]) => {
    try {
      setContactError(null);
      await handleAddContact(data);
      contactSheetRef.current?.close();
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du contact.');
    }
  };

  const contactSnapPoints = useMemo(() => ['70%'], []);

  const renderContactBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Map — only mounted when sheet is reduced to show route preview.
         In full mode the home screen map is visible through the transparent background. */}
      {snapState === 'reduced' && (
        <TripMap
          departure={departureLoc}
          arrival={selectedPlace}
          routeCoordinates={route?.polyline}
          routeSegments={routeSegments}
          steps={route?.steps}
          bottomPadding={180}
          userLocation={userLocation}
          userHeading={heading}
          showUserLocation
          style={styles.fullscreenMap}
        />
      )}

      {/* Backdrop — tap to dismiss */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_HEIGHT_FULL, transform: [{ translateY }] },
        ]}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Handle bar — swipe to snap/dismiss */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Reduced action bar — visible when sheet is collapsed */}
        {snapState === 'reduced' && (
          <View style={{ paddingBottom: insets.bottom }}>
            {/* Trip info — mirrors RouteCard layout */}
            {route && (
              <View style={styles.reducedInfo}>
                <Ionicons
                  name={TRANSPORT_ICONS[transportMode] ?? 'walk'}
                  size={scaledIcon(20)}
                  color={colors.white}
                />
                <View style={styles.reducedContent}>
                  {transportMode === 'transit' ? (
                    <>
                      <View style={styles.reducedHeaderRow}>
                        <Text style={styles.reducedTimeRange}>
                          {formatTime(departureTime)} - {estimatedArrivalTime ? formatTime(estimatedArrivalTime) : ''}
                        </Text>
                        <Text style={styles.reducedSeparator}>|</Text>
                        <Text style={styles.reducedDuration}>{formatDuration(route.duration.value)}</Text>
                      </View>
                      <View style={styles.reducedSequence}>
                        <CompactSummary steps={route.steps} />
                      </View>
                    </>
                  ) : (
                    <>
                      {route.summary !== '' && (
                        <Text style={styles.reducedSummary} numberOfLines={1}>
                          <Text style={styles.reducedViaBold}>Via </Text>{route.summary}
                        </Text>
                      )}
                      <Text style={styles.reducedSubInfo}>
                        {formatDuration(route.duration.value)} | {formatDistance(route.distance.value)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}

            <View style={styles.reducedActions}>
              <Pressable onPress={() => animateSheet('full')} style={styles.reducedChangeBtn}>
                <Text style={styles.reducedChangeText}>Changer</Text>
              </Pressable>
              <Pressable onPress={() => animateSheet('full')} style={styles.reducedSelectBtn}>
                <Text style={styles.reducedSelectText}>Sélectionner ce trajet</Text>
              </Pressable>
            </View>
          </View>
        )}

        {snapState === 'full' && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                  savedPlaces={memoizedSavedPlaces}
                  recentPlaces={memoizedRecentPlaces}
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
                onSelectRoute={(index) => {
                  selectRoute(index);
                  animateSheet('reduced');
                }}
                isLoading={isLoadingRoutes}
                transportMode={transportMode}
                departureTime={departureTime}
              />

              <ContactSection
                contacts={contacts}
                contactsLoading={contactsLoading}
                selectedContactId={selectedContactId}
                onSelectContact={(id) => setSelectedContactId(selectedContactId === id ? null : id)}
                onShowAddContact={() => { setContactError(null); contactSheetRef.current?.snapToIndex(0); }}
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
        </KeyboardAvoidingView>
        )}
      </Animated.View>

      <BottomSheet
        ref={contactSheetRef}
        index={-1}
        snapPoints={contactSnapPoints}
        enablePanDownToClose
        backdropComponent={renderContactBackdrop}
        backgroundStyle={styles.contactSheetBackground}
        handleIndicatorStyle={styles.contactSheetHandle}
        enableDynamicSizing={false}
      >
        <View style={styles.contactSheetContent}>
          <Text style={styles.addContactTitle}>Ajouter une personne{'\n'}de confiance</Text>
          {contactError && (
            <View style={styles.contactErrorBanner}>
              <Ionicons name="alert-circle-outline" size={scaledIcon(16)} color={colors.error[400]} />
              <Text style={styles.contactErrorText}>{contactError}</Text>
            </View>
          )}
          <ContactForm
            onSubmit={handleAddContactSubmit}
            onCancel={() => contactSheetRef.current?.close()}
            loading={isCreatingContact}
            submitLabel="Envoyer une demande"
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  fullscreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    paddingBottom: spacing[8],
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
  reducedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[6],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing[4],
    gap: spacing[3],
  },
  reducedContent: {
    flex: 1,
    gap: spacing[1],
  },
  reducedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  reducedTimeRange: {
    ...typography.caption,
    color: colors.gray[300],
  },
  reducedSeparator: {
    ...typography.caption,
    color: colors.gray[500],
  },
  reducedDuration: {
    ...typography.body,
    fontFamily: fontFamilies.inter.semibold,
    fontWeight: '600',
    color: colors.white,
  },
  reducedSequence: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(5, 0.3),
  },
  reducedSummary: {
    ...typography.caption,
    color: colors.gray[200],
  },
  reducedViaBold: {
    fontFamily: fontFamilies.inter.bold,
    fontWeight: '700',
  },
  reducedSubInfo: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: ms(2, 0.3),
  },
  compactWalk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(1, 0.3),
  },
  compactWalkText: {
    ...typography.caption,
    fontSize: ms(10, 0.4),
    color: colors.gray[200],
  },
  compactTransit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2, 0.3),
  },
  reducedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    gap: spacing[3],
  },
  reducedChangeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
  },
  reducedChangeText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  reducedSelectBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: scaledRadius(12),
  },
  reducedSelectText: {
    ...typography.body,
    color: colors.white,
    fontFamily: fontFamilies.inter.bold,
    fontWeight: '700',
  },
  addContactTitle: {
    ...typography.h3,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  contactSheetBackground: {
    backgroundColor: 'rgba(15, 15, 15, 0.97)',
  },
  contactSheetHandle: {
    backgroundColor: '#6d6d6d',
  },
  contactSheetContent: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
  },
  contactErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(202, 31, 31, 0.15)',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  contactErrorText: {
    ...typography.bodySmall,
    color: colors.error[400],
    flex: 1,
  },
});
