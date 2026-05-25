import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUpdateStore } from '../../stores/updateStore';

export function UpdateAvailableBanner() {
  const { C, mode } = useTheme();
  const available = useUpdateStore((s) => s.available);
  const openUpdateDownload = useUpdateStore((s) => s.openUpdateDownload);
  const showUpdateBanner = usePrefsStore((s) => s.showUpdateBanner);
  const refreshUpdateBannerVisibility = usePrefsStore((s) => s.refreshUpdateBannerVisibility);
  const snoozeUpdateBanner24h = usePrefsStore((s) => s.snoozeUpdateBanner24h);

  useEffect(() => {
    refreshUpdateBannerVisibility(available?.latestVersion ?? null);
  }, [available?.latestVersion, refreshUpdateBannerVisibility]);

  if (!available || !showUpdateBanner) return null;

  const version = available.latestVersion;

  const goToProfileUpdates = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(tabs)/profile', params: { section: 'updates' } });
  };

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
      <TouchableOpacity style={styles.mainTap} onPress={goToProfileUpdates} activeOpacity={0.9}>
        <View style={[styles.badge, { backgroundColor: C.warning }]}>
          <Text style={[styles.badgeTxt, { color: C.bg }]}>↑</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Update available</Text>
          <Text style={[styles.sub, { color: C.textSecondary }]} numberOfLines={2}>
            v{version} on GitHub — tap for App & Updates
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
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 14, fontWeight: '800' },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 11, lineHeight: 15 },
  actions: { alignItems: 'center', gap: 6 },
  dlBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  dlTxt: { fontSize: 11, fontWeight: '800' },
  later: { fontSize: 10, fontWeight: '600' },
});
