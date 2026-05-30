import { storage } from './storage';
import {
  type AiProviderId,
  defaultModelForProvider,
  getProviderDef,
  isValidModel,
} from './aiProviders';
import {
  clearApiKeyCache,
  clearUserApiKey,
  getBundledGroqApiKey,
  getUserApiKey,
  isGroqBundledInBuild,
  saveUserApiKey,
} from './aiKey';

export type { AiProviderId } from './aiProviders';
export { AI_PROVIDERS, getProviderDef, defaultModelForProvider, isValidModel } from './aiProviders';
export { getUserApiKey, saveUserApiKey, clearUserApiKey, getBundledGroqApiKey, isGroqBundledInBuild } from './aiKey';

export type AiKeySource = 'bundled' | 'custom';

const KEY_SOURCE = 'flowly_ai_key_source';
const PROVIDER_KEY = 'flowly_ai_provider';
const MODEL_KEY = 'flowly_ai_model';

export interface AiUserConfig {
  keySource: AiKeySource;
  provider: AiProviderId;
  model: string;
}

export interface AiCredentials {
  provider: AiProviderId;
  apiKey: string;
  model: string;
  source: AiKeySource;
}

export async function loadAiUserConfig(): Promise<AiUserConfig> {
  const [keySource, provider, model] = await Promise.all([
    storage.get<AiKeySource>(KEY_SOURCE),
    storage.get<AiProviderId>(PROVIDER_KEY),
    storage.get<string>(MODEL_KEY),
  ]);

  const hasBundled = isGroqBundledInBuild();
  const customKey = await getUserApiKey();

  let resolvedSource: AiKeySource =
    keySource === 'custom' || keySource === 'bundled'
      ? keySource
      : hasBundled
        ? 'bundled'
        : 'custom';

  if (resolvedSource === 'custom' && !customKey && hasBundled) {
    resolvedSource = 'bundled';
  }

  const resolvedProvider: AiProviderId =
    resolvedSource === 'bundled'
      ? 'groq'
      : provider && getProviderDef(provider)
        ? provider
        : 'groq';

  const resolvedModel =
    model && isValidModel(resolvedProvider, model)
      ? model
      : defaultModelForProvider(resolvedProvider);

  return {
    keySource: resolvedSource,
    provider: resolvedProvider,
    model: resolvedModel,
  };
}

export async function saveAiUserConfig(config: AiUserConfig): Promise<void> {
  await storage.set(KEY_SOURCE, config.keySource);
  await storage.set(PROVIDER_KEY, config.provider);
  await storage.set(MODEL_KEY, config.model);
  clearApiKeyCache();
}

export async function resolveAiCredentials(): Promise<AiCredentials | null> {
  const config = await loadAiUserConfig();

  if (config.keySource === 'bundled') {
    const key = getBundledGroqApiKey();
    if (!key) return null;
    const model = isValidModel('groq', config.model)
      ? config.model
      : defaultModelForProvider('groq');
    return {
      provider: 'groq',
      apiKey: key,
      model,
      source: 'bundled',
    };
  }

  const key = await getUserApiKey();
  if (!key) return null;

  return {
    provider: config.provider,
    apiKey: key,
    model: config.model,
    source: 'custom',
  };
}

export async function getAiStatus(): Promise<{
  ready: boolean;
  keySource: AiKeySource;
  provider: AiProviderId;
  providerName: string;
  model: string;
  hasBundled: boolean;
  hasCustomKey: boolean;
}> {
  const config = await loadAiUserConfig();
  const hasBundled = isGroqBundledInBuild();
  const customKey = await getUserApiKey();
  const def = getProviderDef(config.provider);

  let ready = false;
  if (config.keySource === 'bundled') {
    ready = hasBundled;
  } else {
    ready = !!customKey;
  }

  return {
    ready,
    keySource: config.keySource,
    provider: config.provider,
    providerName: def.name,
    model: config.model,
    hasBundled,
    hasCustomKey: !!customKey,
  };
}

export { clearApiKeyCache };
