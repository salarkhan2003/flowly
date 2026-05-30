/** Breaks require cycle between posthog.ts and prefsStore.ts */

let analyticsEnabled = true;
let onPostHogConsentChange: ((enabled: boolean) => void) | null = null;

export function getAnalyticsEnabled(): boolean {
  return analyticsEnabled;
}

export function setAnalyticsEnabledFlag(enabled: boolean): void {
  analyticsEnabled = enabled;
}

export function registerPostHogConsentHandler(handler: (enabled: boolean) => void): void {
  onPostHogConsentChange = handler;
}

export function applyAnalyticsConsent(enabled: boolean): void {
  analyticsEnabled = enabled;
  onPostHogConsentChange?.(enabled);
}
