import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Tag } from '../ui/Tag';
import { Radius } from '../../constants/theme';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../hooks/useTheme';

export function TagsInput({
  tags,
  value,
  onChangeText,
  onAdd,
  onRemove,
}: {
  tags: string[];
  value: string;
  onChangeText: (t: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}) {
  const { C } = useTheme();
  const { keyboardHeight, keyboardVisible } = useKeyboard();
  const [focused, setFocused] = useState(false);

  const keyboardPad =
    focused && keyboardVisible && keyboardHeight > 0 ? keyboardHeight + 10 : 0;

  return (
    <View
      style={[
        styles.section,
        { borderTopColor: C.border, paddingBottom: keyboardPad },
      ]}
    >
      <Text style={[styles.label, { color: C.textMuted }]}>TAGS</Text>
      <View style={styles.list}>
        {tags.map((tag) => (
          <Tag key={tag} label={tag} onRemove={() => onRemove(tag)} />
        ))}
      </View>
      <View style={[styles.row, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <TextInput
          style={[styles.input, { color: C.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Add tag..."
          placeholderTextColor={C.textMuted}
          onSubmitEditing={onAdd}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="done"
          autoCorrect={false}
          autoComplete="off"
        />
        <TouchableOpacity onPress={onAdd} style={[styles.addBtn, { backgroundColor: C.accentDim }]}>
          <Text style={[styles.addTxt, { color: C.accent }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10, paddingTop: 12, borderTopWidth: 1 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  addTxt: { fontSize: 18, fontWeight: '600' },
});
