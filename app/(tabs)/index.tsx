import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { useTripStore } from '@/src/stores/tripStore';

export default function HomeScreen() {
  const router = useRouter();
  const { activeTripId } = useTripStore();

  const handleStartTrip = () => {
    if (activeTripId) {
      router.push('/(trip)/active');
    } else {
      router.push('/(trip)/create');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour</Text>
        <Text style={styles.subtitle}>Où allez-vous aujourd'hui ?</Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
            activeTripId && styles.activeButton,
          ]}
          onPress={handleStartTrip}
        >
          <Text style={styles.startButtonText}>
            {activeTripId ? 'Voir mon trajet' : 'Démarrer un trajet'}
          </Text>
        </Pressable>

        {activeTripId && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Trajet en cours</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Vos contacts de confiance seront prévenus en cas de problème
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
  },
  greeting: {
    ...typography.h1,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing[2],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  startButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
  },
  activeButton: {
    backgroundColor: colors.success[500],
    shadowColor: colors.success[500],
  },
  startButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success[500],
    marginRight: spacing[2],
  },
  activeText: {
    ...typography.caption,
    color: colors.success[600],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
