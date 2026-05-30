import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { logScreen } from '../lib/firebase';
import { trackScreenView, type ScreenAnalyticsName } from '../lib/posthog';

export function useScreenAnalytics(screen: ScreenAnalyticsName): void {
  useFocusEffect(
    useCallback(() => {
      trackScreenView(screen);
      logScreen(screen).catch(() => {});
    }, [screen])
  );
}
