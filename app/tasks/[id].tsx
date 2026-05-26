import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormScrollLayout, type FormScrollLayoutRef } from '../../components/forms/FormScrollLayout';
import { showConfirm } from '../../lib/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { GlowButton, PriorityBadge, ClayCard, DatePicker } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { Task, TaskPriority, TaskStatus, Subtask } from '../../types';

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low', 'none'];
const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
];

function StarIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      {filled ? (
        <View style={{ width: 14, height: 14, backgroundColor: color, borderRadius: 2, transform: [{ rotate: '45deg' }] }} />
      ) : (
        <View style={{ width: 14, height: 14, borderWidth: 1.5, borderColor: color, borderRadius: 2, transform: [{ rotate: '45deg' }] }} />
      )}
    </View>
  );
}

export default function TaskDetailScreen() {
  const { C } = useTheme();
  const { id, due } = useLocalSearchParams<{ id: string; due?: string }>();
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore();
  const { user } = useAuthStore();

  const isNew = id === 'new';
  const existing = isNew ? null : tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(existing?.priority ?? 'none');
  const [status, setStatus] = useState<TaskStatus>(existing?.status ?? 'todo');
  const [dueDate, setDueDate] = useState(existing?.due_date ?? due ?? '');
  const [subtasks, setSubtasks] = useState<Subtask[]>(existing?.subtasks ?? []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isStarred, setIsStarred] = useState(existing?.is_starred ?? false);
  const formScrollRef = useRef<FormScrollLayoutRef>(null);

  const scrollToSubtasks = () => {
    setTimeout(() => formScrollRef.current?.scrollToEnd(true), 200);
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    if (isNew) {
      await addTask({
        id: `task_${Date.now()}`, user_id: user.id,
        title: title.trim(), description, status, priority,
        due_date: dueDate || undefined, subtasks, tags: [],
        is_starred: isStarred,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      } as Task);
    } else {
      await updateTask(id, { title, description, priority, status, due_date: dueDate || undefined, subtasks, is_starred: isStarred });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete task',
      message: 'This cannot be undone.',
      destructive: true,
      confirmLabel: 'Delete',
      onConfirm: async () => { if (!isNew) await deleteTask(id); router.back(); },
    });
  };

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (!t) return;
    setSubtasks([...subtasks, { id: `sub_${Date.now()}`, title: t, is_done: false }]);
    setSubtaskInput('');
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border, backgroundColor: C.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={[s.backArrow, { borderColor: C.accent }]} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>{isNew ? 'New Task' : 'Edit Task'}</Text>
        <View style={s.headerRight}>
          <TouchableOpacity
            onPress={() => setIsStarred(!isStarred)}
            style={[s.iconBtn, { backgroundColor: isStarred ? C.warningDim : C.bgCard, borderColor: isStarred ? C.warning + '60' : C.border }]}
          >
            <StarIcon filled={isStarred} color={C.warning} />
          </TouchableOpacity>
          {!isNew && (
            <TouchableOpacity onPress={handleDelete} style={[s.iconBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + '40' }]}>
              <View style={[s.trashLine, { backgroundColor: C.danger }]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FormScrollLayout ref={formScrollRef} contentContainerStyle={s.content} keyboardExtraPad={80}>
        {/* Title */}
        <TextInput
          style={[s.titleInput, { color: C.textPrimary, borderBottomColor: C.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Task title..."
          placeholderTextColor={C.textMuted}
          multiline
        />

        {/* Description */}
        <TextInput
          style={[s.descInput, { color: C.textSecondary }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add description..."
          placeholderTextColor={C.textMuted}
          multiline
        />

        {/* Priority */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>PRIORITY</Text>
            <View style={s.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[s.priorityBtn, priority === p && { opacity: 1, transform: [{ scale: 1 }] }]}
                >
                  <PriorityBadge priority={p} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ClayCard>

        {/* Status */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>STATUS</Text>
            <View style={s.statusRow}>
              {STATUSES.map((st) => (
                <TouchableOpacity
                  key={st.key}
                  style={[s.statusBtn, { borderColor: C.border },
                    status === st.key && { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
                  onPress={() => setStatus(st.key)}
                >
                  <Text style={[s.statusText, { color: status === st.key ? C.accent : C.textSecondary }]}>{st.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ClayCard>

        {/* Due Date */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>DUE DATE & TIME</Text>
            <DatePicker value={dueDate} onChange={setDueDate} placeholder="Pick date & time" showTime />
          </View>
        </ClayCard>

        {/* Subtasks */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>
              SUBTASKS ({subtasks.filter((s) => s.is_done).length}/{subtasks.length})
            </Text>
            {subtasks.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={s.subtaskRow}
                onPress={() => setSubtasks(subtasks.map((s) => s.id === sub.id ? { ...s, is_done: !s.is_done } : s))}
              >
                <View style={[s.subCheck, { borderColor: C.accent }, sub.is_done && { backgroundColor: C.accent }]}>
                  {sub.is_done && (
                    <View style={{ width: 6, height: 3.5, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: C.bg, transform: [{ rotate: '-45deg' }, { translateY: -0.5 }] }} />
                  )}
                </View>
                <Text style={[s.subTitle, { color: sub.is_done ? C.textMuted : C.textPrimary },
                  sub.is_done && { textDecorationLine: 'line-through' }]}>
                  {sub.title}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={[s.subtaskInputRow, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
              <TextInput
                style={[s.subtaskInput, { color: C.textPrimary }]}
                value={subtaskInput}
                onChangeText={setSubtaskInput}
                placeholder="Add subtask..."
                placeholderTextColor={C.textMuted}
                onSubmitEditing={addSubtask}
                onFocus={scrollToSubtasks}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={addSubtask} style={[s.subAddBtn, { backgroundColor: C.accentDim }]}>
                <Text style={[s.subAddText, { color: C.accent }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ClayCard>

        <GlowButton label={isNew ? 'Create Task' : 'Save Changes'} onPress={handleSave} size="lg" style={s.saveBtn} fullWidth />
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backArrow: { width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }, { translateX: 2 }] },
  headerTitle: { ...Typography.headingMd, flex: 1, textAlign: 'center', fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  trashLine: { width: 12, height: 2, borderRadius: 1 },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 80 },
  titleInput: { ...Typography.displaySm, fontWeight: '700', borderBottomWidth: 1, paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  descInput: { ...Typography.bodyLg, minHeight: 70, marginBottom: Spacing.sm },
  fieldCard: { marginBottom: 0 },
  fieldContent: { padding: Spacing.md, gap: 10 },
  fieldLabel: { ...Typography.caption },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priorityBtn: { opacity: 0.45, transform: [{ scale: 0.95 }] },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600' },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  subTitle: { ...Typography.bodyMd, flex: 1 },
  subtaskInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.sm, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  subtaskInput: { flex: 1, padding: 10, fontSize: 14 },
  subAddBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  subAddText: { fontSize: 18, fontWeight: '700' },
  saveBtn: { marginTop: Spacing.sm },
});
