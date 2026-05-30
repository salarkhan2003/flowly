import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClayCategory, Radius, Spacing, Typography } from '../../constants/theme';
import { ClayCard } from '../../components/ui/ClayCard';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useTheme } from '../../hooks/useTheme';
import { useAIStore } from '../../stores/aiStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { AIConversation, AIMessage } from '../../types';
import { useScreenAnalytics } from '../../hooks/useScreenAnalytics';
import { VoiceAgentBar } from '../../components/voice/VoiceAgentBar';

/** Space above floating tab bar when keyboard is closed */
const TAB_BAR_CLEARANCE = 78;
const INPUT_BAR_HEIGHT = 64;

const SUGGESTIONS = [
  'What are my pending tasks?',
  'Summarize my recent notes',
  'Help me plan my day',
  'What projects am I working on?',
];

export default function AIScreen() {
  useScreenAnalytics('AI');
  const { C } = useTheme();
  const { user } = useAuthStore();
  const { notes } = useNotesStore();
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();
  const {
    conversations, activeConversationId, isLoading,
    createConversation, sendMessage, setActiveConversation,
    loadConversations, deleteConversation, setAppContext,
  } = useAIStore();

  const [input, setInput] = useState('');
  const { keyboardVisible, keyboardHeight } = useKeyboard();
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  // Use a ref so handleSend always has the latest conversation ID
  const activeConvIdRef = useRef<string | null>(activeConversationId);
  useEffect(() => { activeConvIdRef.current = activeConversationId; }, [activeConversationId]);
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (user?.id) loadConversations(user.id);
  }, [user?.id]);

  useEffect(() => {
    setAppContext({
      notes: notes.map((n) => ({ title: n.title, content: n.content, tags: n.tags })),
      tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, due_date: t.due_date })),
      projects: projects.map((p) => ({ name: p.name, status: p.status, description: p.description })),
      userName: user?.name,
    });
  }, [notes, tasks, projects, user?.name]);

  useEffect(() => {
    if (!activeConversationId) {
      const id = createConversation();
      setActiveConversation(id);
    }
  }, []);

  useEffect(() => {
    if (keyboardVisible) {
      const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(t);
    }
  }, [keyboardVisible]);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
      ])).start();
    } else {
      dotAnim.stopAnimation();
      dotAnim.setValue(0);
    }
  }, [isLoading]);

  const submitToAgent = async (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed || isLoading) return;

    const convId = activeConvIdRef.current ?? createConversation();
    activeConvIdRef.current = convId;
    await sendMessage(convId, trimmed);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    await submitToAgent(msg);
  };

  const handleNewChat = () => {
    const id = createConversation();
    setActiveConversation(id);
    setShowHistory(false);
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top']}>

      {/* Header — outside KAV so it never moves */}
      <View style={[s.header, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
        <TouchableOpacity style={s.menuBtn} onPress={() => setShowHistory(true)}>
          <View style={[s.ml, { backgroundColor: C.textSecondary }]} />
          <View style={[s.ml, { backgroundColor: C.textSecondary, width: 14 }]} />
          <View style={[s.ml, { backgroundColor: C.textSecondary }]} />
        </TouchableOpacity>
        <View style={s.hMid}>
          <View style={[s.aiDot, { backgroundColor: C.accent, shadowColor: C.accent }]} />
          <View>
            <Text style={[s.title, { color: C.textPrimary }]}>Flowly AI</Text>
            <Text style={[s.sub, { color: C.textMuted }]}>
              {activeConv?.title && activeConv.title !== 'New Chat'
                ? activeConv.title : 'Groq · llama-3.3-70b'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[s.newBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
          onPress={handleNewChat}
        >
          <Text style={[s.newBtnTxt, { color: C.accent }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={s.chatWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={s.msgs}
          contentContainerStyle={[
            s.msgsContent,
            { paddingBottom: INPUT_BAR_HEIGHT + (keyboardVisible ? 12 : TAB_BAR_CLEARANCE) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {(!activeConv || activeConv.messages.length === 0) && (
            <View style={s.empty}>
              <ClayCard tone="coral" glowing style={s.emptyIconCard}>
                <Text style={[s.emptyIconTxt, { color: ClayCategory.coral }]}>AI</Text>
              </ClayCard>
              <Text style={[s.emptyTitle, { color: C.textPrimary }]}>How can I help?</Text>
              <Text style={[s.emptySub, { color: C.textSecondary }]}>
                Full access to your notes, tasks, and projects.
              </Text>
              <View style={s.badges}>
                {[
                  { l: `${notes.length} Notes`, c: ClayCategory.notes },
                  { l: `${tasks.length} Tasks`, c: ClayCategory.tasks },
                  { l: `${projects.length} Projects`, c: ClayCategory.projects },
                ].map(({ l, c }) => (
                  <View key={l} style={[s.badge, { backgroundColor: c + '22', borderColor: c + '66' }]}>
                    <Text style={[s.badgeTxt, { color: c }]}>{l}</Text>
                  </View>
                ))}
              </View>
              <VoiceAgentBar
                disabled={isLoading}
                onSubmit={submitToAgent}
                placeholder="Speak to create notes, tasks, or projects"
              />
              <View style={s.suggs}>
                {SUGGESTIONS.map((sg) => (
                  <TouchableOpacity
                    key={sg}
                    style={[s.sugg, { backgroundColor: C.bgCard, borderColor: C.border }]}
                    onPress={async () => {
                      setInput('');
                      const convId = activeConvIdRef.current ?? createConversation();
                      activeConvIdRef.current = convId;
                      await sendMessage(convId, sg);
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                    }}
                  >
                    <Text style={[s.suggTxt, { color: C.textSecondary }]}>{sg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeConv?.messages.map((msg) => (
            <MsgBubble key={msg.id} message={msg} C={C} />
          ))}

          {isLoading && (
            <View style={[s.loadBubble, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[s.dot, { backgroundColor: C.accent, opacity: dotAnim, marginHorizontal: i === 1 ? 3 : 0 }]}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[s.bar, {
          backgroundColor: C.bgCard,
          borderTopColor: C.border,
          paddingBottom: keyboardVisible
            ? Math.max(insets.bottom, 10)
            : TAB_BAR_CLEARANCE + Math.max(insets.bottom, 0),
          ...(keyboardVisible && Platform.OS === 'android'
            ? { marginBottom: keyboardHeight }
            : null),
        }]}>
          <VoiceAgentBar compact disabled={isLoading} onSubmit={submitToAgent} />
          <TextInput
            style={[s.input, { backgroundColor: C.bgCardAlt, borderColor: C.border, color: C.textPrimary }]}
            value={input}
            onChangeText={setInput}
            placeholder="Type or use mic…"
            placeholderTextColor={C.textMuted}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: C.accent, shadowColor: C.accent },
              (isLoading || !input.trim()) && s.sendOff]}
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Text style={[s.sendArrow, { color: C.bg }]}>^</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* History modal */}
      <Modal visible={showHistory} animationType="slide" transparent onRequestClose={() => setShowHistory(false)}>
        <View style={[s.modal, { backgroundColor: C.bg }]}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: C.bgCard }}>
            <View style={[s.modalHdr, { borderBottomColor: C.border }]}>
              <Text style={[s.modalTitle, { color: C.textPrimary }]}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)} style={s.closeBtn}>
                <Text style={[s.closeTxt, { color: C.textMuted }]}>X</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <TouchableOpacity
            style={[s.newRow, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
            onPress={handleNewChat}
          >
            <View style={[s.newIcon, { backgroundColor: C.accent }]}>
              <Text style={[s.newIconTxt, { color: C.bg }]}>+</Text>
            </View>
            <Text style={[s.newLabel, { color: C.accent }]}>New Conversation</Text>
          </TouchableOpacity>
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: Spacing.md, gap: 8 }}
            renderItem={({ item }) => (
              <HistItem
                conv={item}
                isActive={item.id === activeConversationId}
                onSelect={() => { setActiveConversation(item.id); setShowHistory(false); }}
                onDelete={() => deleteConversation(item.id)}
                C={C}
              />
            )}
            ListEmptyComponent={
              <Text style={[s.emptyHist, { color: C.textMuted }]}>No conversations yet</Text>
            }
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type ColorsType = ReturnType<typeof import('../../constants/theme').getColors>;

function MsgBubble({ message, C }: { message: AIMessage; C: ColorsType }) {
  const isUser = message.role === 'user';
  return (
    <View style={[
      s.bubble,
      isUser
        ? [s.bubbleUser, { backgroundColor: C.accent }]
        : [s.bubbleAI, { backgroundColor: C.bgCard, borderColor: C.border }],
    ]}>
      {!isUser && (
        <View style={[s.aiBadge, { backgroundColor: C.accentDim }]}>
          <Text style={[s.aiBadgeTxt, { color: C.accent }]}>AI</Text>
        </View>
      )}
      <Text style={[s.bubbleTxt, isUser
        ? { color: C.bg, fontWeight: '500' as const }
        : { color: C.textPrimary }]}>
        {message.content}
      </Text>
    </View>
  );
}

function HistItem({ conv, isActive, onSelect, onDelete, C }: {
  conv: AIConversation; isActive: boolean;
  onSelect: () => void; onDelete: () => void; C: ColorsType;
}) {
  return (
    <TouchableOpacity
      style={[s.histItem, {
        backgroundColor: isActive ? C.accentDim : C.bgCard,
        borderColor: isActive ? C.borderGlow : C.border,
      }]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.histTitle, { color: C.textPrimary }]} numberOfLines={1}>{conv.title}</Text>
        <Text style={[s.histMeta, { color: C.textMuted }]}>
          {conv.messages.length} msgs · {new Date(conv.updated_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={s.delBtn} hitSlop={8}>
        <Text style={s.delTxt}>Del</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  chatWrap: { flex: 1, position: 'relative' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1,
  },
  menuBtn: { padding: 8, gap: 4 },
  ml: { width: 20, height: 2, borderRadius: 1 },
  hMid: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingHorizontal: 10 },
  aiDot: {
    width: 10, height: 10, borderRadius: 5,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  title: { ...Typography.headingMd, fontWeight: '700' },
  sub: { ...Typography.bodySm },
  newBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  newBtnTxt: { ...Typography.bodySm, fontWeight: '700' },
  msgs: { flex: 1 },
  msgsContent: { padding: Spacing.md, gap: 12, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 14 },
  emptyIconCard: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  emptyIconTxt: { fontSize: 20, fontWeight: '800' },
  emptyTitle: { ...Typography.headingLg, fontWeight: '700' },
  emptySub: { ...Typography.bodyMd, textAlign: 'center' },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  badgeTxt: { ...Typography.bodySm, fontWeight: '600' },
  suggs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  sugg: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  suggTxt: { ...Typography.bodySm },
  bubble: { maxWidth: '85%', borderRadius: Radius.lg, padding: Spacing.md },
  bubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAI: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4, gap: 6 },
  aiBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start',
  },
  aiBadgeTxt: { fontSize: 9, fontWeight: '800' },
  bubbleTxt: { ...Typography.bodyMd, lineHeight: 22 },
  loadBubble: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: Radius.lg, borderBottomLeftRadius: 4,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4,
  },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1, height: 44, borderRadius: Radius.lg, borderWidth: 1,
    paddingHorizontal: 14, fontSize: 15,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6,
  },
  sendOff: { opacity: 0.35 },
  sendArrow: { fontSize: 20, fontWeight: '800' },
  modal: { flex: 1 },
  modalHdr: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { ...Typography.headingMd, fontWeight: '700' },
  closeBtn: { padding: 6 },
  closeTxt: { fontSize: 16, fontWeight: '700' },
  newRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1,
  },
  newIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  newIconTxt: { fontSize: 20, fontWeight: '700' },
  newLabel: { ...Typography.headingSm, fontWeight: '700' },
  histItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, gap: 10,
  },
  histTitle: { ...Typography.bodyMd, fontWeight: '600' },
  histMeta: { ...Typography.bodySm, marginTop: 2 },
  delBtn: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1,
    borderColor: 'rgba(255,77,109,0.3)', backgroundColor: 'rgba(255,77,109,0.1)',
  },
  delTxt: { ...Typography.bodySm, color: '#FF4D6D', fontWeight: '600' },
  emptyHist: { ...Typography.bodyMd, textAlign: 'center', marginTop: 40 },
});
