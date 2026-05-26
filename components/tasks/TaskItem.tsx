import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showConfirm } from '../../lib/alert';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PriorityBadge } from '../ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types';
import { useTasksStore } from '../../stores/tasksStore';
import { formatDueDate, formatDueTime, isOverdueDueDate } from '../../lib/dates';

export function TaskItem({ task }: { task: Task }) {
  const { C } = useTheme();
  const { toggleTask, deleteTask } = useTasksStore();
  const [showActions, setShowActions] = useState(false);
  const checkScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1.35, useNativeDriver: true, speed: 50 }),
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 18 }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleTask(task.id);
  };

  const handlePress = () => {
    if (showActions) { setShowActions(false); return; }
    Animated.sequence([
      Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true, speed: 60 }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    router.push(`/tasks/${task.id}` as any);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions((v) => !v);
  };

  const handleDelete = () => {
    setShowActions(false);
    showConfirm({
      title: 'Delete task',
      message: `Remove "${task.title}"? This cannot be undone.`,
      destructive: true,
      confirmLabel: 'Delete',
      onConfirm: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        deleteTask(task.id);
      },
    });
  };

  const isDone = task.status === 'done';
  const isOverdue = !isDone && isOverdueDueDate(task.due_date);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: C.bgCard,
            borderColor: isDone ? C.border : task.is_starred ? C.warning + '50' : C.border,
            shadowColor: isDone ? '#000' : task.is_starred ? C.warning : '#000',
          },
          isDone && styles.done,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.88}
      >
        {/* Clay highlight */}
        <View style={[styles.highlight, { backgroundColor: C.bgGlassLight }]} />

        {/* Priority left bar */}
        <View style={[styles.priorityBar, {
          backgroundColor: task.priority === 'high' ? C.danger :
            task.priority === 'medium' ? C.warning :
            task.priority === 'low' ? C.info : 'transparent',
        }]} />

        <View style={styles.row}>
          {/* Checkbox */}
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                { borderColor: isDone ? C.accent : C.border },
                isDone && { backgroundColor: C.accent },
              ]}
              onPress={handleToggle}
            >
              {isDone && (
                <View style={styles.checkInner}>
                  <View style={[styles.checkL, { backgroundColor: C.bg }]} />
                  <View style={[styles.checkR, { backgroundColor: C.bg }]} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[styles.title, { color: C.textPrimary }, isDone && { color: C.textMuted, textDecorationLine: 'line-through' }]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <View style={styles.meta}>
              <PriorityBadge priority={task.priority} />
              {task.due_date && (() => {
                  const dateStr = formatDueDate(task.due_date, 'MMM d');
                  const timeStr = formatDueTime(task.due_date);
                  if (!dateStr) return null;
                  const label = timeStr ? `${dateStr} · ${timeStr}` : dateStr;
                  return (
                    <View style={[styles.duePill, {
                      backgroundColor: isOverdue ? C.dangerDim : C.bgCardAlt,
                      borderColor: isOverdue ? C.danger + '40' : C.border,
                    }]}>
                      <Text style={[styles.dueText, { color: isOverdue ? C.danger : C.textSecondary }]}>
                        {label}
                      </Text>
                    </View>
                  );
                })()}
              {task.subtasks.length > 0 && (
                <View style={[styles.subtaskPill, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
                  <Text style={[styles.subtaskTxt, { color: C.textMuted }]}>
                    {task.subtasks.filter((s) => s.is_done).length}/{task.subtasks.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            {showActions && (
              <View style={[styles.actionBar, { borderTopColor: C.border }]}>
                {[
                  { label: 'Edit', color: C.accent, bg: C.accentDim, border: C.borderGlow, action: () => { setShowActions(false); router.push(`/tasks/${task.id}` as any); } },
                  { label: 'Delete', color: C.danger, bg: C.dangerDim, border: C.danger + '40', action: handleDelete },
                ].map((a) => (
                  <TouchableOpacity key={a.label} style={[styles.actionBtn, { backgroundColor: a.bg, borderColor: a.border }]} onPress={a.action}>
                    <Text style={[styles.actionTxt, { color: a.color }]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Star */}
          {task.is_starred && (
            <View style={[styles.star, { backgroundColor: C.warning, shadowColor: C.warning }]} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.sm },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1 },
  priorityBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  done: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: Spacing.md, paddingLeft: 18 },
  checkbox: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0,
  },
  checkInner: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  checkL: { position: 'absolute', width: 4, height: 1.8, left: 0, bottom: 2, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  checkR: { position: 'absolute', width: 8, height: 1.8, right: -1, bottom: 4, borderRadius: 1, transform: [{ rotate: '-50deg' }] },
  content: { flex: 1, gap: 8 },
  title: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  duePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  dueText: { fontSize: 11, fontWeight: '600' },
  subtaskPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  subtaskTxt: { fontSize: 11, fontWeight: '600' },
  star: { width: 8, height: 8, borderRadius: 4, marginTop: 8, flexShrink: 0, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 },
  actionBar: { flexDirection: 'row', gap: 6, paddingTop: 8, borderTopWidth: 1, marginTop: 2 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  actionTxt: { fontSize: 12, fontWeight: '700' },
});
