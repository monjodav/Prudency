import * as Battery from 'expo-battery';
import { APP_CONFIG } from './constants';

export interface BatteryState {
  level: number;
  isCharging: boolean;
  isLow: boolean;
}

export async function getBatteryState(): Promise<BatteryState> {
  const [level, batteryState] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
  ]);

  const levelPercent = Math.round(level * 100);
  const isCharging =
    batteryState === Battery.BatteryState.CHARGING ||
    batteryState === Battery.BatteryState.FULL;

  return {
    level: levelPercent,
    isCharging,
    isLow: levelPercent <= APP_CONFIG.BATTERY_LOW_THRESHOLD && !isCharging,
  };
}

export async function getBatteryLevel(): Promise<number> {
  const level = await Battery.getBatteryLevelAsync();
  return Math.round(level * 100);
}

export function subscribeToBatteryLevel(
  callback: (state: BatteryState) => void
): () => void {
  const subscription = Battery.addBatteryLevelListener(async ({ batteryLevel }) => {
    const batteryState = await Battery.getBatteryStateAsync();
    const levelPercent = Math.round(batteryLevel * 100);
    const isCharging =
      batteryState === Battery.BatteryState.CHARGING ||
      batteryState === Battery.BatteryState.FULL;

    callback({
      level: levelPercent,
      isCharging,
      isLow: levelPercent <= APP_CONFIG.BATTERY_LOW_THRESHOLD && !isCharging,
    });
  });

  return () => subscription.remove();
}

export function getBatteryWarningMessage(level: number): string | null {
  if (level <= 5) {
    return 'Batterie critique ! Rechargez votre téléphone immédiatement.';
  }
  if (level <= 10) {
    return 'Batterie très faible. Pensez à recharger.';
  }
  if (level <= APP_CONFIG.BATTERY_LOW_THRESHOLD) {
    return 'Batterie faible. Vos contacts seront prévenus si votre batterie s\'épuise.';
  }
  return null;
}
