import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants/theme';
import { useKeyboard } from '../../hooks/useKeyboard';

type FormScrollLayoutProps = {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  /** Extra bottom space when a fixed bar sits below this scroll (e.g. tab bar). */
  footerClearance?: number;
};

export function FormScrollLayout({
  children,
  contentContainerStyle,
  footerClearance = 0,
}: FormScrollLayoutProps) {
  const insets = useSafeAreaInsets();
  const { keyboardHeight } = useKeyboard();

  const bottomPad =
    Spacing.xxl +
    insets.bottom +
    footerClearance +
    (keyboardHeight > 0 ? keyboardHeight - insets.bottom : 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }, contentContainerStyle]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
