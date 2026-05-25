import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050A14' } }}>
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
