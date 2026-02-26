import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { ms, scaledIcon, scaledFontSize } from '@/src/utils/scaling';
import { Radio } from '@/src/components/ui/Radio';

type CommentaireVariant = 'default' | 'note';

interface CommentaireProps {
  author: string;
  timeAgo: string;
  content?: string;
  emoji?: string;
  variant?: CommentaireVariant;
  selected?: boolean;
  onSelect?: () => void;
  onMenuPress?: () => void;
  style?: ViewStyle;
}

export function Commentaire({
  author,
  timeAgo,
  content,
  emoji = '👨',
  variant = 'default',
  selected = false,
  onSelect,
  onMenuPress,
  style,
}: CommentaireProps) {
  const isNote = variant === 'note';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          {isNote ? (
            <Ionicons
              name="pencil"
              size={scaledIcon(16)}
              color={colors.gray[50]}
            />
          ) : (
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          )}
        </View>

        <View style={styles.textContent}>
          <View style={styles.headerRow}>
            <Text style={styles.author}>{author}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          {content && (
            <Text style={styles.body}>{content}</Text>
          )}
        </View>
      </View>

      {!isNote && onSelect && (
        <Radio selected={selected} onSelect={onSelect} />
      )}
      {isNote && onMenuPress && (
        <Pressable onPress={onMenuPress} hitSlop={8}>
          <Ionicons
            name="ellipsis-vertical"
            size={scaledIcon(24)}
            color={colors.white}
          />
        </Pressable>
      )}
    </View>
  );
}

const AVATAR_SIZE = ms(32, 0.4);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.button.disabledText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: scaledFontSize(16),
    lineHeight: ms(24, 0.4),
  },
  textContent: {
    flex: 1,
    gap: ms(4, 0.4),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  author: {
    fontFamily: 'Inter_400Regular',
    fontSize: scaledFontSize(13),
    lineHeight: ms(19.5, 0.4),
    color: colors.gray[50],
  },
  timeAgo: {
    fontFamily: 'Inter_400Regular',
    fontSize: scaledFontSize(11),
    lineHeight: ms(16.5, 0.4),
    color: 'rgba(246, 246, 246, 0.5)',
    letterSpacing: ms(0.06, 0.4),
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: scaledFontSize(14),
    lineHeight: ms(21, 0.4),
    color: 'rgba(246, 246, 246, 0.9)',
  },
});
