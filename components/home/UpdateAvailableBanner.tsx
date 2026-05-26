import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { isUpdateAvailable } from '../../lib/updates';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUpdateStore } from '../../stores/updateStore';

export function UpdateAvailableBanner() {
  const { C, mode } = useTheme();
  const available = useUpdateStore((s) => s.available);
  const openUpdateDownload = useUpdateStore((s) => s.openUpdateDownload);
  const showUpdateBanner = usePrefsStore((s) => s.showUpdateBanner);
  const snoozeUpdateBanner24h = usePrefsStore((s) => s.snoozeUpdateBanner24h);

  if (!available || !showUpdateBanner || !isUpdateAvailable(available)) return null;

  const version = available.latestVersion;

  const handleDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await openUpdateDownload();
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: C.pastelPeach + (mode === 'light' ? '99' : '44'),
          borderColor: C.warning + '55',
        },
      ]}
    >
      <TouchableOpacity style={styles.mainTap} onPress={handleDownload} activeOpacity={0.9}>
        <View style={[styles.badge, { backgroundColor: C.warning }]}>
          <Text style={[styles.badgeTxt, { color: C.bg }]}>NEW</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Update available</Text>
          <Text style={[styles.sub, { color: C.textSecondary }]} numberOfLines={2}>
            v{version} ready — tap to download APK
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.dlBtn, { backgroundColor: C.accent }]}
          onPress={handleDownload}
          activeOpacity={0.88}
        >
          <Text style={[styles.dlTxt, { color: C.bg }]}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => snoozeUpdateBanner24h(version)} hitSlop={10}>
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
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  mainTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 11, lineHeight: 15 },
  actions: { alignItems: 'center', gap: 6 },
  dlBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  dlTxt: { fontSize: 11, fontWeight: '800' },
  later: { fontSize: 10, fontWeight: '600' },
});
