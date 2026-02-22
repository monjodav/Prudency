import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary[950],
        },
        headerTintColor: colors.white,
        headerShadowVisible: false,
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
          title: 'Mon abonnement',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'A propos',
        }}
      />
      <Stack.Screen
        name="add-contact"
        options={{
          title: 'Ajouter un contact',
        }}
      />
    </Stack>
  );
}
