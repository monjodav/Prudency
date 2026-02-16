export const APP_CONFIG = {
  MAX_TRIP_DURATION_MINUTES: 480, // 8 heures max
  MIN_TRIP_DURATION_MINUTES: 5,
  DEFAULT_TRIP_DURATION_MINUTES: 30,
  GPS_UPDATE_INTERVAL_MS: 30_000, // 30 secondes en mode actif
  GPS_ARRIVAL_CHECK_INTERVAL_MS: 10_000, // 10 secondes à l'approche
  ALERT_TIMEOUT_BUFFER_MINUTES: 5, // Délai supplémentaire avant alerte auto
  MAX_TRUSTED_CONTACTS: 5,
  MAX_TRIP_NOTES: 20,
  BATTERY_LOW_THRESHOLD: 15,
} as const;

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
} as const;

export const TRIP_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  ALERTED: 'alerted',
} as const;

export const ALERT_TYPE = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  TIMEOUT: 'timeout',
} as const;

export const ALERT_STATUS = {
  TRIGGERED: 'triggered',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  FALSE_ALARM: 'false_alarm',
} as const;
