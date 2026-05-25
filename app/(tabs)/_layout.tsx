import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColors } from '../../constants/theme';
import { useThemeStore } from '../../stores/themeStore';
import React, { useRef, useEffect } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ c }: { c: string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 8,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c, marginBottom: -1 }} />
      <View style={{ width: 14, height: 10, borderLeftWidth: 1.8, borderRightWidth: 1.8, borderBottomWidth: 1.8,
        borderColor: c, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
        alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 1 }}>
        <View style={{ width: 5, height: 6, borderWidth: 1.5, borderColor: c, borderRadius: 1 }} />
      </View>
    </View>
  );
}

function NotesIcon({ c }: { c: string }) {
  return (
    <View style={{ width: 16, height: 20, position: 'relative' }}>
      <View style={{ flex: 1, borderWidth: 1.5, borderColor: c, borderRadius: 3, padding: 3, gap: 3 }}>
        <View style={{ height: 1.5, backgroundColor: c, borderRadius: 1 }} />
        <View style={{ height: 1.5, backgroundColor: c, borderRadius: 1, width: '80%' }} />
        <View style={{ height: 1.5, backgroundColor: c, borderRadius: 1, width: '55%' }} />
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0, width: 6, height: 6,
        borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: c }} />
    </View>
  );
}

function TasksIcon({ c }: { c: string }) {
  return (
    <View style={{ gap: 4 }}>
      {[true, false, false].map((done, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.5, borderColor: c,
            backgroundColor: done ? c : 'transparent' }} />
          <View style={{ width: 16, height: 1.5, backgroundColor: c, borderRadius: 1, opacity: 1 - i * 0.3 }} />
        </View>
      ))}
    </View>
  );
}

function DoneIcon({ c }: { c: string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: c,
        alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 7, height: 4, borderLeftWidth: 1.8, borderBottomWidth: 1.8, borderColor: c,
          transform: [{ rotate: '-45deg' }, { translateY: -1 }] }} />
      </View>
    </View>
  );
}

function AIIcon({ c, active }: { c: string; active: boolean }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 20, height: 20, borderRadius: 10,
        borderWidth: 1.5, borderColor: c, opacity: 0.5 }} />
      <View style={{ width: 10, height: 10, borderWidth: 1.8, borderColor: c, transform: [{ rotate: '45deg' }] }} />
      {active && <View style={{ position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: c }} />}
    </View>
  );
}

function ProfileIcon({ c }: { c: string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', gap: 2 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: c }} />
      <View style={{ width: 17, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8,
        borderWidth: 1.5, borderColor: c, borderBottomWidth: 0 }} />
    </View>
  );
}

// ─── Animated tab icon — NO Pressable, navigation handled by Tabs ─────────────

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.1 : 1, useNativeDriver: true, tension: 200, friction: 12 }),
      Animated.timing(opacity, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: false }),
    ]).start();
  }, [focused]);

  const c = focused ? C.accent : C.textMuted;
  const isAI = name === 'ai';

  const labels: Record<string, string> = {
    home: 'Home', notes: 'Notes', tasks: 'Tasks', completed: 'Done', ai: 'AI', profile: 'Me',
  };

  const icons: Record<string, React.ReactNode> = {
    home: <HomeIcon c={c} />,
    notes: <NotesIcon c={c} />,
    tasks: <TasksIcon c={c} />,
    completed: <DoneIcon c={c} />,
    ai: <AIIcon c={c} active={focused} />,
    profile: <ProfileIcon c={c} />,
  };

  const pillBg = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,255,157,0)', isAI ? 'rgba(0,255,157,0.18)' : 'rgba(0,255,157,0.12)'],
  });
  const pillBorder = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,255,157,0)', 'rgba(0,255,157,0.35)'],
  });

  return (
    <Animated.View style={[st.item, { transform: [{ scale }] }]}>
      <Animated.View style={[StyleSheet.absoluteFill, st.pill, { backgroundColor: pillBg as any, borderColor: pillBorder as any }]} />
      {isAI && focused && (
        <View style={[st.aiRing, { borderColor: C.accent + '40', shadowColor: C.accent }]} />
      )}
      {icons[name]}
      <Text style={[st.label, { color: c }, focused && { fontWeight: '700' }]}>
        {labels[name]}
      </Text>
    </Animated.View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);
  const navBottom = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: navBottom,
          left: 14,
          right: 14,
          height: 66,
          backgroundColor: C.tabBar,
          borderRadius: 26,
          borderWidth: 1,
          borderColor: C.tabBarBorder,
          elevation: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, {
            borderRadius: 26,
            backgroundColor: C.tabBar,
            overflow: 'hidden',
          }]}>
            <View style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1 }} />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="home"      options={{ tabBarIcon: ({ focused }) => <TabIcon name="home"      focused={focused} /> }} />
      <Tabs.Screen name="notes"     options={{ tabBarIcon: ({ focused }) => <TabIcon name="notes"     focused={focused} /> }} />
      <Tabs.Screen name="tasks"     options={{ tabBarIcon: ({ focused }) => <TabIcon name="tasks"     focused={focused} /> }} />
      <Tabs.Screen name="completed" options={{ tabBarIcon: ({ focused }) => <TabIcon name="completed" focused={focused} /> }} />
      <Tabs.Screen name="ai"        options={{ tabBarIcon: ({ focused }) => <TabIcon name="ai"        focused={focused} /> }} />
      <Tabs.Screen name="profile"   options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile"   focused={focused} /> }} />
      <Tabs.Screen name="calendar"  options={{ href: null }} />
      <Tabs.Screen name="projects"  options={{ href: null }} />
      <Tabs.Screen name="search"    options={{ href: null }} />
    </Tabs>
  );
}

const st = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 50,
    position: 'relative',
  },
  pill: {
    borderRadius: 18,
    borderWidth: 1,
  },
  aiRing: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
