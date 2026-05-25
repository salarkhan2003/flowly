import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { TaskPriority } from '../../types';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { C } = useTheme();
  const config: Record<TaskPriority, { label: string; color: string }> = {
    high:   { label: 'High',   color: C.priorityHigh },
    medium: { label: 'Medium', color: C.priorityMedium },
    low:    { label: 'Low',    color: C.priorityLow },
    none:   { label: 'None',   color: C.priorityNone },
  };
  const { label, color } = config[priority];
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});
