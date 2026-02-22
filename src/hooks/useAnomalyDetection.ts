import { useState, useRef, useCallback, useEffect } from 'react';
import type { AnomalyReason } from '@/src/components/trip/AnomalyDialog';
import { useTripStore } from '@/src/stores/tripStore';

const NO_RESPONSE_DELAY_MS = 10 * 60 * 1000;

interface AnomalyDetectionState {
  showAnomalyDialog: boolean;
  showNoResponseDialog: boolean;
  currentAnomaly: AnomalyReason | null;
  anomalyShownForTrip: boolean;
  noResponseShownForAnomaly: boolean;
}

export function useAnomalyDetection() {
  const activeTripId = useTripStore((s) => s.activeTripId);

  const [state, setState] = useState<AnomalyDetectionState>({
    showAnomalyDialog: false,
    showNoResponseDialog: false,
    currentAnomaly: null,
    anomalyShownForTrip: false,
    noResponseShownForAnomaly: false,
  });

  const noResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNoResponseTimer = useCallback(() => {
    if (noResponseTimerRef.current) {
      clearTimeout(noResponseTimerRef.current);
      noResponseTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearNoResponseTimer;
  }, [clearNoResponseTimer]);

  useEffect(() => {
    if (!activeTripId) {
      clearNoResponseTimer();
      setState({
        showAnomalyDialog: false,
        showNoResponseDialog: false,
        currentAnomaly: null,
        anomalyShownForTrip: false,
        noResponseShownForAnomaly: false,
      });
    }
  }, [activeTripId, clearNoResponseTimer]);

  const presentAnomalyDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showAnomalyDialog: true,
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
    setState((prev) => ({
      ...prev,
      showNoResponseDialog: false,
      currentAnomaly: null,
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
    setState((prev) => ({
      ...prev,
      currentAnomaly: null,
      noResponseShownForAnomaly: false,
    }));
  }, [clearNoResponseTimer]);

  return {
    showAnomalyDialog: state.showAnomalyDialog,
    showNoResponseDialog: state.showNoResponseDialog,
    currentAnomaly: state.currentAnomaly,
    presentAnomalyDialog,
    dismissAnomalyDialog,
    handleAnomalySelect,
    handleAllGood,
    handleTriggerAlert,
    handleAutoAlert,
    resetAnomaly,
  };
}
