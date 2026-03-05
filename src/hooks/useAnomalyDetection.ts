import { useState, useRef, useCallback, useEffect } from 'react';
import type { AnomalyReason, AnomalyType } from '@/src/components/trip/AnomalyDialog';
import { useTripStore } from '@/src/stores/tripStore';
import {
  DEFAULT_THRESHOLDS,
  checkRouteDeviation,
  checkOvertime,
  checkProlongedStop,
  isStationary,
  resolveAnomalyType,
} from '@/src/utils/anomalyDetection';
import type { AnomalyThresholds } from '@/src/utils/anomalyDetection';

const NO_RESPONSE_DELAY_MS = 10 * 60 * 1000;
const DETECTION_INTERVAL_MS = 15_000;

interface AnomalyDetectionState {
  showAnomalyDialog: boolean;
  showNoResponseDialog: boolean;
  currentAnomaly: AnomalyReason | null;
  detectedAnomalyType: AnomalyType | null;
  anomalyShownForTrip: boolean;
  noResponseShownForAnomaly: boolean;
}

interface RoutePolyline {
  latitude: number;
  longitude: number;
}

interface UseAnomalyDetectionOptions {
  routePolyline?: RoutePolyline[];
  estimatedArrivalAt?: string | null;
  tripStatus?: string | null;
  thresholds?: Partial<AnomalyThresholds>;
}

