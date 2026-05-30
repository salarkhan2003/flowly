import Constants from 'expo-constants';

function isNativeFirebaseBuild(): boolean {
  return Constants.appOwnership !== 'expo';
}

function getCrashlytics() {
  if (!isNativeFirebaseBuild()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/crashlytics').default as () => {
      log: (message: string) => void;
      recordError: (error: Error) => void;
      setUserId: (id: string) => Promise<void>;
    };
  } catch {
    return null;
  }
}

function getAnalytics() {
  if (!isNativeFirebaseBuild()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/analytics').default as () => {
      logScreenView: (params: { screen_name: string }) => Promise<void>;
      setAnalyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
    };
  } catch {
    return null;
  }
}

export function logError(error: unknown, context?: string): void {
  const crashlyticsFactory = getCrashlytics();
  if (!crashlyticsFactory) {
    if (__DEV__ && context) console.warn('[crashlytics]', context, error);
    return;
  }
  try {
    const crashlytics = crashlyticsFactory();
    if (context) crashlytics.log(context);
    const err = error instanceof Error ? error : new Error(String(error));
    crashlytics.recordError(err);
  } catch (e) {
    if (__DEV__) console.warn('[crashlytics] recordError failed', e);
  }
}

export async function setUserId(id: string): Promise<void> {
  const crashlyticsFactory = getCrashlytics();
  if (!crashlyticsFactory) return;
  try {
    await crashlyticsFactory().setUserId(id);
  } catch {
    /* native module unavailable */
  }
}

export async function logScreen(screenName: string): Promise<void> {
  const analyticsFactory = getAnalytics();
  if (!analyticsFactory) return;
  try {
    await analyticsFactory().logScreenView({ screen_name: screenName });
  } catch {
    /* native module unavailable */
  }
}

export async function setFirebaseAnalyticsEnabled(enabled: boolean): Promise<void> {
  const analyticsFactory = getAnalytics();
  if (!analyticsFactory) return;
  try {
    await analyticsFactory().setAnalyticsCollectionEnabled(enabled);
  } catch {
    /* native module unavailable */
  }
}
