import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Badge } from '@/src/components/ui/Badge';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

interface ProtectedPerson {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: 'safe' | 'trip_active' | 'alert';
  lastSeen?: string;
  currentTrip?: {
    destination: string;
    estimatedArrival: string;
  };
}

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface StatusIconConfig {
  name: IoniconsName;
  color: string;
}

export default function GuardianScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [protectedPeople] = useState<ProtectedPerson[]>([
    {
      id: '1',
      name: 'Marie Dupont',
      phone: '+33 6 12 34 56 78',
      status: 'trip_active',
      currentTrip: {
        destination: 'Maison',
        estimatedArrival: '18:30',
      },
    },
    {
      id: '2',
      name: 'Sophie Martin',
      phone: '+33 6 98 76 54 32',
      status: 'safe',
      lastSeen: 'Il y a 2h',
    },
  ]);

  const getStatusBadge = (status: ProtectedPerson['status']) => {
    switch (status) {
      case 'safe':
        return <Badge label="En securite" variant="success" />;
      case 'trip_active':
        return <Badge label="Trajet en cours" variant="info" />;
      case 'alert':
        return <Badge label="Alerte" variant="error" />;
    }
  };

  const getStatusIcon = (status: ProtectedPerson['status']): StatusIconConfig => {
    switch (status) {
      case 'safe':
        return { name: 'checkmark-circle', color: colors.success[500] };
      case 'trip_active':
        return { name: 'navigate', color: colors.info[500] };
      case 'alert':
        return { name: 'alert-circle', color: colors.error[500] };
    }
  };

  const handlePersonPress = (person: ProtectedPerson) => {
    if (person.status === 'trip_active' || person.status === 'alert') {
      router.push({
        pathname: '/(guardian)/track',
        params: { personId: person.id },
      });
    }
  };

  const renderPerson = ({ item }: { item: ProtectedPerson }) => {
    const statusIcon = getStatusIcon(item.status);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.personCard,
          pressed && styles.personCardPressed,
          item.status === 'alert' && styles.personCardAlert,
        ]}
        onPress={() => handlePersonPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusIcon.color },
            ]}
          />
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.name}</Text>
          {item.status === 'trip_active' && item.currentTrip && (
            <Text style={styles.tripInfo}>
              Vers {item.currentTrip.destination} - Arrivee {item.currentTrip.estimatedArrival}
            </Text>
          )}
          {item.status === 'safe' && item.lastSeen && (
            <Text style={styles.lastSeen}>Derniere activite : {item.lastSeen}</Text>
          )}
          {item.status === 'alert' && (
            <Text style={styles.alertText}>Alerte declenchee !</Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {getStatusBadge(item.status)}
          {(item.status === 'trip_active' || item.status === 'alert') && (
            <Ionicons
              name="chevron-forward"
              size={scaledIcon(14)}
              color={colors.gray[500]}
              style={styles.chevron}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.title}>Mes proteges</Text>
        <Text style={styles.subtitle}>
          {protectedPeople.length} personne{protectedPeople.length !== 1 ? 's' : ''} sous votre protection
        </Text>
      </View>

      {protectedPeople.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="shield-outline" size={scaledIcon(48)} color={colors.primary[400]} />
          </View>
          <Text style={styles.emptyTitle}>Aucun protege</Text>
          <Text style={styles.emptyDescription}>
            Les personnes qui vous ajoutent comme contact de confiance apparaitront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={protectedPeople}
          keyExtractor={(item) => item.id}
          renderItem={renderPerson}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing[3],
  },
  personCardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  personCardAlert: {
    backgroundColor: 'rgba(202, 31, 31, 0.1)',
    borderColor: 'rgba(202, 31, 31, 0.25)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  avatar: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
  },
  avatarPlaceholder: {
    width: ms(48, 0.5),
    height: ms(48, 0.5),
    borderRadius: ms(48, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary[300],
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: ms(14, 0.5),
    height: ms(14, 0.5),
    borderRadius: ms(14, 0.5) / 2,
    borderWidth: 2,
    borderColor: colors.primary[950],
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  tripInfo: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  lastSeen: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  alertText: {
    ...typography.bodySmall,
    color: colors.error[400],
    fontWeight: '600',
    marginTop: spacing[1],
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  chevron: {
    marginTop: spacing[2],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[10],
  },
  emptyIconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: ms(80, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.white,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.primary[200],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
