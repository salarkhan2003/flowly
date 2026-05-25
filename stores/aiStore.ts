import { create } from 'zustand';
import { AIConversation, AIMessage, DailyBrief } from '../types';
import { sendAIMessage, AppContext } from '../lib/ai';
import { storage } from '../lib/storage';
import { useAuthStore } from './authStore';
import { useNotesStore } from './notesStore';
import { useTasksStore } from './tasksStore';
import { useProjectsStore } from './projectsStore';

interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  streamingText: string;
  isStreaming: boolean;
  dailyBrief: DailyBrief | null;
  appContext: AppContext;
  setDailyBrief: (brief: DailyBrief) => void;
  setAppContext: (ctx: Partial<AppContext>) => void;
  loadConversations: (userId: string) => Promise<void>;
  createConversation: () => string;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  clearStreaming: () => void;
}

const convKey = (userId: string) => `conversations:${userId}`;

// ─── Action parser ────────────────────────────────────────────────────────────

/**
 * Extracts the FIRST valid JSON object containing an "action" field from the reply.
 * Uses brace-counting to handle nested objects correctly.
 */
function extractActionJson(reply: string): { json: Record<string, unknown>; cleanReply: string } | null {
  for (let i = 0; i < reply.length; i++) {
    if (reply[i] !== '{') continue;
    let depth = 0, inString = false, escape = false, j = i;
    for (; j < reply.length; j++) {
      const ch = reply[j];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) break; }
    }
    if (depth !== 0) continue;
    const candidate = reply.slice(i, j + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && typeof parsed.action === 'string') {
        const before = reply.slice(0, i).trimEnd();
        const after = reply.slice(j + 1).trimStart();
        const cleanReply = [before, after].filter(Boolean).join('\n').trim();
        return { json: parsed, cleanReply };
      }
    } catch { /* skip */ }
  }
  return null;
}

/**
 * Remove any action JSON block from text (for history cleaning).
 * Uses the same brace-counting approach — regex can't handle nested JSON.
 */
function removeActionJson(text: string): string {
  const result = extractActionJson(text);
  return result ? (result.cleanReply || text) : text;
}

const CREATION_INTENT = /\b(create|add|make|new task|new note|new project|set up|schedule|remind me|build|start a)\b/i;

async function parseAndExecuteActions(reply: string, userId: string, userMessage: string): Promise<string> {
  // Guard: only parse if user message has explicit creation intent
  if (!CREATION_INTENT.test(userMessage)) {
    // Still strip any JSON the model accidentally included, but don't execute
    return removeActionJson(reply);
  }

  const result = extractActionJson(reply);
  if (!result) return reply;

  const { json: action, cleanReply } = result;

  try {
    if (action.action === 'create_note') {
      await useNotesStore.getState().addNote({
        id: `note_${Date.now()}`, user_id: userId,
        title: String(action.title ?? 'Untitled'),
        content: String(action.content ?? ''),
        tags: Array.isArray(action.tags) ? action.tags.map(String) : [],
        is_pinned: false, is_archived: false,
        attachments: [], linked_note_ids: [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    } else if (action.action === 'create_task') {
      await useTasksStore.getState().addTask({
        id: `task_${Date.now()}`, user_id: userId,
        title: String(action.title ?? 'New Task'),
        status: 'todo',
        priority: (['high', 'medium', 'low', 'none'].includes(String(action.priority))
          ? action.priority : 'none') as 'high' | 'medium' | 'low' | 'none',
        due_date: action.due_date && action.due_date !== 'null' ? String(action.due_date) : undefined,
        is_starred: false, subtasks: [], tags: [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    } else if (action.action === 'create_project') {
      const name = String(action.name ?? 'New Project');
      await useProjectsStore.getState().addProject({
        id: `proj_${Date.now()}`, user_id: userId,
        name,
        description: String(action.description ?? ''),
        color: String(action.color ?? '#00FF9D'),
        icon: name.charAt(0).toUpperCase(),
        status: 'active', task_ids: [], note_ids: [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    } else {
      // Unknown action — return original reply untouched
      return reply;
    }
  } catch {
    return removeActionJson(reply);
  }

  // Return the clean reply (text before/after JSON), or a fallback confirmation
  return cleanReply || 'Done!';
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAIStore = create<AIState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  isStreaming: false,
  streamingText: '',
  dailyBrief: null,
  appContext: {},

  setDailyBrief: (brief) => set({ dailyBrief: brief }),

  setAppContext: (ctx) => set((s) => ({ appContext: { ...s.appContext, ...ctx } })),

  loadConversations: async (userId) => {
    const saved = await storage.get<AIConversation[]>(convKey(userId));
    if (saved?.length) set({ conversations: saved });
  },

  createConversation: () => {
    const userId = useAuthStore.getState().user?.id ?? 'guest';
    const id = `conv_${Date.now()}`;
    const conv: AIConversation = {
      id, user_id: userId, title: 'New Chat', messages: [],
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const conversations = [conv, ...get().conversations];
    set({ conversations, activeConversationId: id });
    storage.set(convKey(userId), conversations);
    return id;
  },

  sendMessage: async (conversationId, content) => {
    const userId = useAuthStore.getState().user?.id ?? 'guest';

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // Ensure conversation exists — create inline if missing (handles timing race)
    let existing = get().conversations.find((c) => c.id === conversationId);
    if (!existing) {
      existing = {
        id: conversationId, user_id: userId,
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        messages: [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      set((s) => ({
        conversations: [existing!, ...s.conversations],
        activeConversationId: conversationId,
      }));
    }

    const historyMessages = [...existing.messages];

    // Optimistically add user message
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, userMsg], updated_at: new Date().toISOString() }
          : c
      ),
      isLoading: true,
      isStreaming: true,
      streamingText: '',
    }));

    // Auto-title from first message
    if (historyMessages.length === 0) {
      const title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? { ...c, title } : c
        ),
      }));
    }

    try {
      const rawReply = await sendAIMessage({
        messages: [...historyMessages, userMsg],
        appContext: get().appContext,
      });

      const reply = await parseAndExecuteActions(rawReply, userId, content);

      const assistantMsg: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: reply || '(no response)',
        created_at: new Date().toISOString(),
      };

      set((s) => {
        const conversations = s.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, assistantMsg], updated_at: new Date().toISOString() }
            : c
        );
        storage.set(convKey(userId), conversations);
        return { conversations, isLoading: false, isStreaming: false, streamingText: '' };
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const errorMsg: AIMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        created_at: new Date().toISOString(),
      };
      set((s) => {
        const conversations = s.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, errorMsg] } : c
        );
        return { conversations, isLoading: false, isStreaming: false, streamingText: '' };
      });
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  deleteConversation: (id) => {
    const userId = useAuthStore.getState().user?.id ?? 'guest';
    const conversations = get().conversations.filter((c) => c.id !== id);
    const activeId = get().activeConversationId === id
      ? (conversations[0]?.id ?? null)
      : get().activeConversationId;
    set({ conversations, activeConversationId: activeId });
    storage.set(convKey(userId), conversations);
  },

  clearStreaming: () => set({ isStreaming: false, streamingText: '' }),
}));
