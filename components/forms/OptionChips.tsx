import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
  optional,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | '';
  onChange: (v: T | '') => void;
  optional?: boolean;
}) {
  const { C } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: C.textSecondary }]}>
        {label}
        {optional ? <Text style={{ color: C.textMuted }}> (optional)</Text> : null}
      </Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? C.accentDim : C.bgCard,
                  borderColor: selected ? C.accent : C.border,
                },
              ]}
              onPress={() => {
                Keyboard.dismiss();
                onChange(selected ? '' : opt.value);
              }}
            >
              <Text style={[styles.chipTxt, { color: selected ? C.accent : C.textSecondary }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  chipTxt: { fontSize: 13, fontWeight: '600' },
});
