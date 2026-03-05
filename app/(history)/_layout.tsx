import { Stack } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary[950],
        },
        headerTintColor: colors.white,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.primary[950],
        },
      }}
    >
      <Stack.Screen
        name="list"
        options={{
          title: 'Historique',
        }}
      />
      <Stack.Screen
        name="trip/[id]"
        options={{
          title: 'Détail du trajet',
        }}
      />
      <Stack.Screen
        name="alert/[id]"
        options={{
          title: "Détail de l'alerte",
        }}
      />
    </Stack>
  );
}
