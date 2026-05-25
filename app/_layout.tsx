import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { requestNotificationPermissions } from '../lib/notifications';
import { ForceUpdateGate } from '../components/ForceUpdateGate';
import { useUpdateStore } from '../stores/updateStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const initTheme = useThemeStore((s) => s.init);
  const checkForUpdates = useUpdateStore((s) => s.checkForUpdates);
  const refreshInstalledVersion = useUpdateStore((s) => s.refreshInstalledVersion);

  useEffect(() => {
    Promise.all([init(), initTheme()]).then(() => {
      refreshInstalledVersion();
      SplashScreen.hideAsync();
      checkForUpdates().catch(() => {});
    });
    requestNotificationPermissions().catch(() => {});
  }, []);

  const mode = useThemeStore((s) => s.mode);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ForceUpdateGate>
        <StatusBar style={mode === 'light' ? 'dark' : 'light'} backgroundColor={mode === 'light' ? '#F0F4FF' : '#050A14'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050A14' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notes/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="tasks/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="projects/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="modals/quick-capture" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/ai-command" options={{ presentation: 'modal' }} />
        </Stack>
        </ForceUpdateGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
