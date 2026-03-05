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
    </Stack>
  );
}
