import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUpdateStore } from '../stores/updateStore';
import { getColors, Radius, Spacing } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';

/** Blocks the app when version.json sets forceUpdate: true. */
export function ForceUpdateGate({ children }: { children: React.ReactNode }) {
  const available = useUpdateStore((s) => s.available);
  const mode = useThemeStore((s) => s.mode);
  const C = getColors(mode);

  const force =
    available?.forceUpdate === true &&
    available.latestVersionCode > useUpdateStore.getState().installedVersionCode;

  if (!force || !available) return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <Text style={[styles.title, { color: C.textPrimary }]}>Update required</Text>
      <Text style={[styles.body, { color: C.textSecondary }]}>
        Flowly {available.latestVersion} fixes a critical issue. Please install the latest APK to
        continue.
      </Text>
      {available.changelog ? (
        <Text style={[styles.changelog, { color: C.textMuted }]}>{available.changelog}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: C.accent }]}
        onPress={() => Linking.openURL(available.apkUrl)}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnText, { color: C.bg }]}>Download Flowly {available.latestVersion}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 22 },
  changelog: { fontSize: 13, lineHeight: 20 },
  btn: {
    marginTop: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700' },
});
