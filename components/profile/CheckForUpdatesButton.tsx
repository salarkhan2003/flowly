import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius, Shadows } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useUpdateStore } from '../../stores/updateStore';

export function CheckForUpdatesButton() {
  const { C } = useTheme();
  const isChecking = useUpdateStore((s) => s.isChecking);
  const available = useUpdateStore((s) => s.available);
  const installedVersion = useUpdateStore((s) => s.installedVersion);
  const checkForUpdates = useUpdateStore((s) => s.checkForUpdates);
  const openUpdateDownload = useUpdateStore((s) => s.openUpdateDownload);

  const onPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (available) {
      await openUpdateDownload();
      return;
    }
    await checkForUpdates({ force: true, showAlert: true });
  };

  return (
    <TouchableOpacity
      style={[
        styles.wrap,
        {
          backgroundColor: available ? C.accentDim : C.bgCardAlt,
          borderColor: available ? C.borderGlow : C.border,
        },
        Shadows.soft,
      ]}
      onPress={onPress}
      disabled={isChecking}
      activeOpacity={0.88}
    >
      <View style={[styles.iconRing, { backgroundColor: C.accent, borderColor: C.borderGlow }]}>
        {isChecking ? (
          <ActivityIndicator size="small" color={C.bg} />
        ) : (
          <Text style={[styles.iconTxt, { color: C.bg }]}>{available ? '↓' : '↻'}</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: C.textPrimary }]}>
          {isChecking
            ? 'Checking GitHub…'
            : available
              ? `Download v${available.latestVersion}`
              : 'Check for updates'}
        </Text>
        <Text style={[styles.sub, { color: C.textSecondary }]}>
          {available
            ? 'Opens latest APK in your browser'
            : `Installed v${installedVersion} · version.json & GitHub Releases`}
        </Text>
      </View>
      <Text style={[styles.arrow, { color: C.accent }]}>{available ? '↗' : '›'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 20, fontWeight: '800' },
  textCol: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '800' },
  sub: { fontSize: 11, lineHeight: 16 },
  arrow: { fontSize: 22, fontWeight: '700' },
});
