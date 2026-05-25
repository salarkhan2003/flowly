import { Stack } from 'expo-router';
import { useThemeStore } from '../../stores/themeStore';
import { getColors } from '../../constants/theme';

export default function FormsLayout() {
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="join-team" />
      <Stack.Screen name="feedback" />
    </Stack>
  );
}
