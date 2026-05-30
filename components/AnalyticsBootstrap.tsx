import { useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-react-native';
import { applyAnalyticsConsent } from '../lib/analyticsConsent';
import { identifyUser, setPostHogClient, trackEvent } from '../lib/posthog';
import { setUserId as setCrashlyticsUserId } from '../lib/firebase';
import { usePrefsStore } from '../stores/prefsStore';
import { useAuthStore } from '../stores/authStore';

/** Registers PostHog client, applies consent, and fires app_open once per session. */
export function AnalyticsBootstrap() {
  const posthog = usePostHog();
  const analyticsEnabled = usePrefsStore((s) => s.analyticsEnabled);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setPostHogClient(posthog ?? null);
    return () => setPostHogClient(null);
  }, [posthog]);

  useEffect(() => {
    applyAnalyticsConsent(analyticsEnabled);
  }, [posthog, analyticsEnabled]);

  const appOpenSent = useRef(false);
  useEffect(() => {
    if (!posthog || !analyticsEnabled || appOpenSent.current) return;
    appOpenSent.current = true;
    trackEvent('app_open');
  }, [posthog, analyticsEnabled]);

  useEffect(() => {
    if (!user?.id) return;
    identifyUser(user.id, { app: 'flowly' });
    setCrashlyticsUserId(user.id).catch(() => {});
  }, [user?.id, analyticsEnabled]);

  return null;
}
