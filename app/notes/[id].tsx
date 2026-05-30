import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { FormScrollLayoutRef } from '../../components/forms/FormScrollLayout';
import {
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { showConfirm } from '../../lib/alert';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TagsInput } from '../../components/forms/TagsInput';
import { FormScrollLayout } from '../../components/forms/FormScrollLayout';
import { NoteFormatToolbar } from '../../components/notes/NoteFormatToolbar';
import { RichTextEditor, type RichTextEditorRef } from '../../components/notes/RichTextEditor';
import { GlowButton } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotesStore } from '../../stores/notesStore';
import { useAuthStore } from '../../stores/authStore';
import { runInlineAction, type InlineAction } from '../../lib/ai';
import {
  countCharsFromHtml,
  countWordsFromHtml,
  htmlToPlainText,
  toEditorHtml,
  type FormatAction,
} from '../../lib/noteContent';
import { logError } from '../../lib/firebase';
import { trackEvent } from '../../lib/posthog';
import { VoiceAgentBar } from '../../components/voice/VoiceAgentBar';
import { sendAIMessage } from '../../lib/ai';

const AI_ACTIONS: { key: InlineAction; label: string }[] = [
  { key: 'summarize', label: 'Summarize' },
  { key: 'rewrite', label: 'Rewrite' },
  { key: 'expand', label: 'Expand' },
  { key: 'extract_tasks', label: 'Tasks' },
  { key: 'auto_tag', label: 'Tags' },
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
  const [content, setContent] = useState(() => toEditorHtml(existing?.content ?? ''));
  const [tags, setTags] = useState(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(existing?.is_pinned ?? false);
  const [isArchived, setIsArchived] = useState(existing?.is_archived ?? false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formScrollRef = useRef<FormScrollLayoutRef>(null);
  const editorRef = useRef<RichTextEditorRef>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => formScrollRef.current?.scrollToEnd(true), 200);
  }, []);

  useEffect(() => {
    if (isNew) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateNote(id, { title, content, tags, is_pinned: isPinned, is_archived: isArchived });
    }, 1000);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, content, tags, isPinned, isArchived]);

  const handleSave = async () => {
    if (!user) return;
    try {
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
          is_archived: isArchived,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        trackEvent('note_created', {
          has_tags: tags.length > 0,
          word_count: countWordsFromHtml(content),
        });
      } else {
        await updateNote(id, { title, content, tags, is_pinned: isPinned, is_archived: isArchived });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      logError(e, 'notes:handleSave');
      throw e;
    }
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

  const handleDuplicate = async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addNote({
      id: 'note_' + Date.now(),
      user_id: user.id,
      title: (title || 'Untitled') + ' (copy)',
      content,
      tags: [...tags],
      attachments: [],
      linked_note_ids: [],
      is_pinned: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: title || 'Note',
        message: `${title || 'Untitled'}\n\n${htmlToPlainText(content)}`,
      });
    } catch {
      /* cancelled */
    }
  };

  const handleAI = async (action: InlineAction) => {
    const plain = htmlToPlainText(content);
    if (!plain) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const result = await runInlineAction(action, plain);
      setAiResult(result);
      if (action === 'auto_tag') {
        const suggested = result.split(/[,;\n]/).map((t) => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean);
        const merged = [...new Set([...tags, ...suggested.slice(0, 5)])];
        setTags(merged);
      }
    } catch (e) {
      logError(e, 'notes:handleAI');
      setAiResult('AI action failed. Check Profile → AI for your API key.');
    }
    setAiLoading(false);
  };

  const handleFormat = (action: FormatAction) => {
    editorRef.current?.applyFormat(action);
  };

  const appendPlainAsHtml = (text: string) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
    const block = `<p>${escaped}</p>`;
    const next = content.trim() ? `${content}<br/><br/>${block}` : block;
    editorRef.current?.setHtml(next);
    setContent(next);
  };

  const handleVoiceNote = async (spoken: string) => {
    const text = spoken.trim();
    if (!text) return;
    setAiLoading(true);
    setAiResult('');
    try {
      if (!title.trim()) {
        setTitle(text.length > 60 ? `${text.slice(0, 57)}…` : text);
      }
      const reply = await sendAIMessage({
        messages: [
          {
            id: 'voice_user',
            role: 'user',
            content:
              `Voice note command (respond with note body text only, no markdown fences): "${text}"`,
            created_at: new Date().toISOString(),
          },
        ],
        appContext: {
          notes: [],
          tasks: [],
          projects: [],
          userName: user?.name,
        },
      });
      const body = reply.replace(/^```[\s\S]*?```/gm, '').trim() || text;
      appendPlainAsHtml(body);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      logError(e, 'notes:handleVoiceNote');
      appendPlainAsHtml(text);
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const words = countWordsFromHtml(content);
  const chars = countCharsFromHtml(content);

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
            <Text style={[s.pillTxt, { color: isPinned ? C.accent : C.textMuted }]}>Pin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsArchived(!isArchived)}
            style={[
              s.pill,
              {
                backgroundColor: isArchived ? C.warningDim : C.bgCard,
                borderColor: isArchived ? C.warning + '55' : C.border,
              },
            ]}
          >
            <Text style={[s.pillTxt, { color: isArchived ? C.warning : C.textMuted }]}>Archive</Text>
          </TouchableOpacity>
          {!isNew && (
            <>
              <TouchableOpacity onPress={handleDuplicate} style={[s.pill, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <Text style={[s.pillTxt, { color: C.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={[s.pill, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <Text style={[s.pillTxt, { color: C.textSecondary }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[s.pill, { backgroundColor: C.dangerDim, borderColor: C.danger + '40' }]}
              >
                <Text style={[s.pillTxt, { color: C.danger }]}>Del</Text>
              </TouchableOpacity>
            </>
          )}
          <GlowButton label="Save" onPress={handleSave} size="sm" />
        </View>
      </View>

      <FormScrollLayout ref={formScrollRef} contentContainerStyle={s.scrollContent} keyboardExtraPad={80}>
        <TextInput
          style={[s.titleInput, { color: C.textPrimary }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title..."
          placeholderTextColor={C.textMuted}
          multiline
        />

        <View style={[s.wordRow, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
          <Text style={[s.wordStat, { color: C.textMuted }]}>
            {words} words · {chars} chars
          </Text>
          <Text style={[s.wordHint, { color: C.textMuted }]}>Rich text · select then format</Text>
        </View>

        <NoteFormatToolbar onFormat={handleFormat} />

        <VoiceAgentBar
          disabled={aiLoading}
          onSubmit={handleVoiceNote}
          placeholder="Voice → AI writes into this note"
        />

        <View style={s.aiBar}>
          {AI_ACTIONS.map((a) => (
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
            {aiResult && !aiLoading ? (
              <View style={s.aiActions}>
                <TouchableOpacity onPress={() => appendPlainAsHtml(aiResult)}>
                  <Text style={[s.insertBtn, { color: C.accent }]}>+ Insert</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const block = `<p>${aiResult.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p>`;
                    editorRef.current?.setHtml(block);
                    setContent(block);
                  }}
                >
                  <Text style={[s.insertBtn, { color: C.cyan }]}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAiResult('')}>
                  <Text style={[s.insertBtn, { color: C.textMuted }]}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        <RichTextEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          placeholder="Start writing… Select text, then tap B for bold, I for italic, etc."
          textColor={C.textPrimary}
          bgColor={C.bg}
          accentColor={C.accent}
          mutedColor={C.textMuted}
          minHeight={300}
        />

        <TagsInput
          tags={tags}
          value={tagInput}
          onChangeText={setTagInput}
          onAdd={addTag}
          onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
          onFocus={scrollToBottom}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingBottom: Spacing.md },
  titleInput: { ...Typography.displaySm, marginBottom: Spacing.sm, lineHeight: 34 },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  wordStat: { fontSize: 12, fontWeight: '600' },
  wordHint: { fontSize: 11 },
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
  aiActions: { flexDirection: 'row', gap: 16 },
  insertBtn: { fontSize: 12, fontWeight: '700' },
});
