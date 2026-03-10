import { Linking, Platform } from 'react-native';

export function openSettings(): void {
  if (Platform.OS === 'ios') {
    void Linking.openURL('app-settings:');
  } else {
    void Linking.openSettings();
  }
}
