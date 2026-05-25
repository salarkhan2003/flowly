import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface FABProps {
  onPress: () => void;
}

const ACTIONS = [
  { icon: '📝', label: 'Note',    route: '/notes/new' },
  { icon: '✅', label: 'Task',    route: '/tasks/new' },
  { icon: '🤖', label: 'AI',      route: '/(tabs)/ai' },
  { icon: '📁', label: 'Project', route: '/projects/new' },
];

// Floating navbar height: 66 + bottom inset + 8 margin + 8 gap
const NAV_HEIGHT = 66;
const NAV_MARGIN = 8;

export function FAB({ onPress }: FABProps) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);
  const actionAnims = useRef(ACTIONS.map(() => new Animated.Value(0))).current;

  // FAB sits just above the floating navbar
  const fabBottom = Math.max(insets.bottom, NAV_MARGIN) + NAV_HEIGHT + 14;

  const handlePress = () => {
    if (expanded) { collapse(); return; }
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setExpanded(true);
    Animated.parallel([
      Animated.spring(rotation, { toValue: 1, useNativeDriver: true, speed: 30 }),
      ...actionAnims.map((a, i) =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, delay: i * 40, speed: 28, bounciness: 10 })
      ),
    ]).start();
  };

  const collapse = () => {
    setExpanded(false);
    Animated.parallel([
      Animated.spring(rotation, { toValue: 0, useNativeDriver: true, speed: 40 }),
      ...actionAnims.map((a) =>
        Animated.spring(a, { toValue: 0, useNativeDriver: true, speed: 40 })
      ),
    ]).start();
  };

  const rotateStr = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <>
      {expanded && <Pressable style={StyleSheet.absoluteFillObject} onPress={collapse} />}

      {expanded && ACTIONS.map((action, i) => {
        const offsetY = actionAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -(68 + i * 60)] });
        return (
          <Animated.View key={action.label} style={[s.actionWrap, { bottom: fabBottom, right: 20, transform: [{ translateY: offsetY }], opacity: actionAnims[i] }]}>
            <View style={s.actionRow}>
              <View style={[s.actionLabel, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <Text style={[s.actionLabelTxt, { color: C.textPrimary }]}>{action.label}</Text>
              </View>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}
                onPress={() => { collapse(); router.push(action.route as any); }}
                activeOpacity={0.8}
              >
                <Text style={s.actionIcon}>{action.icon}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}

      <Animated.View style={[s.fab, { bottom: fabBottom, backgroundColor: C.accent, shadowColor: C.accent, transform: [{ scale }] }]}>
        <TouchableOpacity
          style={s.inner}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={350}
          activeOpacity={0.85}
        >
          <Animated.Text style={[s.icon, { color: C.bg, transform: [{ rotate: rotateStr }] }]}>+</Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
    zIndex: 100,
  },
  inner: { width: '100%', height: '100%', borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28, fontWeight: '300', lineHeight: 32 },
  actionWrap: { position: 'absolute', zIndex: 99 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionLabel: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  actionLabelTxt: { fontSize: 13, fontWeight: '600' },
  actionBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    shadowColor: '#00FF9D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  actionIcon: { fontSize: 18 },
});
