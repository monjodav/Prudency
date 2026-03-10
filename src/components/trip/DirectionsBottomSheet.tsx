import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledFontSize, scaledIcon, scaledRadius } from '@/src/utils/scaling';
import { DirectionStepRow } from './DirectionStepRow';
import { formatDistance } from './directionIcons';
import { StepIcon } from './StepIcon';
import type { RouteStep } from '@/src/services/directionsService';

interface DirectionsBottomSheetProps {
  steps: RouteStep[];
  currentStepIndex: number;
  bottomInset: number;
  destinationName?: string | null;
  onExpandChange?: (expanded: boolean) => void;
}

type ListItem =
  | { type: 'step'; step: RouteStep; index: number }
  | { type: 'destination' };

export function DirectionsBottomSheet({
  steps,
  currentStepIndex,
  bottomInset,
  destinationName,
  onExpandChange,
}: DirectionsBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const insets = useSafeAreaInsets();
  const [sheetIndex, setSheetIndex] = useState(0);

  const peekHeight = ms(80, 0.4) + insets.bottom;
  const snapPoints = useMemo(() => [peekHeight, '50%'], [peekHeight]);

  const currentStep = steps[currentStepIndex];
  const isExpanded = sheetIndex >= 1;

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = steps.map((step, index) => ({ type: 'step' as const, step, index }));
    items.push({ type: 'destination' as const });
    return items;
  }, [steps]);

  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
    onExpandChange?.(index >= 1);
    if (index >= 1 && currentStepIndex > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: currentStepIndex,
          animated: true,
          viewPosition: 0.3,
        });
      });
    }
  }, [onExpandChange, currentStepIndex]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        pressBehavior="collapse"
        opacity={0.4}
      />
    ),
    [],
  );

  const handleToggle = useCallback(() => {
    if (isExpanded) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.snapToIndex(1);
    }
  }, [isExpanded]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'destination') {
        return (
          <View style={styles.destinationRow}>
            <View style={styles.gutter}>
              <Ionicons name="location-sharp" size={scaledIcon(18)} color={colors.error[500]} />
            </View>
            <Text style={styles.destinationText} numberOfLines={2}>
              {destinationName ?? 'Destination'}
            </Text>
          </View>
        );
      }
      return (
        <DirectionStepRow
          step={item.step}
          isActive={item.index === currentStepIndex}
          isLast={false}
        />
      );
    },
    [currentStepIndex, destinationName],
  );

  const keyExtractor = useCallback(
    (item: ListItem, index: number) =>
      item.type === 'destination' ? 'destination' : `step-${index}`,
    [],
  );

  if (steps.length === 0) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundComponent={({ style }) => (
        <View style={[style, styles.background]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </View>
      )}
      handleComponent={() => (
        <Pressable onPress={handleToggle} style={styles.handleTap}>
          <View style={styles.handleIndicator} />
        </Pressable>
      )}
      backdropComponent={renderBackdrop}
      bottomInset={bottomInset}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      overDragResistanceFactor={10}
      onChange={handleSheetChange}
      animateOnMount={false}
      style={styles.sheet}
    >
      {/* Collapsed peek */}
      <View style={isExpanded ? styles.hidden : undefined}>
        {currentStep && (
          <Pressable style={styles.peekContainer} onPress={handleToggle}>
            <View style={styles.peekIcon}>
              <StepIcon step={currentStep} size={scaledIcon(20)} />
            </View>
            <View style={styles.peekText}>
              <Text style={styles.peekInstruction} numberOfLines={1}>
                {currentStep.travelMode === 'TRANSIT' && currentStep.transitDetails
                  ? `${currentStep.transitDetails.line.shortName || currentStep.transitDetails.line.name} → ${currentStep.transitDetails.arrivalStop.name}`
                  : currentStep.instruction}
              </Text>
              <Text style={styles.peekDistance}>
                {formatDistance(currentStep.distance.value)}
              </Text>
            </View>
            <View style={styles.peekChevron}>
              <Ionicons name="chevron-up" size={scaledIcon(18)} color={colors.gray[400]} />
              <Text style={styles.stepCounter}>
                {currentStepIndex + 1}/{steps.length}
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Expanded list */}
      <BottomSheetFlatList
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing[4] }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={steps.length + 1}
        style={isExpanded ? undefined : styles.hidden}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  hidden: {
    display: 'none',
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopLeftRadius: scaledRadius(20),
    borderTopRightRadius: scaledRadius(20),
    overflow: 'hidden',
    shadowColor: 'rgba(88, 88, 88, 0.25)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: ms(12, 0.4),
    elevation: 8,
  },
  handleTap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(10, 0.4),
  },
  handleIndicator: {
    backgroundColor: '#6d6d6d',
    width: ms(40, 0.4),
    height: ms(3, 0.3),
    borderRadius: ms(99, 0.4),
  },
  peekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  peekIcon: {
    width: ms(36, 0.4),
    height: ms(36, 0.4),
    borderRadius: ms(18, 0.4),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  peekText: {
    flex: 1,
    gap: 2,
  },
  peekInstruction: {
    fontSize: scaledFontSize(14),
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
  peekDistance: {
    fontSize: scaledFontSize(11),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[400],
  },
  peekChevron: {
    alignItems: 'center',
    gap: 2,
  },
  stepCounter: {
    fontSize: scaledFontSize(10),
    fontFamily: 'Inter_400Regular',
    color: colors.gray[500],
  },
  listContent: {
    paddingHorizontal: spacing[2],
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  gutter: {
    width: ms(20, 0.4),
    alignItems: 'center',
    marginRight: spacing[2],
  },
  destinationText: {
    flex: 1,
    fontSize: scaledFontSize(13),
    fontFamily: 'Inter_600SemiBold',
    color: colors.white,
  },
});
