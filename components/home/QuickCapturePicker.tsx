import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ClayCard } from '../ui/ClayCard';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Shadows, Spacing } from '../../constants/theme';
import { useQuickCaptureStore } from '../../stores/quickCaptureStore';

const OPTIONS = [
  {
    key: 'note',
    label: 'Note',
    sub: 'Capture ideas & markdown',
    colorKey: 'pastelSky' as const,
    letter: 'N',
    route: '/notes/new',
  },
  {
    key: 'task',
    label: 'Task',
    sub: 'Add something to do',
    colorKey: 'pastelMint' as const,
    letter: 'T',
    route: '/tasks/new',
  },
  {
    key: 'project',
    label: 'Project',
    sub: 'Organize workstreams',
    colorKey: 'pastelLavender' as const,
    letter: 'P',
    route: '/projects/new',
  },
];

export function QuickCapturePicker() {
  const visible = useQuickCaptureStore((s) => s.visible);
  const hide = useQuickCaptureStore((s) => s.hide);
  const { C, mode } = useTheme();
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.88);
      opacity.setValue(0);
    }
  }, [visible]);

  const pick = (route: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    hide();
    setTimeout(() => router.push(route as any), 120);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={hide}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={[styles.backdrop, { backgroundColor: C.overlay }]} onPress={hide} />
        <Animated.View style={[styles.sheet, { transform: [{ scale }] }]}>
          <ClayCard glowing style={styles.card} variant={mode === 'light' ? 'default' : 'deep'}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: C.textPrimary }]}>Create new</Text>
            <Text style={[styles.sub, { color: C.textSecondary }]}>
              What would you like to add?
            </Text>

            <View style={styles.grid}>
              {OPTIONS.map((opt) => {
                const color = C[opt.colorKey];
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.option,
                      {
                        backgroundColor: C.bgCardAlt,
                        borderColor: color + (mode === 'light' ? '80' : '45'),
                        shadowColor: color,
                      },
                      Shadows.clayInset,
                    ]}
                    onPress={() => pick(opt.route)}
                    activeOpacity={0.82}
                  >
                    <View style={[styles.optShine, { backgroundColor: C.clayHighlight }]} />
                    <View
                      style={[
                        styles.optIcon,
                        {
                          backgroundColor: color + (mode === 'light' ? '55' : '30'),
                          borderColor: color,
                        },
                      ]}
                    >
                      <Text style={[styles.optLetter, { color: C.textPrimary }]}>{opt.letter}</Text>
                    </View>
                    <View style={styles.optText}>
                      <Text style={[styles.optLabel, { color: C.textPrimary }]}>{opt.label}</Text>
                      <Text style={[styles.optSub, { color: C.textMuted }]}>{opt.sub}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={hide} style={[styles.cancel, { borderColor: C.border }]}>
              <Text style={[styles.cancelTxt, { color: C.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </ClayCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: { padding: Spacing.lg, paddingTop: Spacing.md },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(148,163,184,0.45)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  sub: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: Spacing.lg },
  grid: { gap: Spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  optShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  optIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetter: { fontSize: 20, fontWeight: '800' },
  optText: { flex: 1, gap: 2 },
  optLabel: { fontSize: 17, fontWeight: '700' },
  optSub: { fontSize: 12 },
  cancel: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelTxt: { fontSize: 14, fontWeight: '600' },
});
