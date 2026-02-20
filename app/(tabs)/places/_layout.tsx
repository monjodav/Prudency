import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function PlacesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary[950] },
        animation: 'slide_from_right',
      }}
    />
  );
}
