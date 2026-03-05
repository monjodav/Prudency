import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="security" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="about" />
      <Stack.Screen name="add-contact" />
      <Stack.Screen name="edit-name" />
      <Stack.Screen name="edit-phone" />
      <Stack.Screen name="verify-phone-change" />
      <Stack.Screen name="legal-notices" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="sales-terms" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
