import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { scaledSpacing, scaledIcon, ms } from '@/src/utils/scaling';
import { Button } from '@/src/components/ui/Button';
import { Timeline } from '@/src/components/trip/Timeline';
import { NoteSection } from '@/src/components/trip/NoteSection';

type CardTrajetVariant = 'active' | 'rendezvous' | 'scheduled' | 'finishing' | 'closed';

interface NoteItem {
  id: string;
  time: string;
  content?: string;
}

interface CardTrajetProps {
  variant: CardTrajetVariant;
  destination?: string;
  contactCount?: number;
  elapsedTime?: string;
  remainingTime?: string;
  safeZoneDistance?: string;
  notes?: NoteItem[];
  onEndTrip?: () => void;
  onExtendTrip?: () => void;
  onPauseTrip?: () => void;
  onCancelTrip?: () => void;
  onStartTrip?: () => void;
  onShowTrip?: () => void;
  onAddNote?: () => void;
  onEditNote?: (noteId: string) => void;
  style?: ViewStyle;
}

const VARIANT_CONFIG: Record<CardTrajetVariant, { icon: string; title: string; subtitle: string }> = {
  active: { icon: 'walk', title: 'Trajet en cours', subtitle: 'Ton trajet a démarré' },
  rendezvous: { icon: 'briefcase', title: 'Rendez-vous en cours', subtitle: 'Ton rendez-vous a débuté' },
  scheduled: { icon: 'walk', title: 'Recap', subtitle: 'Ton trajet a démarré' },
  finishing: { icon: 'walk', title: 'Trajet fini', subtitle: 'Ton trajet est terminé' },
  closed: { icon: 'walk', title: 'Trajet en cours', subtitle: 'Ton trajet a démarré' },
};

export function CardTrajet({
  variant,
  destination,
  contactCount,
  elapsedTime,
  remainingTime,
  safeZoneDistance,
  notes = [],
  onEndTrip,
  onExtendTrip,
  onPauseTrip,
  onCancelTrip,
  onStartTrip,
  onShowTrip,
  onAddNote,
  onEditNote,
  style,
}: CardTrajetProps) {
  const config = VARIANT_CONFIG[variant];
  const showTimeline = variant !== 'closed';
  const showNotes = variant === 'active';

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={scaledIcon(24)}
            color={colors.white}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{config.title}</Text>
            <Text style={styles.headerSubtitle}>{config.subtitle}</Text>
          </View>
        </View>
        <Ionicons
          name={variant === 'closed' ? 'eye-off' : 'eye'}
          size={scaledIcon(24)}
          color={colors.white}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Destination & Contact */}
        <View style={styles.infoRow}>
          {destination && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{destination}</Text>
            </View>
          )}
          {contactCount !== undefined && (
            <View style={styles.infoBlockRight}>
              <Text style={styles.infoLabel}>Contacts</Text>
              <Text style={styles.infoValue}>{contactCount}</Text>
            </View>
          )}
        </View>

        {/* Safe zone for rendezvous */}
        {variant === 'rendezvous' && safeZoneDistance && (
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Safe zone</Text>
              <Text style={styles.infoValue}>{safeZoneDistance}</Text>
            </View>
          </View>
        )}

        {/* Time info */}
        <View style={styles.infoRow}>
          {elapsedTime && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Temps écoulé</Text>
              <Text style={styles.infoValue}>{elapsedTime}</Text>
            </View>
          )}
          {remainingTime && (
            <View style={styles.infoBlockRight}>
              <Text style={styles.infoLabel}>Temps restant</Text>
              <Text style={styles.infoValue}>{remainingTime}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        {showTimeline && (
          <Timeline
            position={
              variant === 'scheduled'
                ? 'begin'
                : variant === 'finishing'
                  ? 'end'
                  : 'middle'
            }
          />
        )}

        {/* Notes */}
        {showNotes && onAddNote && (
          <NoteSection
            notes={notes}
            onAddNote={onAddNote}
            onEditNote={onEditNote}
          />
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {variant === 'active' && (
          <>
            {onEndTrip && (
              <Button title="Terminer le trajet" variant="primary" onPress={onEndTrip} disabled />
            )}
            {onPauseTrip && (
              <Button title="Mettre en pause le trajet" variant="outline" onPress={onPauseTrip} />
            )}
            {onExtendTrip && (
              <Button title="Prolonger le trajet" variant="outline" onPress={onExtendTrip} />
            )}
            {onCancelTrip && (
              <Button title="Annuler le trajet" variant="ghost" onPress={onCancelTrip} />
            )}
          </>
        )}
        {variant === 'finishing' && (
          <>
            {onEndTrip && (
              <Button title="Terminer le trajet" variant="primary" onPress={onEndTrip} />
            )}
            {onExtendTrip && (
              <Button title="Prolonger le trajet" variant="outline" onPress={onExtendTrip} />
            )}
          </>
        )}
        {variant === 'scheduled' && (
          <>
            {onStartTrip && (
              <Button title="Commencer le trajet" variant="primary" onPress={onStartTrip} />
            )}
            {onShowTrip && (
              <Button title="Afficher le trajet" variant="outline" onPress={onShowTrip} />
            )}
          </>
        )}
        {variant === 'rendezvous' && (
          <>
            {onEndTrip && (
              <Button title="Terminer le rendez-vous" variant="primary" onPress={onEndTrip} disabled />
            )}
            {onExtendTrip && (
              <Button title="Prolonger le rendez-vous" variant="outline" onPress={onExtendTrip} />
            )}
            {onCancelTrip && (
              <Button title="Annuler le rendez-vous" variant="ghost" onPress={onCancelTrip} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary[900],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[6],
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: scaledSpacing(4),
  },
  headerTitle: {
    ...typography.bodySmall,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.gray[50],
    lineHeight: ms(18, 0.4),
  },
  content: {
    width: '100%',
    gap: spacing[6],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoBlock: {
    gap: spacing[2],
  },
  infoBlockRight: {
    gap: spacing[2],
    alignItems: 'flex-end',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.button.disabledText,
    lineHeight: ms(18, 0.4),
  },
  infoValue: {
    ...typography.body,
    color: colors.white,
    lineHeight: ms(18, 0.4),
  },
  buttons: {
    gap: spacing[2],
    alignItems: 'center',
  },
});
