import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  showBack?: boolean;
  rightAction?: { label: string; onPress: () => void };
}

export function ScreenHeader({ title, subtitle, badge, showBack, rightAction }: ScreenHeaderProps) {
  const { C } = useTheme();
  return (
    <View style={styles.wrap}>
      {showBack ? (
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={[styles.backTxt, { color: C.accent }]}>‹</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.left}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sub, { color: C.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {badge != null ? (
        <View style={[styles.badge, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
          <Text style={[styles.badgeTxt, { color: C.accent }]}>{badge}</Text>
        </View>
      ) : null}
      {rightAction ? (
        <TouchableOpacity
          style={[styles.action, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
          onPress={rightAction.onPress}
        >
          <Text style={[styles.actionTxt, { color: C.accent }]}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTxt: { fontSize: 28, fontWeight: '300', marginTop: -4, marginLeft: -2 },
  left: { flex: 1 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  sub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeTxt: { fontSize: 15, fontWeight: '800' },
  action: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionTxt: { fontSize: 12, fontWeight: '700' },
});
