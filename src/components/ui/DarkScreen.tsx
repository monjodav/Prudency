import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { scaledIcon } from '@/src/utils/scaling';

interface DarkScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  avoidKeyboard?: boolean;
  headerTitle?: string;
}

function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <View style={headerStyles.row}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={headerStyles.side}>
        <Ionicons name="chevron-back" size={scaledIcon(24)} color={colors.white} />
      </Pressable>
      <Text style={headerStyles.title} numberOfLines={1}>{title}</Text>
      <View style={headerStyles.side} />
    </View>
  );
}

export function DarkScreen({
  children,
  scrollable = false,
  padded = true,
  style,
  avoidKeyboard = false,
  headerTitle,
}: DarkScreenProps) {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        padded && styles.padded,
        { paddingBottom: insets.bottom + spacing[6] },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        { paddingBottom: insets.bottom + spacing[6] },
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      <StatusBar barStyle="light-content" />
      {headerTitle && <Header title={headerTitle} />}
      {wrappedContent}
    </View>
  );
}

const HEADER_HEIGHT = 44;

const headerStyles = StyleSheet.create({
  row: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  side: {
    width: scaledIcon(32),
    height: scaledIcon(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing[6],
  },
});
