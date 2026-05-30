import {
  defaultModelForProvider,
  isGroqBundledInBuild,
  loadAiUserConfig,
  saveAiUserConfig,
} from './aiConfig';
import { getUserApiKey } from './aiKey';
import { storage } from './storage';

const KEY_SOURCE = 'flowly_ai_key_source';
const BOOTSTRAP_DONE = 'flowly_ai_bootstrap_v1';

/**
 * Ensures new installs use bundled Groq when available.
 * Fixes users stuck on "custom" with no key saved.
 */
export async function ensureAiReadyOnLaunch(): Promise<void> {
  const hasBundled = isGroqBundledInBuild();
  if (!hasBundled) return;

  const [keySource, bootstrapped, customKey] = await Promise.all([
    storage.get<'bundled' | 'custom'>(KEY_SOURCE),
    storage.get<boolean>(BOOTSTRAP_DONE),
    getUserApiKey(),
  ]);

  const config = await loadAiUserConfig();

  const shouldUseBundled =
    keySource === null ||
    keySource === undefined ||
    (keySource === 'custom' && !customKey) ||
    (config.keySource === 'custom' && !customKey);

  if (shouldUseBundled) {
    await saveAiUserConfig({
      keySource: 'bundled',
      provider: 'groq',
      model: defaultModelForProvider('groq'),
    });
    if (!bootstrapped) {
      await storage.set(BOOTSTRAP_DONE, true);
    }
    return;
  }

  if (!bootstrapped && config.keySource === 'bundled') {
    await storage.set(BOOTSTRAP_DONE, true);
  }
}
