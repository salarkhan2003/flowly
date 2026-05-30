import type PostHog from 'posthog-react-native';
import type { PostHogOptions } from 'posthog-react-native';
import {
  applyAnalyticsConsent,
  getAnalyticsEnabled,
  registerPostHogConsentHandler,
} from './analyticsConsent';

export const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

export function getPostHogApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim() || undefined;
}

/** @deprecated Use `getPostHogOptions` — kept for setup docs naming. */
export function initPostHog(): PostHogOptions {
  return getPostHogOptions();
}

/** PostHog client options (session replay masks all text inputs and images). */
export function getPostHogOptions(): PostHogOptions {
  return {
    host: POSTHOG_HOST,
    enableSessionReplay: true,
    sessionReplayConfig: {
      maskAllTextInputs: true,
      maskAllImages: true,
    },
    captureAppLifecycleEvents: false,
  };
}

let clientRef: PostHog | null = null;

export function setPostHogClient(client: PostHog | null): void {
  clientRef = client;
  registerPostHogConsentHandler((enabled) => {
    if (!clientRef) return;
    if (enabled) clientRef.optIn();
    else clientRef.optOut();
  });
}

export function getPostHogClient(): PostHog | null {
  return clientRef;
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
): void {
  if (!getAnalyticsEnabled()) return;
  clientRef?.capture(event, props);
}

export function identifyUser(
  userId: string,
  traits?: Record<string, string | number | boolean>
): void {
  if (!getAnalyticsEnabled()) return;
  clientRef?.identify(userId, traits);
}

export { applyAnalyticsConsent as applyPostHogConsent };

export type ScreenAnalyticsName = 'Notes' | 'Tasks' | 'AI' | 'Profile';

export function trackScreenView(screen: ScreenAnalyticsName): void {
  trackEvent('screen_view', { screen });
}

export type AiMessageAction = 'create' | 'chat';

/** Local intent only — only `create` | `chat` is sent to PostHog, never the message text. */
export function inferAiMessageAction(message: string): AiMessageAction {
  const lower = message.toLowerCase();
  const wantsCreate = /\b(create|add|make|new|schedule|remind)\b/.test(lower);
  const entity = /\b(task|note|project|todo|reminder)\b/.test(lower);
  return wantsCreate && entity ? 'create' : 'chat';
}

export function trackAiMessageSent(action: AiMessageAction): void {
  trackEvent('ai_message_sent', { action });
}

export type PdfExportType = 'notes' | 'tasks' | 'projects';

export function pdfExportTypeFromCounts(
  notes: number,
  tasks: number,
  projects: number
): PdfExportType {
  if (tasks >= notes && tasks >= projects) return 'tasks';
  if (projects >= notes && projects >= tasks) return 'projects';
  return 'notes';
}
