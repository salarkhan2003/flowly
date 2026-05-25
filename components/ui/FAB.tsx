import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Shadows } from '../../constants/theme';
import { useQuickCaptureStore } from '../../stores/quickCaptureStore';

const NAV_HEIGHT = 68;
const NAV_MARGIN = 10;

export type FABMode = 'picker' | 'note' | 'task' | 'project';

const DIRECT_ROUTES: Record<Exclude<FABMode, 'picker'>, string> = {
  note: '/notes/new',
  task: '/tasks/new',
  project: '/projects/new',
};

interface FABProps {
  /** Home = show Note/Task/Project picker. Other screens = open that editor directly. */
  mode?: FABMode;
}

export function FAB({ mode = 'picker' }: FABProps) {
  const { C, mode: themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const showPicker = useQuickCaptureStore((s) => s.show);
  const scale = useRef(new Animated.Value(1)).current;
  const fabBottom = Math.max(insets.bottom, NAV_MARGIN) + NAV_HEIGHT + 12;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (mode === 'picker') {
      showPicker();
      return;
    }
    router.push(DIRECT_ROUTES[mode] as any);
  };

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          bottom: fabBottom,
          backgroundColor: C.accent,
          shadowColor: C.accent,
          transform: [{ scale }],
        },
        Shadows.glow,
      ]}
    >
      <TouchableOpacity style={styles.inner} onPress={handlePress} activeOpacity={0.88}>
        <Text style={[styles.icon, { color: themeMode === 'light' ? '#FFFFFF' : C.bg }]}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    zIndex: 40,
    elevation: 40,
  },
  inner: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 30, fontWeight: '300', lineHeight: 32, marginTop: -2 },
});
