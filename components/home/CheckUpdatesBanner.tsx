import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUpdateStore } from '../../stores/updateStore';

/** Daily home reminder to check for updates (when already on latest version). */
export function CheckUpdatesBanner() {
  const { C } = useTheme();
  const isChecking = useUpdateStore((s) => s.isChecking);
  const checkForUpdates = useUpdateStore((s) => s.checkForUpdates);
  const policy = useAuthStore((s) => s.user?.settings?.update_check_policy ?? 'notify');
  const showCheckUpdatesBanner = usePrefsStore((s) => s.showCheckUpdatesBanner);
  const snoozeCheckUpdatesBanner24h = usePrefsStore((s) => s.snoozeCheckUpdatesBanner24h);

  if (policy === 'never' || !showCheckUpdatesBanner) return null;

  const handleCheck = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await checkForUpdates({ force: true, showAlert: false });
    router.push({ pathname: '/(tabs)/profile', params: { section: 'updates' } });
    await snoozeCheckUpdatesBanner24h();
  };

  const handleLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    snoozeCheckUpdatesBanner24h();
  };

  return (
    <View style={[styles.banner, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
      <View style={[styles.badge, { backgroundColor: C.accent }]}>
        {isChecking ? (
          <ActivityIndicator size="small" color={C.bg} />
        ) : (
          <Text style={[styles.badgeTxt, { color: C.bg }]}>↻</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: C.accent }]}>Check for updates</Text>
        <Text style={[styles.sub, { color: C.textSecondary }]}>
          See if a new Flowly APK is on GitHub
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.checkBtn, { backgroundColor: C.accent }]}
          onPress={handleCheck}
          disabled={isChecking}
          activeOpacity={0.88}
        >
          <Text style={[styles.checkTxt, { color: C.bg }]}>{isChecking ? '…' : 'Check'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLater} hitSlop={10}>
          <Text style={[styles.later, { color: C.textMuted }]}>Later</Text>
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
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 15, fontWeight: '800' },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 11, lineHeight: 15 },
  actions: { alignItems: 'center', gap: 6 },
  checkBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, minWidth: 52, alignItems: 'center' },
  checkTxt: { fontSize: 12, fontWeight: '800' },
  later: { fontSize: 10, fontWeight: '600' },
});
