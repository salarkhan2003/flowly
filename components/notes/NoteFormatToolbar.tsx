import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { FormatAction } from '../../lib/noteContent';

const TOOLS: { action: FormatAction; label: string }[] = [
  { action: 'bold', label: 'B' },
  { action: 'italic', label: 'I' },
  { action: 'h1', label: 'H1' },
  { action: 'h2', label: 'H2' },
  { action: 'bullet', label: '•' },
  { action: 'number', label: '1.' },
  { action: 'quote', label: '❝' },
  { action: 'checkbox', label: '☐' },
  { action: 'code', label: '</>' },
  { action: 'link', label: '🔗' },
  { action: 'divider', label: '—' },
];

export function NoteFormatToolbar({ onFormat }: { onFormat: (action: FormatAction) => void }) {
  const { C } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
      <Text style={[styles.label, { color: C.textMuted }]}>Format · select text, then tap</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TOOLS.map((t) => (
          <TouchableOpacity
            key={t.action}
            style={[styles.btn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              onFormat(t.action);
            }}
          >
            <Text style={[styles.btnTxt, { color: C.textPrimary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 8,
    gap: 6,
    marginBottom: 8,
  },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 6, paddingRight: 8 },
  btn: {
    minWidth: 36,
    height: 34,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  btnTxt: { fontSize: 13, fontWeight: '800' },
});
