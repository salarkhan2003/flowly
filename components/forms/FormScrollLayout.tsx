import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants/theme';

/** Static scroll only — no keyboard listeners (they caused layout thrash & tab flicker). */
export function FormScrollLayout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Spacing.xxl + insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
});
