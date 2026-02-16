import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors } from '@/src/theme/colors';
import { scaledIcon, scaledSpacing, scaledFontSize, ms } from '@/src/utils/scaling';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color }: { name: IoniconsName; color: string }) {
  return <Ionicons size={scaledIcon(24)} style={{ marginBottom: scaledSpacing(-3) }} name={name} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[300],
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.primary[950],
          borderTopColor: colors.primary[900],
          borderTopWidth: 1,
          height: ms(88, 0.5),
          paddingBottom: scaledSpacing(28),
          paddingTop: scaledSpacing(8),
        },
        tabBarLabelStyle: {
          fontSize: scaledFontSize(11),
          fontFamily: 'Inter_500Medium',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: 'Lieux',
          tabBarIcon: ({ color }) => <TabBarIcon name="location" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => <TabBarIcon name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="guardian"
        options={{
          title: 'Proteges',
          tabBarIcon: ({ color }) => <TabBarIcon name="shield-checkmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
