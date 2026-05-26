import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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

export type FormScrollLayoutRef = {
  scrollToEnd: (animated?: boolean) => void;
  scrollTo: (y: number, animated?: boolean) => void;
};

type FormScrollLayoutProps = {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  footerClearance?: number;
  keyboardExtraPad?: number;
};

export const FormScrollLayout = forwardRef<FormScrollLayoutRef, FormScrollLayoutProps>(
  function FormScrollLayout(
    { children, contentContainerStyle, footerClearance = 0, keyboardExtraPad = 0 },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { keyboardHeight } = useKeyboard();
    const scrollRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      scrollToEnd: (animated = true) => {
        scrollRef.current?.scrollToEnd({ animated });
      },
      scrollTo: (y, animated = true) => {
        scrollRef.current?.scrollTo({ y, animated });
      },
    }));

    const bottomPad =
      keyboardHeight > 0
        ? keyboardHeight + 20 + keyboardExtraPad + footerClearance
        : Spacing.xxl + insets.bottom + footerClearance;

    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
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
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
