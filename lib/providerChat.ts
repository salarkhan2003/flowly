import type { AiProviderId } from './aiProviders';
import { getProviderDef } from './aiProviders';

export type ChatMessage = { role: string; content: string };

async function readError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => '');
  try {
    const j = JSON.parse(raw) as { error?: { message?: string }; message?: string };
    return j.error?.message ?? j.message ?? raw.slice(0, 180);
  } catch {
    return raw.slice(0, 180) || res.statusText;
  }
}

async function openAiCompatibleChat(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const detail = await readError(res);
    if (res.status === 401) return { ok: false, error: `Invalid API key (${res.status}). Check Profile → AI setup.` };
    return { ok: false, error: `${res.status}: ${detail}` };
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true, text: data.choices?.[0]?.message?.content ?? '' };
}

async function geminiChat(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const turns = messages.filter((m) => m.role !== 'system');
  const contents = turns.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const detail = await readError(res);
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid Gemini API key. Get one at aistudio.google.com' };
    }
    return { ok: false, error: `Gemini ${res.status}: ${detail}` };
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  return { ok: true, text };
}

async function anthropicChat(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const system = messages.find((m) => m.role === 'system')?.content;
  const turns = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: system || undefined,
      messages: turns,
    }),
  });

  if (!res.ok) {
    const detail = await readError(res);
    if (res.status === 401) return { ok: false, error: 'Invalid Claude API key. Check console.anthropic.com' };
    return { ok: false, error: `Claude ${res.status}: ${detail}` };
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  return { ok: true, text };
}

export async function providerChat(
  provider: AiProviderId,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const key = apiKey.trim();
  if (!key) return { ok: false, error: 'No API key configured.' };

  try {
    switch (provider) {
      case 'groq':
        return openAiCompatibleChat(
          'https://api.groq.com/openai/v1/chat/completions',
          key,
          model,
          messages
        );
      case 'openai':
        return openAiCompatibleChat(
          'https://api.openai.com/v1/chat/completions',
          key,
          model,
          messages
        );
      case 'qwen':
        return openAiCompatibleChat(
          'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
          key,
          model,
          messages
        );
      case 'deepseek':
        return openAiCompatibleChat(
          'https://api.deepseek.com/chat/completions',
          key,
          model,
          messages
        );
      case 'gemini':
        return geminiChat(key, model, messages);
      case 'anthropic':
        return anthropicChat(key, model, messages);
      default:
        return { ok: false, error: `Unknown provider: ${provider}` };
    }
  } catch {
    return {
      ok: false,
      error: `Could not reach ${getProviderDef(provider).name}. Check internet and API settings.`,
    };
  }
}

export async function testProviderConnection(
  provider: AiProviderId,
  apiKey: string,
  model: string
): Promise<{ ok: boolean; message: string }> {
  const result = await providerChat(provider, apiKey, model, [
    { role: 'user', content: 'Reply with exactly: OK' },
  ]);
  if (result.ok) {
    return { ok: true, message: `${getProviderDef(provider).name} connected · ${model}` };
  }
  return { ok: false, message: result.error };
}
