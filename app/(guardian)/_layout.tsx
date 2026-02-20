import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function GuardianLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.gray[900],
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="track"
        options={{
          title: 'Suivi en direct',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="alert-received"
        options={{
          title: 'Alerte recue',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
