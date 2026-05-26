import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEY = 'groq_api_key';
const LEGACY_KEY = 'flowly_groq_api_key';

let cachedUserKey: string | null | undefined;

type ExtraWithGroq = { groqApiKey?: string };

function readExtra(): ExtraWithGroq | undefined {
  const expoExtra = Constants.expoConfig?.extra as ExtraWithGroq | undefined;
  if (expoExtra?.groqApiKey?.trim()) return expoExtra;

  const legacyManifest = Constants.manifest as { extra?: ExtraWithGroq } | null;
  if (legacyManifest?.extra?.groqApiKey?.trim()) return legacyManifest.extra;

  return expoExtra;
}

/** Key baked in at EAS build (app.config extra + Metro EXPO_PUBLIC_* inlining). */
function bundledKey(): string {
  const fromExtra = readExtra()?.groqApiKey?.trim();
  if (fromExtra) return fromExtra;

  const fromEnv = process.env.EXPO_PUBLIC_GROQ_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  return '';
}

export function getBundledGroqApiKey(): string {
  return bundledKey();
}

export function isGroqBundledInBuild(): boolean {
  return bundledKey().length > 0;
}

/** 1) User SecureStore override · 2) Bundled EAS/dev key · 3) null */
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

export async function getGroqKeyStatus(): Promise<{
  ready: boolean;
  source: 'user' | 'bundled' | 'none';
}> {
  if (cachedUserKey === undefined) {
    await resolveGroqApiKey();
  }
  if (cachedUserKey) return { ready: true, source: 'user' };
  if (bundledKey()) return { ready: true, source: 'bundled' };
  return { ready: false, source: 'none' };
}
