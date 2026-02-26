import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primary[950] },
        animation: 'slide_from_right',
      }}
    >
      {/* Initial loading/splash screen */}
      <Stack.Screen name="loading" />

      {/* Login & Register */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />

      {/* Registration flow */}
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="verify-phone" />

      {/* Permissions */}
      <Stack.Screen name="permissions-location" />
      <Stack.Screen name="permissions-notifications" />

      {/* Onboarding */}
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="add-contact" />
      <Stack.Screen name="add-contact-form" />
    </Stack>
  );
}
