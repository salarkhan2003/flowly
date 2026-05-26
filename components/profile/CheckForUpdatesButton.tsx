import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Radius } from '../../constants/theme';
import { checkUpdateAndNotify } from '../../lib/updates';
import { useTheme } from '../../hooks/useTheme';
import { useUpdateStore } from '../../stores/updateStore';

/** Check only — shows alert; never downloads. */
export function CheckForUpdatesButton() {
  const { C } = useTheme();
  const [checking, setChecking] = useState(false);
  const installedVersion = useUpdateStore((s) => s.installedVersion);
  const isCheckingStore = useUpdateStore((s) => s.isChecking);
  const applyCheckResult = useUpdateStore((s) => s.applyCheckResult);

  const onPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecking(true);
    try {
      const outcome = await checkUpdateAndNotify();
      applyCheckResult(outcome);
    } finally {
      setChecking(false);
    }
  };

  const busy = checking || isCheckingStore;

  return (
    <TouchableOpacity
      style={[styles.wrap, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.88}
    >
      <View style={[styles.iconRing, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        {busy ? (
          <ActivityIndicator size="small" color={C.accent} />
        ) : (
          <Text style={[styles.iconTxt, { color: C.accent }]}>↻</Text>
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: C.textPrimary }]}>
          {busy ? 'Checking for updates…' : 'Check for updates'}
        </Text>
        <Text style={[styles.sub, { color: C.textMuted }]}>
          Installed v{installedVersion} · version.json on GitHub
        </Text>
      </View>
      <Text style={[styles.arrow, { color: C.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  iconRing: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 18, fontWeight: '800' },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 11, lineHeight: 15 },
  arrow: { fontSize: 20, fontWeight: '600' },
});
