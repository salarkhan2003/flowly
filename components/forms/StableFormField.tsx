import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

/** Plain field — no focus animations (prevents keyboard/layout glitches on Android). */
export function StableFormField({
  label,
  value,
  onChangeText,
  ...props
}: TextInputProps & { label: string; value: string; onChangeText: (t: string) => void }) {
  const { C } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: C.textPrimary,
            backgroundColor: C.bgCard,
            borderColor: C.border,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={C.textMuted}
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        textContentType="none"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  input: {
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
});
