import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEY = 'flowly_ai_api_key';
const LEGACY_GROQ = 'groq_api_key';
const LEGACY_GROQ2 = 'flowly_groq_api_key';

let cachedUserKey: string | null | undefined;

type ExtraWithGroq = { groqApiKey?: string };

function readExtra(): ExtraWithGroq | undefined {
  const expoExtra = Constants.expoConfig?.extra as ExtraWithGroq | undefined;
  if (expoExtra?.groqApiKey?.trim()) return expoExtra;
  const legacyManifest = Constants.manifest as { extra?: ExtraWithGroq } | null;
  if (legacyManifest?.extra?.groqApiKey?.trim()) return legacyManifest.extra;
  return expoExtra;
}

/** Groq key from EAS build / .env (app default). */
export function getBundledGroqApiKey(): string {
  const fromExtra = readExtra()?.groqApiKey?.trim();
  if (fromExtra) return fromExtra;
  const fromEnv = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return '';
}

export function isGroqBundledInBuild(): boolean {
  return getBundledGroqApiKey().length > 0;
}

export function clearApiKeyCache(): void {
  cachedUserKey = undefined;
}

export async function getUserApiKey(): Promise<string | null> {
  if (cachedUserKey !== undefined) return cachedUserKey;

  try {
    let stored = await SecureStore.getItemAsync(SECURE_KEY);
    if (!stored?.trim()) stored = await SecureStore.getItemAsync(LEGACY_GROQ);
    if (!stored?.trim()) stored = await SecureStore.getItemAsync(LEGACY_GROQ2);
    cachedUserKey = stored?.trim() ?? null;
  } catch {
    cachedUserKey = null;
  }
  return cachedUserKey;
}

export async function saveUserApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await clearUserApiKey();
    return;
  }
  await SecureStore.setItemAsync(SECURE_KEY, trimmed);
  cachedUserKey = trimmed;
}

export async function clearUserApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEY);
    await SecureStore.deleteItemAsync(LEGACY_GROQ);
    await SecureStore.deleteItemAsync(LEGACY_GROQ2);
  } catch {
    /* ignore */
  }
  cachedUserKey = null;
}

/** @deprecated use getUserApiKey */
export const resolveGroqApiKey = getUserApiKey;
export const saveUserGroqApiKey = saveUserApiKey;
export const clearUserGroqApiKey = clearUserApiKey;
