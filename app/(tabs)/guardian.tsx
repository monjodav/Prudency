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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { Badge } from '@/src/components/ui/Badge';

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

export default function GuardianScreen() {
  const router = useRouter();
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

  const getStatusIcon = (status: ProtectedPerson['status']) => {
    switch (status) {
      case 'safe':
        return { name: 'check-circle' as const, color: colors.success[500] };
      case 'trip_active':
        return { name: 'road' as const, color: colors.info[500] };
      case 'alert':
        return { name: 'exclamation-circle' as const, color: colors.error[500] };
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
            <FontAwesome
              name="chevron-right"
              size={12}
              color={colors.gray[400]}
              style={styles.chevron}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes proteges</Text>
        <Text style={styles.subtitle}>
          {protectedPeople.length} personne{protectedPeople.length !== 1 ? 's' : ''} sous votre protection
        </Text>
      </View>

      {protectedPeople.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome name="shield" size={48} color={colors.gray[300]} />
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
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.h3,
    color: colors.gray[900],
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.gray[500],
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
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
  },
  personCardPressed: {
    backgroundColor: colors.gray[100],
  },
  personCardAlert: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary[600],
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[900],
  },
  tripInfo: {
    ...typography.bodySmall,
    color: colors.info[600],
    marginTop: spacing[1],
  },
  lastSeen: {
    ...typography.bodySmall,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  alertText: {
    ...typography.bodySmall,
    color: colors.error[600],
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
  emptyTitle: {
    ...typography.h3,
    color: colors.gray[700],
    marginTop: spacing[4],
  },
  emptyDescription: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
