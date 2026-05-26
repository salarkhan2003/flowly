import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
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
      Platform.OS === 'android'
        ? Spacing.xl +
          insets.bottom +
          footerClearance +
          (keyboardHeight > 0 ? keyboardExtraPad + 24 : keyboardExtraPad)
        : keyboardHeight > 0
          ? keyboardHeight + 24 + keyboardExtraPad + footerClearance
          : Spacing.xxl + insets.bottom + footerClearance;

    const scroll = (
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
    );

    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={90}
        >
          {scroll}
        </KeyboardAvoidingView>
      );
    }

    return <View style={styles.flex}>{scroll}</View>;
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
