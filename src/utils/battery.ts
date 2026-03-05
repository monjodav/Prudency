import * as Battery from 'expo-battery';

export async function getBatteryLevel(): Promise<number> {
  const level = await Battery.getBatteryLevelAsync();
  return Math.round(level * 100);
}
