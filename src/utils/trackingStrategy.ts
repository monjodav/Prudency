import * as Location from 'expo-location';

export type TrackingMode = 'start' | 'cruise' | 'approaching' | 'alert' | 'idle';

interface TrackingConfig {
  timeInterval: number;
  distanceInterval: number;
  accuracy: Location.Accuracy;
}

const TRACKING_CONFIGS: Record<TrackingMode, TrackingConfig> = {
  start: {
    timeInterval: 10_000,
    distanceInterval: 20,
    accuracy: Location.Accuracy.High,
  },
  cruise: {
    timeInterval: 60_000,
    distanceInterval: 100,
    accuracy: Location.Accuracy.Balanced,
  },
  approaching: {
    timeInterval: 10_000,
    distanceInterval: 20,
    accuracy: Location.Accuracy.High,
  },
  alert: {
    timeInterval: 5_000,
    distanceInterval: 10,
    accuracy: Location.Accuracy.BestForNavigation,
  },
  idle: {
    timeInterval: 0,
    distanceInterval: 0,
    accuracy: Location.Accuracy.Lowest,
  },
};

const LOW_BATTERY_CONFIGS: Partial<Record<TrackingMode, TrackingConfig>> = {
  start: {
    timeInterval: 20_000,
    distanceInterval: 40,
    accuracy: Location.Accuracy.Balanced,
  },
  cruise: {
    timeInterval: 90_000,
    distanceInterval: 150,
    accuracy: Location.Accuracy.Low,
  },
  approaching: {
    timeInterval: 15_000,
    distanceInterval: 30,
    accuracy: Location.Accuracy.Balanced,
  },
  alert: {
    timeInterval: 5_000,
    distanceInterval: 10,
    accuracy: Location.Accuracy.High,
  },
};

const START_PHASE_MINUTES = 5;
const APPROACHING_PHASE_MINUTES = 15;
const LOW_BATTERY_THRESHOLD = 20;

export function resolveTrackingMode(
  tripStatus: string | null,
  isAlerted: boolean,
  remainingMinutes: number | null,
  tripStartedAt: string | null,
): TrackingMode {
  if (!tripStatus || tripStatus !== 'active') {
    return 'idle';
  }

  if (isAlerted) {
    return 'alert';
  }

  if (remainingMinutes !== null && remainingMinutes <= APPROACHING_PHASE_MINUTES) {
    return 'approaching';
  }

  if (tripStartedAt) {
    const elapsedMs = Date.now() - new Date(tripStartedAt).getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);
    if (elapsedMinutes <= START_PHASE_MINUTES) {
      return 'start';
    }
  }

  return 'cruise';
}

export function getTrackingConfig(
  mode: TrackingMode,
  batteryLevel: number | null,
): TrackingConfig {
  if (mode === 'idle') {
    return TRACKING_CONFIGS.idle;
  }

  const isLowBattery = batteryLevel !== null && batteryLevel <= LOW_BATTERY_THRESHOLD;

  if (isLowBattery && LOW_BATTERY_CONFIGS[mode]) {
    return LOW_BATTERY_CONFIGS[mode];
  }

  return TRACKING_CONFIGS[mode];
}

export function shouldUpdateTracking(
  currentMode: TrackingMode,
  newMode: TrackingMode,
): boolean {
  return currentMode !== newMode;
}
