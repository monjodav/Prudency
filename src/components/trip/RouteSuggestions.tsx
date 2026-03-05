import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { RouteCard } from '@/src/components/trip/RouteCard';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import type { DecodedRoute } from '@/src/services/directionsService';

interface RouteSuggestionsProps {
  routes: DecodedRoute[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
  isLoading: boolean;
  transportMode: 'walk' | 'car' | 'transit' | 'bike';
  departureTime: Date;
}

export function RouteSuggestions({
  routes,
  selectedIndex,
  onSelectRoute,
  isLoading,
  transportMode,
  departureTime,
}: RouteSuggestionsProps) {

  if (!isLoading && routes.length === 0) return null;

  return (
    <View style={styles.section}>
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary[400]} />
          <Text style={styles.loadingText}>Recherche d'itinéraires...</Text>
        </View>
      ) : (
        <View style={styles.routesList}>
          {routes.map((route) => (
            <RouteCard
              key={route.index}
              route={route}
              isSelected={route.index === selectedIndex}
              onSelect={() => onSelectRoute(route.index)}
              transportMode={transportMode}
              departureTime={departureTime}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.gray[400],
  },
  routesList: {
    gap: spacing[3],
  },
});
