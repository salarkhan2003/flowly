import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { GlowButton } from '../../components/ui';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useAuthStore } from '../../stores/authStore';
import { Note, Task, Project } from '../../types';

type CaptureType = 'note' | 'task' | 'project';

const TYPES: { key: CaptureType; label: string; letter: string }[] = [
  { key: 'note', label: 'Note', letter: 'N' },
  { key: 'task', label: 'Task', letter: 'T' },
  { key: 'project', label: 'Project', letter: 'P' },
];

export default function QuickCaptureModal() {
  const [type, setType] = useState<CaptureType>('note');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const { addNote } = useNotesStore();
  const { addTask } = useTasksStore();
  const { addProject } = useProjectsStore();

  const currentType = TYPES.find((t) => t.key === type)!;

  const handleCapture = async () => {
    if (!text.trim() || !user) return;
    setSaving(true);
    const now = new Date().toISOString();

    if (type === 'note') {
      const note: Note = {
        id: `note_${Date.now()}`, user_id: user.id,
        title: text.split('\n')[0].slice(0, 60) || 'Quick Note',
        content: text, tags: [], attachments: [], linked_note_ids: [],
        is_pinned: false, is_archived: false, created_at: now, updated_at: now,
      };
      await addNote(note);
    } else if (type === 'task') {
      const task: Task = {
        id: `task_${Date.now()}`, user_id: user.id,
        title: text.trim(), status: 'todo', priority: 'none',
        subtasks: [], tags: [], is_starred: false, created_at: now, updated_at: now,
      };
      await addTask(task);
    } else {
      const project: Project = {
        id: `proj_${Date.now()}`, user_id: user.id,
        name: text.trim(), description: '', color: '#00FF9D',
        icon: text.trim().charAt(0).toUpperCase(),
        status: 'active', task_ids: [], note_ids: [], created_at: now, updated_at: now,
      };
      await addProject(project);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  };

  const placeholder = type === 'note' ? 'Write your note...' : type === 'task' ? 'What needs to be done?' : 'Project name...';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Quick Capture</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeToggle}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
              onPress={() => setType(t.key)}
            >
              <View style={[styles.typeBadge, type === t.key && styles.typeBadgeActive]}>
                <Text style={[styles.typeBadgeText, type === t.key && styles.typeBadgeTextActive]}>{t.letter}</Text>
              </View>
              <Text style={[styles.typeLabel, type === t.key && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline={type !== 'project'}
          autoFocus
        />

        <View style={styles.footer}>
          <GlowButton
            label={`Save ${currentType.label}`}
            onPress={handleCapture}
            loading={saving}
            disabled={!text.trim()}
            size="lg"
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCard },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title: { ...Typography.headingMd, color: Colors.textPrimary, fontWeight: '700' },
  closeBtn: { padding: 8 },
  closeTxt: { fontSize: 16, color: Colors.textMuted },
  typeToggle: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 11, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  typeBtnActive: { backgroundColor: Colors.accentDim, borderColor: Colors.borderGlow },
  typeBadge: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  typeBadgeActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  typeBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.textMuted },
  typeBadgeTextActive: { color: Colors.bg },
  typeLabel: { ...Typography.bodyMd, color: Colors.textSecondary, fontWeight: '600' },
  typeLabelActive: { color: Colors.accent },
  input: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: 4, ...Typography.bodyLg, color: Colors.textPrimary, lineHeight: 26, textAlignVertical: 'top' },
  footer: { padding: Spacing.md },
  saveBtn: { width: '100%' },
});
