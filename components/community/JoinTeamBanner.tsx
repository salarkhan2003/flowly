import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { usePrefsStore } from '../../stores/prefsStore';

/** Compact banner — shown at most once per 24h after user taps Ignore. */
export function JoinTeamBanner() {
  const { C } = useTheme();
  const show = usePrefsStore((s) => s.showTeamBanner);
  const snoozeTeamBanner24h = usePrefsStore((s) => s.snoozeTeamBanner24h);

  if (!show) return null;

  return (
    <View style={[styles.banner, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: C.accent }]}>Join the Flowly team</Text>
        <Text style={[styles.sub, { color: C.textSecondary }]}>
          Future updates & early access — optional
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.joinBtn, { backgroundColor: C.accent }]}
          onPress={() => router.push('/forms/join-team')}
          activeOpacity={0.88}
        >
          <Text style={[styles.joinTxt, { color: C.bg }]}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={snoozeTeamBanner24h} hitSlop={12}>
          <Text style={[styles.ignore, { color: C.textMuted }]}>Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 11, lineHeight: 15 },
  actions: { alignItems: 'center', gap: 6 },
  joinBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  joinTxt: { fontSize: 12, fontWeight: '800' },
  ignore: { fontSize: 10, fontWeight: '600' },
});
