/**
 * Expo dev tooling may call activateKeepAwake before the native module is ready on Android.
 * Pre-activating (or catching failure) prevents an uncaught promise rejection red screen.
 */
export async function stabilizeDevKeepAwake(): Promise<void> {
  if (!__DEV__) return;
  try {
    const { activateKeepAwakeAsync, deactivateKeepAwake } = await import('expo-keep-awake');
    deactivateKeepAwake();
    await activateKeepAwakeAsync('flowly-dev').catch(() => {});
  } catch {
    /* expo-keep-awake unavailable in this build — safe to ignore */
  }
}
