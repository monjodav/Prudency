import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Modal } from '@/src/components/ui/Modal';
import { AlertButton } from '@/src/components/alert/AlertButton';
import { AlertConfirmation } from '@/src/components/alert/AlertConfirmation';
import { AnomalyDialog } from '@/src/components/trip/AnomalyDialog';
import { NoResponseDialog } from '@/src/components/trip/NoResponseDialog';
import { TopStatusCard } from '@/src/components/trip/TopStatusCard';
import { ExtendModal } from '@/src/components/trip/ExtendModal';
import { CancelTripDialog } from '@/src/components/trip/CancelTripDialog';
import { EditTripSheet } from '@/src/components/trip/EditTripSheet';
import { TripMap } from '@/src/components/map/TripMap';
import { DirectionsBottomSheet } from '@/src/components/trip/DirectionsBottomSheet';
import { useTripStore } from '@/src/stores/tripStore';
import { useActiveTrip } from '@/src/hooks/useActiveTrip';
import { useTrip } from '@/src/hooks/useTrip';
import { useAlert } from '@/src/hooks/useAlert';
import { usePanicAlert } from '@/src/hooks/usePanicAlert';
import { useLocation } from '@/src/hooks/useLocation';
import { useContacts } from '@/src/hooks/useContacts';
import { useAnomalyDetection } from '@/src/hooks/useAnomalyDetection';
import { useArrivalDetection } from '@/src/hooks/useArrivalDetection';
import { useTripNotifications } from '@/src/hooks/useTripNotifications';
import { useNotificationsQuery } from '@/src/hooks/useNotificationsQuery';
import { useCurrentStep } from '@/src/hooks/useCurrentStep';
import { fetchDirections, buildRouteSegments } from '@/src/services/directionsService';
import { ms, scaledIcon } from '@/src/utils/scaling';
import type { TripMapRef } from '@/src/components/map/TripMap';
import type { DecodedRoute, RouteSegment, TravelMode } from '@/src/services/directionsService';
import type { EditTripInput } from '@/src/services/tripService';

const TRANSPORT_TO_TRAVEL: Record<string, TravelMode> = {
  car: 'driving',
  walk: 'walking',
  bike: 'bicycling',
  transit: 'transit',
};

const FAB_SIZE = ms(48, 0.4);