export function useAnomalyDetection(options?: UseAnomalyDetectionOptions) {
  const activeTripId = useTripStore((s) => s.activeTripId);
  const lastKnownLat = useTripStore((s) => s.lastKnownLat);
  const lastKnownLng = useTripStore((s) => s.lastKnownLng);

  const thresholds = { ...DEFAULT_THRESHOLDS, ...options?.thresholds };

  const [state, setState] = useState<AnomalyDetectionState>({
    showAnomalyDialog: false,
    showNoResponseDialog: false,
    currentAnomaly: null,
    detectedAnomalyType: null,
    anomalyShownForTrip: false,
    noResponseShownForAnomaly: false,
  });

  const noResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stationarySinceRef = useRef<number | null>(null);
  const lastStationaryPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const clearNoResponseTimer = useCallback(() => {
    if (noResponseTimerRef.current) {
      clearTimeout(noResponseTimerRef.current);
      noResponseTimerRef.current = null;
    }
  }, []);

  const clearDetectionInterval = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearNoResponseTimer();
      clearDetectionInterval();
    };
  }, [clearNoResponseTimer, clearDetectionInterval]);

  useEffect(() => {
    if (!activeTripId) {
      clearNoResponseTimer();
      clearDetectionInterval();
      stationarySinceRef.current = null;
      lastStationaryPosRef.current = null;
      setState({
        showAnomalyDialog: false,
        showNoResponseDialog: false,
        currentAnomaly: null,
        detectedAnomalyType: null,
        anomalyShownForTrip: false,
        noResponseShownForAnomaly: false,
      });
    }
  }, [activeTripId, clearNoResponseTimer, clearDetectionInterval]);

  const triggerAnomalyDialog = useCallback((anomalyType: AnomalyType) => {
    setState((prev) => {
      if (prev.anomalyShownForTrip || prev.showAnomalyDialog || prev.currentAnomaly) {
        return prev;
      }
      return {
        ...prev,
        showAnomalyDialog: true,
        detectedAnomalyType: anomalyType,
        anomalyShownForTrip: true,
      };
    });
  }, []);

  const runDetection = useCallback(() => {
    if (!activeTripId || options?.tripStatus !== 'active') return;
    if (lastKnownLat === null || lastKnownLng === null) return;

    const position = { lat: lastKnownLat, lng: lastKnownLng };

    const stationary = isStationary(
      position,
      lastStationaryPosRef.current,
      null,
      thresholds.stationarySpeedThreshold,
    );

    if (stationary) {
      if (stationarySinceRef.current === null) {
        stationarySinceRef.current = Date.now();
        lastStationaryPosRef.current = position;
      }
    } else {
      stationarySinceRef.current = null;
      lastStationaryPosRef.current = position;
    }

    const isDeviation =
      options?.routePolyline && options.routePolyline.length > 0
        ? checkRouteDeviation(position, options.routePolyline, thresholds.routeDeviationMeters)
        : false;

    const isOvertime = checkOvertime(
      options?.estimatedArrivalAt ?? null,
      thresholds.overtimeMinutes,
    );

    const isProlongedStop = checkProlongedStop(
      stationarySinceRef.current,
      thresholds.prolongedStopMinutes,
    );

    const anomalyType = resolveAnomalyType({ isDeviation, isOvertime, isProlongedStop });

    if (anomalyType) {
      triggerAnomalyDialog(anomalyType);
    }
  }, [
    activeTripId,
    lastKnownLat,
    lastKnownLng,
    options?.routePolyline,
    options?.estimatedArrivalAt,
    options?.tripStatus,
    thresholds.routeDeviationMeters,
    thresholds.overtimeMinutes,
    thresholds.prolongedStopMinutes,
    thresholds.stationarySpeedThreshold,
    triggerAnomalyDialog,
  ]);

  useEffect(() => {
    if (!activeTripId || options?.tripStatus !== 'active') {
      clearDetectionInterval();
      return;
    }

    runDetection();

    detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);

    return clearDetectionInterval;
  }, [activeTripId, options?.tripStatus, runDetection, clearDetectionInterval]);

  const presentAnomalyDialog = useCallback((anomalyType?: AnomalyType) => {
    setState((prev) => ({
      ...prev,
      showAnomalyDialog: true,
      detectedAnomalyType: anomalyType ?? prev.detectedAnomalyType ?? 'generic',
      anomalyShownForTrip: true,
    }));
  }, []);

  const dismissAnomalyDialog = useCallback(() => {
    setState((prev) => ({ ...prev, showAnomalyDialog: false }));

    clearNoResponseTimer();
    noResponseTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (prev.noResponseShownForAnomaly || prev.currentAnomaly) {
          return prev;
        }
        return {
          ...prev,
          showNoResponseDialog: true,
          noResponseShownForAnomaly: true,
        };
      });
    }, NO_RESPONSE_DELAY_MS);
  }, [clearNoResponseTimer]);

  const handleAnomalySelect = useCallback(
    (reason: AnomalyReason) => {
      clearNoResponseTimer();
      setState((prev) => ({
        ...prev,
        showAnomalyDialog: false,
        currentAnomaly: reason,
        noResponseShownForAnomaly: false,
      }));
    },
    [clearNoResponseTimer],
  );

  const handleAllGood = useCallback(() => {
    clearNoResponseTimer();
    stationarySinceRef.current = null;
    setState((prev) => ({
      ...prev,
      showNoResponseDialog: false,
      currentAnomaly: null,
      anomalyShownForTrip: false,
      noResponseShownForAnomaly: true,
    }));
  }, [clearNoResponseTimer]);

  const handleTriggerAlert = useCallback(() => {
    clearNoResponseTimer();
    setState((prev) => ({
      ...prev,
      showNoResponseDialog: false,
      currentAnomaly: null,
    }));
  }, [clearNoResponseTimer]);

  const handleAutoAlert = useCallback(() => {
    clearNoResponseTimer();
    setState((prev) => ({
      ...prev,
      showNoResponseDialog: false,
      currentAnomaly: null,
    }));
  }, [clearNoResponseTimer]);

  const resetAnomaly = useCallback(() => {
    clearNoResponseTimer();
    stationarySinceRef.current = null;
    setState((prev) => ({
      ...prev,
      currentAnomaly: null,
      detectedAnomalyType: null,
      anomalyShownForTrip: false,
      noResponseShownForAnomaly: false,
    }));
  }, [clearNoResponseTimer]);

  return {
    showAnomalyDialog: state.showAnomalyDialog,
    showNoResponseDialog: state.showNoResponseDialog,
    currentAnomaly: state.currentAnomaly,
    detectedAnomalyType: state.detectedAnomalyType,
    presentAnomalyDialog,
    dismissAnomalyDialog,
    handleAnomalySelect,
    handleAllGood,
    handleTriggerAlert,
    handleAutoAlert,
    resetAnomaly,
  };
}
