import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { scaledIcon, ms, scaledShadow } from '@/src/utils/scaling';
import { FAB } from '@/src/components/ui/FAB';

type NavigationVariant = 'default' | 'tripActive' | 'tripAlert';

interface NavigationOverlayProps {
  variant?: NavigationVariant;
  hasNotification?: boolean;
  onPositionPress?: () => void;
  onNotificationPress?: () => void;
  onContactsPress?: () => void;
  onCreatePress?: () => void;
  onAlertPress?: () => void;
  onEditPress?: () => void;
  style?: ViewStyle;
}

export function NavigationOverlay({
  variant = 'default',
  hasNotification = false,
  onPositionPress,
  onNotificationPress,
  onContactsPress,
  onCreatePress,
  onAlertPress,
  onEditPress,
  style,
}: NavigationOverlayProps) {
  const isTripActive = variant === 'tripActive' || variant === 'tripAlert';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.leftColumn}>
          {isTripActive && onAlertPress && (
            <FAB
              icon={
                <Ionicons
                  name="shield"
                  size={scaledIcon(24)}
                  color={colors.white}
                />
              }
              variant="active"
              size="lg"
              onPress={onAlertPress}
            />
          )}
          <FAB
            icon={
              <Ionicons
                name="locate-outline"
                size={scaledIcon(24)}
                color={colors.white}
              />
            }
            variant="full"
            size="sm"
            onPress={onPositionPress}
          />
        </View>

        {/* Right side */}
        <View style={styles.rightColumn}>
          {isTripActive && onEditPress && (
            <FAB
              icon={
                <Ionicons
                  name="pencil"
                  size={scaledIcon(24)}
                  color={colors.white}
                />
              }
              variant="full"
              size="sm"
              onPress={onEditPress}
            />
          )}
          <View>
            <FAB
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={scaledIcon(24)}
                  color={colors.white}
                />
              }
              variant="full"
              size="sm"
              onPress={onNotificationPress}
            />
            {hasNotification && <View style={styles.notificationDot} />}
          </View>
          <FAB
            icon={
              <Ionicons
                name="people-outline"
                size={scaledIcon(24)}
                color={colors.white}
              />
            }
            variant="full"
            size="sm"
            onPress={onContactsPress}
          />
          {variant === 'default' && onCreatePress && (
            <FAB
              icon={
                <Ionicons
                  name="add"
                  size={scaledIcon(24)}
                  color={colors.white}
                />
              }
              variant="full"
              size="lg"
              onPress={onCreatePress}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
  },
  leftColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[4],
  },
  rightColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[4],
  },
  notificationDot: {
    position: 'absolute',
    top: ms(8, 0.4),
    right: ms(-1, 0.4),
    width: ms(9, 0.4),
    height: ms(9, 0.4),
    borderRadius: ms(12, 0.4),
    backgroundColor: colors.brandPosition[50],
  },
});
