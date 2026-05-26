import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showConfirm } from '../../lib/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TagsInput } from '../../components/forms/TagsInput';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { GlowButton } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotesStore } from '../../stores/notesStore';
import { useAuthStore } from '../../stores/authStore';
import { runInlineAction, type InlineAction } from '../../lib/ai';

const ACTIONS: { key: InlineAction; label: string }[] = [
  { key: 'summarize', label: 'Summarize' },
  { key: 'rewrite', label: 'Rewrite' },
  { key: 'expand', label: 'Expand' },
  { key: 'extract_tasks', label: 'Extract Tasks' },
  { key: 'auto_tag', label: 'Auto-tag' },
];

export default function NoteEditorScreen() {
  const { C } = useTheme();
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = typeof idParam === 'string' ? idParam : Array.isArray(idParam) ? idParam[0] ?? 'new' : 'new';
  const { getNoteById, addNote, updateNote, deleteNote } = useNotesStore();
  const { user } = useAuthStore();
  const isNew = id === 'new';
  const existing = isNew ? null : getNoteById(id);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [tags, setTags] = useState(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(existing?.is_pinned ?? false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isNew) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateNote(id, { title, content, tags, is_pinned: isPinned });
    }, 1000);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, content, tags, isPinned]);

  const handleSave = async () => {
    if (!user) return;
    if (isNew) {
      await addNote({
        id: 'note_' + Date.now(),
        user_id: user.id,
        title: title || 'Untitled',
        content,
        tags,
        attachments: [],
        linked_note_ids: [],
        is_pinned: isPinned,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      await updateNote(id, { title, content, tags, is_pinned: isPinned });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete note',
      message: 'This cannot be undone.',
      destructive: true,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        if (!isNew) await deleteNote(id);
        router.back();
      },
    });
  };

  const handleAI = async (action: InlineAction) => {
    if (!content) return;
    setAiLoading(true);
    setAiResult('');
    try {
      setAiResult(await runInlineAction(action, content));
    } catch {
      setAiResult('AI action failed.');
    }
    setAiLoading(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border, backgroundColor: C.bg }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
        >
          <View style={[s.backArrow, { borderColor: C.accent }]} />
        </TouchableOpacity>
        <View style={s.headerActions}>
          <TouchableOpacity
            onPress={() => setIsPinned(!isPinned)}
            style={[
              s.pill,
              {
                backgroundColor: isPinned ? C.accentDim : C.bgCard,
                borderColor: isPinned ? C.borderGlow : C.border,
              },
            ]}
          >
            <View style={[s.pinDot, { backgroundColor: isPinned ? C.accent : C.textMuted }]} />
            <Text style={[s.pillTxt, { color: isPinned ? C.accent : C.textMuted }]}>Pin</Text>
          </TouchableOpacity>
          {!isNew && (
            <TouchableOpacity
              onPress={handleDelete}
              style={[s.pill, { backgroundColor: C.dangerDim, borderColor: C.danger + '40' }]}
            >
              <Text style={[s.pillTxt, { color: C.danger }]}>Delete</Text>
            </TouchableOpacity>
          )}
          <GlowButton label="Save" onPress={handleSave} size="sm" />
        </View>
      </View>

      <FormScrollLayout contentContainerStyle={s.scrollContent} keyboardExtraPad={80}>
        <TextInput
          style={[s.titleInput, { color: C.textPrimary }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title..."
          placeholderTextColor={C.textMuted}
          multiline
        />
        <View style={s.aiBar}>
          {ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.key}
              style={[s.aiBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
              onPress={() => handleAI(a.key)}
              disabled={aiLoading}
            >
              <Text style={[s.aiBtnTxt, { color: C.accent }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {aiLoading || aiResult ? (
          <View style={[s.aiResult, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}>
            <Text style={[s.aiLabel, { color: C.accent }]}>AI Result</Text>
            <Text style={[s.aiText, { color: C.textPrimary }]}>
              {aiLoading ? 'Processing...' : aiResult}
            </Text>
            {aiResult ? (
              <TouchableOpacity onPress={() => setContent(content + '\n\n' + aiResult)}>
                <Text style={[s.insertBtn, { color: C.accent }]}>+ Insert into note</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        <TextInput
          style={[s.contentInput, { color: C.textPrimary }]}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing..."
          placeholderTextColor={C.textMuted}
          multiline
          textAlignVertical="top"
        />
        <TagsInput
          tags={tags}
          value={tagInput}
          onChangeText={setTagInput}
          onAdd={addTag}
          onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
        />
      </FormScrollLayout>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pinDot: { width: 6, height: 6, borderRadius: 3 },
  pillTxt: { fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingBottom: Spacing.md },
  titleInput: { ...Typography.displaySm, marginBottom: Spacing.sm, lineHeight: 34 },
  aiBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  aiBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  aiBtnTxt: { fontSize: 12, fontWeight: '600' },
  aiResult: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  aiLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  aiText: { ...Typography.bodyMd, lineHeight: 22 },
  insertBtn: { fontSize: 12, fontWeight: '600' },
  contentInput: { ...Typography.bodyLg, lineHeight: 26, minHeight: 280, marginBottom: Spacing.lg },
});
