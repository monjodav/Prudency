import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

import { colors } from '@/src/theme/colors';
import { scaledIcon } from '@/src/utils/scaling';

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={12}>
      <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: 'none' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen
        name="places"
        options={{
          title: 'Lieux',
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Tabs.Screen
        name="guardian"
        options={{
          title: 'Proteges',
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Tabs>
  );
}
