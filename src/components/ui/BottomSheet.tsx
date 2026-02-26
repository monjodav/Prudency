import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing, borderRadius } from '@/src/theme/spacing';
import { ms, scaledRadius, scaledIcon } from '@/src/utils/scaling';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  dark?: boolean;
  overlayOpacity?: number;
  onBack?: () => void;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  snapPoints = [0.5],
  initialSnap = 0,
  dark = false,
  overlayOpacity = 0.5,
  onBack,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const currentHeight = SCREEN_HEIGHT * (snapPoints[initialSnap] ?? 0.5);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - currentHeight,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(backdropOpacity, {
          toValue: overlayOpacity,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = SCREEN_HEIGHT - currentHeight + gestureState.dy;
        if (newY >= SCREEN_HEIGHT - currentHeight) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - currentHeight,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.flex} onPress={onClose} />
          <Animated.View
            style={[
              styles.sheet,
              dark && styles.sheetDark,
              {
                height: currentHeight,
                transform: [{ translateY }],
              },
            ]}
          >
            {dark && (
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            )}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={[styles.handle, dark && styles.handleDark]} />
            </View>

            {title && (
              <View style={[styles.header, dark && styles.headerDark]}>
                {onBack ? (
                  <Pressable style={styles.closeButton} onPress={onBack}>
                    <FontAwesome name="chevron-left" size={scaledIcon(18)} color={dark ? colors.gray[400] : colors.gray[500]} />
                  </Pressable>
                ) : (
                  <View style={styles.closeButton} />
                )}
                <Text style={[styles.title, dark && styles.titleDark, styles.titleCenter]}>{title}</Text>
                {!onBack ? (
                  <Pressable style={styles.closeButton} onPress={onClose}>
                    <FontAwesome name="times" size={scaledIcon(20)} color={dark ? colors.gray[400] : colors.gray[500]} />
                  </Pressable>
                ) : (
                  <View style={styles.closeButton} />
                )}
              </View>
            )}

            <View style={styles.content}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black,
  },
  keyboardView: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  handle: {
    width: ms(40, 0.5),
    height: ms(4, 0.5),
    backgroundColor: colors.gray[300],
    borderRadius: scaledRadius(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    ...typography.h3,
    color: colors.gray[900],
    flex: 1,
  },
  titleCenter: {
    textAlign: 'center',
  },
  closeButton: {
    padding: spacing[2],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  sheetDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  handleDark: {
    backgroundColor: colors.gray[600],
  },
  headerDark: {
    borderBottomColor: colors.gray[800],
  },
  titleDark: {
    color: colors.white,
  },
});
