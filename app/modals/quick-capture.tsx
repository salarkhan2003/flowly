import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ClayCard } from '../../components/ui/ClayCard';
import { GlowButton } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
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
  const { C } = useTheme();
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
      await addNote({
        id: `note_${Date.now()}`,
        user_id: user.id,
        title: text.split('\n')[0].slice(0, 60) || 'Quick Note',
        content: text,
        tags: [],
        attachments: [],
        linked_note_ids: [],
        is_pinned: false,
        is_archived: false,
        created_at: now,
        updated_at: now,
      });
    } else if (type === 'task') {
      await addTask({
        id: `task_${Date.now()}`,
        user_id: user.id,
        title: text.trim(),
        status: 'todo',
        priority: 'none',
        subtasks: [],
        tags: [],
        is_starred: false,
        created_at: now,
        updated_at: now,
      });
    } else {
      await addProject({
        id: `proj_${Date.now()}`,
        user_id: user.id,
        name: text.trim(),
        description: '',
        color: C.accent,
        icon: text.trim().charAt(0).toUpperCase(),
        status: 'active',
        task_ids: [],
        note_ids: [],
        created_at: now,
        updated_at: now,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);
    router.back();
  };

  const placeholder =
    type === 'note' ? 'Write your note...' : type === 'task' ? 'What needs to be done?' : 'Project name...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ClayCard style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: C.textPrimary }]}>Quick Capture</Text>
            <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { borderColor: C.border }]}>
              <Text style={[styles.closeTxt, { color: C.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.typeToggle}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeBtn,
                  { borderColor: C.border, backgroundColor: C.bgCardAlt },
                  type === t.key && { backgroundColor: C.accentDim, borderColor: C.borderGlow },
                ]}
                onPress={() => setType(t.key)}
              >
                <View
                  style={[
                    styles.typeBadge,
                    { borderColor: C.textMuted },
                    type === t.key && { backgroundColor: C.accent, borderColor: C.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      { color: C.textMuted },
                      type === t.key && { color: C.bg },
                    ]}
                  >
                    {t.letter}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.typeLabel,
                    { color: C.textSecondary },
                    type === t.key && { color: C.accent },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, { color: C.textPrimary, backgroundColor: C.bgCardDeep, borderColor: C.border }]}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={C.textMuted}
            multiline={type !== 'project'}
            autoFocus
          />

          <GlowButton
            label={`Save ${currentType.label}`}
            onPress={handleCapture}
            loading={saving}
            disabled={!text.trim()}
            size="lg"
            fullWidth
          />
        </ClayCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  sheet: { flex: 1, padding: Spacing.md, gap: Spacing.sm },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.5)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Typography.headingMd, fontWeight: '700' },
  closeBtn: { padding: 8, borderRadius: Radius.md, borderWidth: 1 },
  closeTxt: { fontSize: 16 },
  typeToggle: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  typeBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: { fontSize: 10, fontWeight: '800' },
  typeLabel: { ...Typography.bodyMd, fontWeight: '600' },
  input: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...Typography.bodyLg,
    lineHeight: 26,
    textAlignVertical: 'top',
  },
});
