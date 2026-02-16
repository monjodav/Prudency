import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.gray[900],
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="personal-info"
        options={{
          title: 'Infos personnelles',
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          title: 'Preferences',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: 'Securite et confidentialite',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Abonnement',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'A propos',
        }}
      />
    </Stack>
  );
}
