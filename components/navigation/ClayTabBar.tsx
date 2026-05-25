import React, { useEffect, useRef } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getColors, Radius, Shadows } from '../../constants/theme';
import { useThemeStore } from '../../stores/themeStore';

/** Exactly 5 tabs — all other routes are stack-only (Home hub links). */
const MAIN_TAB_NAMES = ['home', 'notes', 'tasks', 'ai', 'profile'] as const;

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  notes: 'Notes',
  tasks: 'Tasks',
  ai: 'AI',
  profile: 'Me',
};

function HomeIcon({ c, size = 20 }: { c: string; size?: number }) {
  const s = size / 20;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 10 * s,
          borderRightWidth: 10 * s,
          borderBottomWidth: 8 * s,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: c,
        }}
      />
      <View
        style={{
          width: 14 * s,
          height: 10 * s,
          borderWidth: 1.6 * s,
          borderColor: c,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          marginTop: -1,
        }}
      />
    </View>
  );
}

function NotesIcon({ c, size = 18 }: { c: string; size?: number }) {
  return (
    <View style={{ width: size * 0.8, height: size }}>
      <View
        style={{
          flex: 1,
          borderWidth: 1.5,
          borderColor: c,
          borderRadius: 3,
          padding: 3,
          gap: 2,
        }}
      >
        <View style={{ height: 1.5, backgroundColor: c, borderRadius: 1 }} />
        <View style={{ height: 1.5, backgroundColor: c, width: '70%' }} />
      </View>
    </View>
  );
}

function TasksIcon({ c }: { c: string }) {
  return (
    <View style={{ gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.4, borderColor: c }} />
          <View style={{ width: 12, height: 1.5, backgroundColor: c, opacity: 1 - i * 0.25 }} />
        </View>
      ))}
    </View>
  );
}

function AIIcon({ c }: { c: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 1.4,
          borderColor: c,
          opacity: 0.45,
        }}
      />
      <View
        style={{
          width: 9,
          height: 9,
          borderWidth: 1.8,
          borderColor: c,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function ProfileIcon({ c }: { c: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: c }} />
      <View
        style={{
          width: 16,
          height: 7,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderWidth: 1.5,
          borderColor: c,
          borderBottomWidth: 0,
        }}
      />
    </View>
  );
}

const TAB_ICONS: Record<string, (c: string) => React.ReactNode> = {
  home: (c) => <HomeIcon c={c} />,
  notes: (c) => <NotesIcon c={c} />,
  tasks: (c) => <TasksIcon c={c} />,
  ai: (c) => <AIIcon c={c} />,
  profile: (c) => <ProfileIcon c={c} />,
};

const ICON_SIZE = 38;
const BAR_HEIGHT = 68;

function TabSlot({
  routeName,
  focused,
  onPress,
  onLayout,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const iconColor = focused ? (mode === 'light' ? '#FFFFFF' : C.bg) : C.textMuted;
  const icon = TAB_ICONS[routeName]?.(iconColor);
  const bubbleScale = scale.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Pressable style={styles.slot} onPress={onPress} onLayout={onLayout}>
      <View style={styles.iconArea}>
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: focused ? C.accent : 'transparent',
              borderColor: focused ? C.accent : C.tabBarBorder,
              borderWidth: focused ? 0 : 1.5,
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          {focused ? <View style={[styles.iconShine, { backgroundColor: C.clayHighlight }]} /> : null}
          {icon}
        </Animated.View>
      </View>
      <Text
        style={[
          styles.label,
          { color: focused ? C.accent : C.textMuted },
          focused && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {TAB_LABELS[routeName] ?? routeName}
      </Text>
    </Pressable>
  );
}

export function ClayTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);
  const bottom = Math.max(insets.bottom, 10);

  const visibleRoutes = state.routes.filter((route) =>
    MAIN_TAB_NAMES.includes(route.name as (typeof MAIN_TAB_NAMES)[number])
  );

  const currentKey = state.routes[state.index]?.key;
  const orderedRoutes = MAIN_TAB_NAMES.map((name) =>
    visibleRoutes.find((r) => r.name === name)
  ).filter(Boolean) as typeof visibleRoutes;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottom }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          {
            backgroundColor: C.tabBar,
            borderColor: C.tabBarBorder,
          },
        ]}
      >
        <View style={[styles.topShine, { backgroundColor: C.clayHighlight }]} />

        <View style={styles.row}>
          {orderedRoutes.map((route) => {
            const focused = route.key === currentKey;
            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabSlot
                key={route.key}
                routeName={route.name}
                focused={focused}
                onPress={onPress}
                onLayout={() => {}}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    zIndex: 50,
    elevation: 50,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.clay,
  },
  topShine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    zIndex: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    zIndex: 3,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconArea: {
    height: ICON_SIZE,
    width: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconShine: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 6,
    borderRadius: 4,
    opacity: 0.55,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '800',
  },
});
