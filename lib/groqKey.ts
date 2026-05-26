import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEY = 'groq_api_key';
const LEGACY_KEY = 'flowly_groq_api_key';

let cachedUserKey: string | null | undefined;

function bundledKey(): string {
  const extra = Constants.expoConfig?.extra as { groqApiKey?: string } | undefined;
  return extra?.groqApiKey?.trim() ?? '';
}

export function getBundledGroqApiKey(): string {
  return bundledKey();
}

/** 1) User SecureStore override · 2) Bundled EAS key · 3) null */
export async function resolveGroqApiKey(): Promise<string | null> {
  if (cachedUserKey === undefined) {
    try {
      let stored = await SecureStore.getItemAsync(SECURE_KEY);
      if (!stored?.trim()) {
        stored = await SecureStore.getItemAsync(LEGACY_KEY);
      }
      cachedUserKey = stored?.trim() ?? null;
    } catch {
      cachedUserKey = null;
    }
  }

  if (cachedUserKey) return cachedUserKey;

  const builtIn = bundledKey();
  return builtIn || null;
}

export async function saveUserGroqApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await clearUserGroqApiKey();
    return;
  }
  await SecureStore.setItemAsync(SECURE_KEY, trimmed);
  try {
    await SecureStore.deleteItemAsync(LEGACY_KEY);
  } catch {
    /* ignore */
  }
  cachedUserKey = trimmed;
}

export async function clearUserGroqApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEY);
    await SecureStore.deleteItemAsync(LEGACY_KEY);
  } catch {
    /* ignore */
  }
  cachedUserKey = null;
}

export async function hasGroqApiKeyConfigured(): Promise<boolean> {
  const key = await resolveGroqApiKey();
  return !!key;
}
