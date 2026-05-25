import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface TagProps {
  label: string;
  onRemove?: () => void;
  color?: string;
}

export function Tag({ label, onRemove, color = Colors.accent }: TagProps) {
  return (
    <View style={[styles.tag, { borderColor: color + '40', backgroundColor: color + '15' }]}>
      <Text style={[styles.text, { color }]}>#{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={8}>
          <Text style={[styles.remove, { color }]}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: '500' },
  remove: { fontSize: 16, lineHeight: 16, fontWeight: '700' },
});
