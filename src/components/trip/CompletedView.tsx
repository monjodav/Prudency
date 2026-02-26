import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { scaledIcon } from '@/src/utils/scaling';

type CompletedViewProps = {
  onGoHome: () => void;
};

export function CompletedView({ onGoHome }: CompletedViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.completedContent}>
        <View style={styles.completedIconContainer}>
          <Ionicons name="checkmark-circle" size={scaledIcon(80)} color={colors.success[400]} />
        </View>

        <Text style={styles.completedTitle}>Trajet terminé</Text>
        <Text style={styles.completedSubtitle}>
          Trajet fini avec succès. Tes contacts ont été prévenus de ton arrivée.
        </Text>

        <Button
          title="Retour a l'accueil"
          onPress={onGoHome}
          fullWidth
          size="lg"
          icon={<Ionicons name="home-outline" size={scaledIcon(20)} color={colors.white} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  completedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  completedIconContainer: {
    marginBottom: spacing[6],
  },
  completedTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  completedSubtitle: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing[8],
  },
});
