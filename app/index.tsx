import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const { isLoading, isOnboarded } = useAuthStore();
  const { C } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  // If not onboarded yet, show the welcome slides
  if (!isOnboarded) return <Redirect href="/(auth)/onboarding" />;

  // Guest is auto-created in init(), always go straight to home
  return <Redirect href="/(tabs)/home" />;
}
