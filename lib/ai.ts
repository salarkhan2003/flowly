import { AIMessage } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function getApiKey(): string {
  return (process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '').trim();
}

export interface AppContext {
  tasks?: unknown;
  notes?: unknown;
  projects?: unknown;
  userName?: string;
  [key: string]: unknown;
}

interface SendAIMessageParams {
  messages: AIMessage[];
  appContext?: AppContext;
}

export type InlineAction = 'summarize' | 'rewrite' | 'expand' | 'extract_tasks' | 'auto_tag';

async function groqChat(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return 'AI is not configured. Please add your Groq API key.';

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024, temperature: 0.7 }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

const SYSTEM_PROMPT = `You are Flowly AI, a smart productivity assistant embedded in the Flowly app.
You help users manage tasks, notes, and projects.

IMPORTANT RULES:
- Only use a JSON action block when the user EXPLICITLY asks you to CREATE something new.
- For general conversation, questions, greetings, or anything else — respond in plain text only. No JSON.
- Never repeat a previous action. Each action block should only appear once per user request.
- If the user is just chatting, be friendly and conversational.

When the user explicitly asks to create something, respond with a JSON action block:

To create a task:
{"action":"create_task","title":"...","priority":"high|medium|low|none","due_date":"YYYY-MM-DD or null"}

To create a note:
{"action":"create_note","title":"...","content":"...","tags":["..."]}

To create a project:
{"action":"create_project","name":"...","description":"...","color":"#hexcolor"}

You may include a brief plain-text confirmation before or after the JSON block.`;

// Strip action JSON blocks from a message using brace-counting (regex can't handle nested JSON)
function stripActionJson(text: string): string {
  let result = text;
  // Keep stripping until no more action blocks found
  while (true) {
    let found = false;
    for (let i = 0; i < result.length; i++) {
      if (result[i] !== '{') continue;
      let depth = 0, inString = false, escape = false, j = i;
      for (; j < result.length; j++) {
        const ch = result[j];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) break; }
      }
      if (depth !== 0) continue;
      const candidate = result.slice(i, j + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === 'object' && typeof parsed.action === 'string') {
          result = (result.slice(0, i).trimEnd() + ' ' + result.slice(j + 1).trimStart()).trim();
          found = true;
          break;
        }
      } catch { /* skip */ }
    }
    if (!found) break;
  }
  return result || text;
}

export async function sendAIMessage({ messages, appContext }: SendAIMessageParams): Promise<string> {
  // Send context as plain text summary, NOT raw JSON — raw JSON confuses the model
  // into generating action blocks during normal conversation
  const lines: string[] = [];
  if (appContext?.userName) lines.push(`User's name: ${appContext.userName}`);
  if (Array.isArray(appContext?.tasks) && (appContext.tasks as unknown[]).length > 0) {
    const tasks = appContext.tasks as Array<{ title?: string; status?: string }>;
    lines.push(`User has ${tasks.length} tasks (e.g. ${tasks.slice(0, 3).map((t) => t.title).join(', ')})`);
  }
  if (Array.isArray(appContext?.notes) && (appContext.notes as unknown[]).length > 0) {
    const notes = appContext.notes as Array<{ title?: string }>;
    lines.push(`User has ${notes.length} notes (e.g. ${notes.slice(0, 3).map((n) => n.title).join(', ')})`);
  }
  if (Array.isArray(appContext?.projects) && (appContext.projects as unknown[]).length > 0) {
    const projects = appContext.projects as Array<{ name?: string }>;
    lines.push(`User has ${projects.length} projects (e.g. ${projects.slice(0, 3).map((p) => p.name).join(', ')})`);
  }

  const systemContent = lines.length
    ? `${SYSTEM_PROMPT}\n\nUser context:\n${lines.join('\n')}`
    : SYSTEM_PROMPT;

  return groqChat([
    { role: 'system', content: systemContent },
    // Strip any action JSON from assistant history so the model never repeats actions
    ...messages.map((m) => ({
      role: m.role,
      content: m.role === 'assistant' ? stripActionJson(m.content) : m.content,
    })),
  ]);
}

export async function generateDailyBrief(params: { tasks: string; notes: string; date: string }): Promise<string> {
  const prompt = `Today is ${params.date}. Tasks due: ${params.tasks || 'none'}. Recent notes: ${params.notes || 'none'}. Write a warm, motivating 1-2 sentence daily brief.`;
  return groqChat([
    { role: 'system', content: 'You are a friendly productivity assistant. Keep responses brief.' },
    { role: 'user', content: prompt },
  ]);
}

export async function runInlineAction(action: InlineAction, content: string): Promise<string> {
  const prompts: Record<InlineAction, string> = {
    summarize: `Summarize this note concisely in 2-3 sentences:\n\n${content}`,
    rewrite: `Rewrite this note to be clearer and more professional:\n\n${content}`,
    expand: `Expand this note with more detail and context:\n\n${content}`,
    extract_tasks: `Extract a bullet list of actionable tasks from this note:\n\n${content}`,
    auto_tag: `Suggest 3-5 relevant tags for this note (comma-separated, lowercase, no #):\n\n${content}`,
  };
  return groqChat([
    { role: 'system', content: 'You are a helpful writing assistant. Be concise and practical.' },
    { role: 'user', content: prompts[action] },
  ]);
}
