import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function TripLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: 'Nouveau trajet',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="active"
        options={{
          title: 'Trajet en cours',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="notes"
        options={{
          title: 'Notes',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="complete"
        options={{
          title: 'Trajet terminé',
          presentation: 'modal',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
