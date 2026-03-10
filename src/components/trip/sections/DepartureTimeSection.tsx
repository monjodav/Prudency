import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledIcon } from '@/src/utils/scaling';
import { ListItem } from '@/src/components/ui/ListItem';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = ms(44, 0.4);
const VISIBLE_ITEMS = 5;

function ScrollColumn({ data, selected, onSelect }: {
  data: number[];
  selected: number;
  onSelect: (val: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const initialIndex = data.indexOf(selected);
  const padding = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

  const handleScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    const value = data[clamped];
    if (value !== undefined && value !== selected) {
      onSelect(value);
    }
  }, [data, selected, onSelect]);

  return (
    <View style={styles.scrollColumnWrapper}>
      <View style={styles.scrollHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentOffset={{ x: 0, y: (initialIndex >= 0 ? initialIndex : 0) * ITEM_HEIGHT }}
        contentContainerStyle={{ paddingVertical: padding }}
        nestedScrollEnabled
      >
        {data.map((item) => {
          const isSelected = item === selected;
          return (
            <Pressable key={item} onPress={() => onSelect(item)} style={styles.scrollItem}>
              <Text style={[styles.scrollItemText, isSelected && styles.scrollItemTextSelected]}>
                {String(item).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface DepartureTimeSectionProps {
  departureTime: Date;
  onChangeTime: (date: Date) => void;
  onSetNow: () => void;
  onScrollTo?: () => void;
}

export function DepartureTimeSection({ departureTime, onChangeTime, onSetNow, onScrollTo }: DepartureTimeSectionProps) {
  const [showPicker, setShowPicker] = useState(false);
  const timeStr = departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleHourChange = useCallback((hour: number) => {
    const next = new Date(departureTime);
    next.setHours(hour);
    onChangeTime(next);
  }, [departureTime, onChangeTime]);

  const handleMinuteChange = useCallback((minute: number) => {
    const next = new Date(departureTime);
    next.setMinutes(minute);
    onChangeTime(next);
  }, [departureTime, onChangeTime]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Temps</Text>
      <Text style={styles.sectionHint}>Indique ton heure de départ</Text>
      <View style={styles.timeRow}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeLabel}>Départ</Text>
          <Pressable onPress={() => { setShowPicker(!showPicker); if (!showPicker) onScrollTo?.(); }} style={styles.timeValueBtn}>
            <Text style={styles.timeValue}>{timeStr}</Text>
          </Pressable>
        </View>
        {!showPicker && (
          <ListItem
            text="Partir maintenant"
            variant="outline"
            iconLeft={
              <Ionicons name="time" size={scaledIcon(20)} color={colors.primary[300]} />
            }
            onPress={onSetNow}
            style={styles.nowButton}
          />
        )}
      </View>
      {showPicker && (
        <View style={styles.pickerCard}>
          <View style={styles.pickerContainer}>
            <ScrollColumn data={HOURS} selected={departureTime.getHours()} onSelect={handleHourChange} />
            <Text style={styles.pickerSeparator}>:</Text>
            <ScrollColumn data={MINUTES} selected={departureTime.getMinutes()} onSelect={handleMinuteChange} />
          </View>
          <View style={styles.pickerActions}>
            <Pressable
              onPress={() => {
                onSetNow();
                setShowPicker(false);
              }}
              style={styles.pickerBtnSecondary}
            >
              <Text style={styles.pickerBtnSecondaryText}>Maintenant</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPicker(false)}
              style={styles.pickerBtnPrimary}
            >
              <Text style={styles.pickerBtnPrimaryText}>Confirmer</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    ...typography.label,
    color: colors.gray[300],
    marginBottom: spacing[1],
  },
  sectionHint: {
    ...typography.caption,
    color: colors.gray[400],
    marginBottom: spacing[3],
  },
  timeRow: {
    gap: spacing[3],
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  timeLabel: {
    ...typography.body,
    color: colors.gray[300],
  },
  timeValueBtn: {
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  timeValue: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '600',
  },
  pickerCard: {
    backgroundColor: colors.gray[950],
    borderRadius: borderRadius.lg,
    marginTop: spacing[3],
    overflow: 'hidden',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  pickerBtnSecondaryText: {
    ...typography.bodySmall,
    color: colors.gray[300],
    fontWeight: '500',
  },
  pickerBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  pickerBtnPrimaryText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  scrollColumnWrapper: {
    width: ms(72, 0.4),
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  scrollHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: spacing[1],
    right: spacing[1],
    height: ITEM_HEIGHT,
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.md,
    zIndex: -1,
  },
  scrollItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollItemText: {
    ...typography.body,
    color: colors.gray[600],
    fontSize: ms(18, 0.4),
  },
  scrollItemTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  pickerSeparator: {
    ...typography.h2,
    color: colors.white,
    marginHorizontal: spacing[1],
  },
  nowButton: {
    flex: 0,
  },
});
