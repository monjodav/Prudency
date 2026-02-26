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
          title: 'Préférences',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: 'Sécurité et confidentialité',
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
          title: 'À propos',
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