export default function ActiveTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<TripMapRef>(null);

  const {
    lastKnownLat,
    lastKnownLng,
    batteryLevel,
    routeData: storeRouteData,
    routeSegments: storeRouteSegments,
    routeSteps: storeRouteSteps,
    transportMode: storeTransportMode,
    departureLoc: storeDepartureLoc,
    reset: resetTripStore,
  } = useTripStore();

  const { trip, isOvertime } = useActiveTrip();
  const { cancelTrip, isCancelling, extendTrip, isExtending, editTrip, isEditing } = useTrip();
  const { triggerAlert, isTriggering } = useAlert();
  const { triggerPanic, isTriggering: isPanicTriggering } = usePanicAlert();
  const { startTracking, stopTracking, isTracking } = useLocation({
    tripStatus: trip?.status ?? null,
    remainingMinutes: trip?.estimated_arrival_at
      ? Math.max(0, Math.round((new Date(trip.estimated_arrival_at).getTime() - Date.now()) / 60_000))
      : null,
    tripStartedAt: trip?.started_at ?? null,
  });
  const { contacts } = useContacts();
  const { unreadCount } = useNotificationsQuery();
  useTripNotifications(trip);

  // Route state: prefer store data, fall back to local fetch
  const [localRoute, setLocalRoute] = useState<DecodedRoute | null>(null);
  const [localSegments, setLocalSegments] = useState<RouteSegment[] | null>(null);

  const route = storeRouteData ?? localRoute;
  const routeSegments = storeRouteSegments ?? localSegments;
  const routeSteps = storeRouteSteps ?? localRoute?.steps ?? null;

  // Heading state for user dot
  const [heading, setHeading] = useState<number | null>(null);

  // Heading subscription
  useEffect(() => {
    let cancelled = false;
    let headingSub: Location.LocationSubscription | null = null;

    async function startHeading() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      headingSub = await Location.watchHeadingAsync((h) => {
        if (!cancelled && h.trueHeading >= 0) {
          setHeading(h.trueHeading);
        }
      });
    }

    startHeading();
    return () => {
      cancelled = true;
      headingSub?.remove();
    };
  }, []);

  const {
    showAnomalyDialog,
    showNoResponseDialog,
    detectedAnomalyType,
    dismissAnomalyDialog,
    handleAnomalySelect,
    handleAllGood,
    handleTriggerAlert: onNoResponseTriggerAlert,
    handleAutoAlert: onNoResponseAutoAlert,
  } = useAnomalyDetection({
    routePolyline: route?.polyline,
    estimatedArrivalAt: trip?.estimated_arrival_at,
    tripStatus: trip?.status,
  });

  const handleArrivalDetected = useCallback(() => {
    router.replace('/(trip)/complete');
  }, [router]);

  useArrivalDetection({
    trip,
    onArrivalDetected: handleArrivalDetected,
  });

  const [showLaunchToast, setShowLaunchToast] = useState(true);
  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLaunchToast(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Departure: prefer store (user's actual departure), fall back to trip DB coords
  const departure = storeDepartureLoc
    ?? (trip?.departure_lat != null && trip?.departure_lng != null
      ? { lat: trip.departure_lat, lng: trip.departure_lng }
      : null);

  const arrival = trip?.arrival_lat != null && trip?.arrival_lng != null
    ? { lat: trip.arrival_lat, lng: trip.arrival_lng }
    : null;

  // Fallback route fetch: only if store has no route (cold restart)
  useEffect(() => {
    if (storeRouteData || localRoute) return;
    if (!departure || !arrival) return;

    const dbMode = trip?.transport_mode ?? null;
    const travelMode: TravelMode = (dbMode && TRANSPORT_TO_TRAVEL[dbMode]) ?? 'driving';

    let cancelled = false;
    fetchDirections(departure, arrival, travelMode)
      .then((r) => {
        if (r && !cancelled) {
          setLocalRoute(r);
          setLocalSegments(buildRouteSegments(r));
        }
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, [storeRouteData, localRoute, departure?.lat, departure?.lng, arrival?.lat, arrival?.lng, trip?.transport_mode]);

  useEffect(() => {
    if (!isTracking) {
      startTracking().catch(() => undefined);
    }
  }, [isTracking, startTracking]);

  // User location for map
  const userLocation = lastKnownLat != null && lastKnownLng != null
    ? { lat: lastKnownLat, lng: lastKnownLng }
    : null;

  // Current step tracking
  const currentStepIndex = useCurrentStep(routeSteps ?? null, userLocation);

  const fireAlert = useCallback(async (type: 'manual' | 'automatic') => {
    if (!trip) return;
    try {
      await triggerAlert({
        tripId: trip.id,
        type,
        lat: lastKnownLat ?? undefined,
        lng: lastKnownLng ?? undefined,
        batteryLevel: batteryLevel ?? undefined,
      });
      router.replace('/(trip)/alert-active');
    } catch (err) {
      if (__DEV__) console.warn('Alert trigger failed:', err);
    }
  }, [trip, triggerAlert, lastKnownLat, lastKnownLng, batteryLevel, router]);

  const handleNoResponseTriggerAlert = useCallback(() => {
    onNoResponseTriggerAlert();
    fireAlert('manual');
  }, [onNoResponseTriggerAlert, fireAlert]);

  const handleNoResponseAutoAlert = useCallback(() => {
    onNoResponseAutoAlert();
    fireAlert('automatic');
  }, [onNoResponseAutoAlert, fireAlert]);

  const handleAlert = useCallback(async () => {
    try {
      await triggerPanic(true);
    } catch {
      setShowAlertConfirmation(true);
    }
  }, [triggerPanic]);

  const handlePause = async () => {
    try {
      await stopTracking();
    } finally {
      router.replace('/(trip)/paused');
    }
  };

  const handleEndTrip = () => {
    router.replace('/(trip)/complete');
  };

  const handleCancelTrip = () => {
    setShowCancelDialog(true);
  };

  const handleQuickCancel = async () => {
    if (!trip) return;
    try {
      await stopTracking();
    } catch {
      // tracking cleanup is best-effort
    }
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      router.replace('/(tabs)');
    } catch (err) {
      if (__DEV__) console.warn('Quick cancel failed:', err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!trip) return;
    try {
      await stopTracking();
    } catch {
      // tracking cleanup is best-effort
    }
    try {
      await cancelTrip(trip.id);
      resetTripStore();
      setShowCancelDialog(false);
      router.replace('/(tabs)');
    } catch (err) {
      if (__DEV__) console.warn('Trip cancel failed:', err);
    }
  };

  const handleEditTrip = async (input: EditTripInput) => {
    if (!trip) return;
    try {
      await editTrip({ id: trip.id, input });
      setShowEditSheet(false);
      if (input.arrivalLat != null && input.arrivalLng != null && departure) {
        const newArrival = { lat: input.arrivalLat, lng: input.arrivalLng };
        const dbMode = trip?.transport_mode ?? null;
        const travelMode: TravelMode = (dbMode && TRANSPORT_TO_TRAVEL[dbMode]) ?? 'driving';
        const newRoute = await fetchDirections(departure, newArrival, travelMode);
        if (newRoute) {
          setLocalRoute(newRoute);
          setLocalSegments(buildRouteSegments(newRoute));
        }
      }
    } catch (err) {
      if (__DEV__) console.warn('Trip edit failed:', err);
    }
  };

  const handleExtend = async (minutes: number) => {
    if (!trip) return;
    try {
      await extendTrip({ id: trip.id, minutes });
      setShowExtendModal(false);
    } catch (err) {
      if (__DEV__) console.warn('Trip extend failed:', err);
    }
  };

  const handleRecenter = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion({
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  }, [userLocation]);

  // Bottom sheet collapsed peek height (must match DirectionsBottomSheet)
  const sheetPeekHeight = ms(80, 0.4) + insets.bottom;
  const fabBottom = sheetPeekHeight + spacing[3];

  return (
    <View style={styles.container}>
      {/* Fullscreen map */}
      <TripMap
        ref={mapRef}
        departure={departure}
        arrival={arrival}
        routeSegments={routeSegments ?? undefined}
        routeCoordinates={route?.polyline}
        steps={routeSteps ?? undefined}
        showUserLocation
        userLocation={userLocation}
        userHeading={heading}
        followUser
        bottomPadding={280}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Launch toast or TopStatusCard with dropdown */}
      {showLaunchToast ? (
        <View style={[styles.launchToast, { top: insets.top + spacing[2] }]}>
          <View style={styles.launchToastContent}>
            <Ionicons name="walk" size={ms(24)} color={colors.white} />
            <View style={styles.launchToastText}>
              <Text style={styles.launchToastTitle}>Trajet lancé</Text>
              <Text style={styles.launchToastSubtitle}>Ton trajet va démarrer</Text>
            </View>
            <TouchableOpacity onPress={handleQuickCancel} hitSlop={8}>
              <Text style={styles.launchToastCancel}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.statusCardContainer, { top: insets.top + spacing[2] }]}>
          <TopStatusCard
            isExpanded={isInfoExpanded}
            onToggleExpand={() => setIsInfoExpanded((v) => !v)}
            isOvertime={isOvertime}
            trip={trip}
            contactCount={contacts.length}
            onEndTrip={handleEndTrip}
            onPauseTrip={handlePause}
            onExtendTrip={() => setShowExtendModal(true)}
            onEditTrip={() => setShowEditSheet(true)}
            onCancelTrip={handleCancelTrip}
            isCancelling={isCancelling}
          />
        </View>
      )}

      {/* FAB column — right side (hidden when sheet expanded) */}
      {!isSheetExpanded && (
        <View style={[styles.fabColumn, { bottom: fabBottom }]}>
          <Pressable
            style={styles.fab}
            onPress={() => router.push('/(trip)/notes')}
          >
            <Ionicons name="pencil-outline" size={scaledIcon(22)} color={colors.white} />
          </Pressable>
          <Pressable
            style={styles.fab}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={scaledIcon(22)} color={colors.white} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={styles.fab}
            onPress={() => router.push('/(tabs)/contacts')}
          >
            <Ionicons name="people-outline" size={scaledIcon(22)} color={colors.white} />
          </Pressable>
        </View>
      )}

      {/* Alert button — bottom left, above recenter (hidden when sheet expanded) */}
      {!isSheetExpanded && (
        <View style={[styles.alertButtonContainer, { bottom: fabBottom + FAB_SIZE + spacing[4] }]}>
          <AlertButton
            onTrigger={handleAlert}
            disabled={isPanicTriggering || isTriggering}
            size={FAB_SIZE}
          />
        </View>
      )}

      {/* Recenter button — bottom left (hidden when sheet expanded) */}
      {!isSheetExpanded && (
        <View style={[styles.recenterContainer, { bottom: fabBottom }]}>
          <Pressable style={styles.fab} onPress={handleRecenter}>
            <Ionicons name="locate" size={scaledIcon(22)} color={colors.white} />
          </Pressable>
        </View>
      )}

      {/* Directions bottom sheet */}
      {routeSteps && routeSteps.length > 0 && (
        <DirectionsBottomSheet
          steps={routeSteps}
          currentStepIndex={currentStepIndex}
          bottomInset={0}
          destinationName={trip?.arrival_address}
          onExpandChange={setIsSheetExpanded}
        />
      )}

      <Modal
        visible={showAlertConfirmation}
        onClose={() => setShowAlertConfirmation(false)}
      >
        <AlertConfirmation
          contactCount={contacts.length}
          onDismiss={() => setShowAlertConfirmation(false)}
          onCancel={() => setShowAlertConfirmation(false)}
        />
      </Modal>

      <ExtendModal
        visible={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onExtend={handleExtend}
        isExtending={isExtending}
      />

      <AnomalyDialog
        visible={showAnomalyDialog}
        onClose={dismissAnomalyDialog}
        onSelect={handleAnomalySelect}
        anomalyType={detectedAnomalyType ?? 'generic'}
      />

      <NoResponseDialog
        visible={showNoResponseDialog}
        onAllGood={handleAllGood}
        onTriggerAlert={handleNoResponseTriggerAlert}
        onAutoAlert={handleNoResponseAutoAlert}
      />

      <CancelTripDialog
        visible={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        isCancelling={isCancelling}
        hasContact={!!trip?.trusted_contact_id}
      />

      <EditTripSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSave={handleEditTrip}
        isSaving={isEditing}
        trip={trip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary[900],
  },
  statusCardContainer: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 5,
  },
  launchToast: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    backgroundColor: colors.secondary[700],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    zIndex: 5,
  },
  launchToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  launchToastText: {
    flex: 1,
  },
  launchToastTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  launchToastSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  launchToastCancel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.white,
  },
  fabColumn: {
    position: 'absolute',
    right: spacing[4],
    gap: spacing[4],
    alignItems: 'center',
    zIndex: 7,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(100, 100, 100, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: ms(25, 0.4),
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -ms(2, 0.4),
    right: -ms(2, 0.4),
    minWidth: ms(18, 0.4),
    height: ms(18, 0.4),
    borderRadius: ms(9, 0.4),
    backgroundColor: colors.brandPosition[50],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(4, 0.4),
  },
  badgeText: {
    color: colors.white,
    fontSize: ms(10, 0.4),
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  alertButtonContainer: {
    position: 'absolute',
    left: spacing[4],
    zIndex: 7,
  },
  recenterContainer: {
    position: 'absolute',
    left: spacing[4],
    zIndex: 7,
  },
});
