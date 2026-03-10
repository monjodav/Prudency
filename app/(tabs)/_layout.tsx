import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { DynamicIsland } from '@/src/components/ui/DynamicIsland';
import { ActiveTripIsland } from '@/src/components/trip/ActiveTripIsland';

function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={12}>
      <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <DynamicIsland.Provider
      config={{
        collapsedWidth: ms(220, 0.4),
        collapsedHeight: ms(36, 0.4),
        expandedWidth: ms(340, 0.4),
        expandedHeight: ms(180, 0.4),
        topOffset: insets.top + ms(12, 0.4),
      }}
      theme={{
        backgroundColor: 'rgba(10, 10, 20, 0.95)',
        borderRadius: 24,
      }}
    >
      <ActiveTripIsland />
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
            headerShown: false,
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
            headerShown: false,
          }}
        />
      </Tabs>
    </DynamicIsland.Provider>
  );
}
