export type AiProviderId =
  | 'groq'
  | 'gemini'
  | 'anthropic'
  | 'openai'
  | 'qwen'
  | 'deepseek';

export interface AiProviderDef {
  id: AiProviderId;
  name: string;
  color: string;
  keyHint: string;
  docsUrl: string;
  supportsBundled: boolean;
  models: { id: string; label: string; hint?: string }[];
}

export const AI_PROVIDERS: AiProviderDef[] = [
  {
    id: 'groq',
    name: 'Groq',
    color: '#F55036',
    keyHint: 'gsk_…',
    docsUrl: 'https://console.groq.com',
    supportsBundled: true,
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', hint: 'Best overall' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', hint: 'Fast' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    color: '#4285F4',
    keyHint: 'AIza…',
    docsUrl: 'https://aistudio.google.com/apikey',
    supportsBundled: false,
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Recommended' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Claude',
    color: '#D97757',
    keyHint: 'sk-ant-…',
    docsUrl: 'https://console.anthropic.com',
    supportsBundled: false,
    models: [
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', hint: 'Fast' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    color: '#10A37F',
    keyHint: 'sk-…',
    docsUrl: 'https://platform.openai.com',
    supportsBundled: false,
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', hint: 'Fast & affordable' },
      { id: 'gpt-4o', label: 'GPT-4o' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    color: '#6366F1',
    keyHint: 'sk-…',
    docsUrl: 'https://dashscope.aliyun.com',
    supportsBundled: false,
    models: [
      { id: 'qwen-turbo', label: 'Qwen Turbo' },
      { id: 'qwen-plus', label: 'Qwen Plus' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#4D6BFE',
    keyHint: 'sk-…',
    docsUrl: 'https://platform.deepseek.com',
    supportsBundled: false,
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
    ],
  },
];

export function getProviderDef(id: AiProviderId): AiProviderDef {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0];
}

export function defaultModelForProvider(id: AiProviderId): string {
  return getProviderDef(id).models[0]?.id ?? 'llama-3.3-70b-versatile';
}

export function isValidModel(provider: AiProviderId, model: string): boolean {
  return getProviderDef(provider).models.some((m) => m.id === model);
}
