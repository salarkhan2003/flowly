import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpdateStore } from '../stores/updateStore';
import { ClayCard } from './ui/ClayCard';
import { GlowButton } from './ui/GlowButton';
import { useTheme } from '../hooks/useTheme';
import { Radius, Spacing } from '../constants/theme';
import * as Haptics from 'expo-haptics';

/** Blocks the app when version.json sets forceUpdate: true. */
export function ForceUpdateGate({ children }: { children: React.ReactNode }) {
  const available = useUpdateStore((s) => s.available);
  const installedVersionCode = useUpdateStore((s) => s.installedVersionCode);
  const { C } = useTheme();

  const force =
    available?.forceUpdate === true &&
    available.latestVersionCode > installedVersionCode;

  if (!force || !available) return <>{children}</>;

  const lines = available.changelog
    .split('\n')
    .map((l) => l.replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Linking.openURL(available.apkUrl);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.bg }]}>
      <View style={styles.content}>
        <ClayCard glowing style={styles.card}>
          <View style={styles.cardInner}>
            <View style={[styles.iconRing, { backgroundColor: C.dangerDim, borderColor: C.danger + '50' }]}>
              <Text style={[styles.iconGlyph, { color: C.danger }]}>!</Text>
            </View>
            <Text style={[styles.title, { color: C.textPrimary }]}>Update required</Text>
            <View style={[styles.versionPill, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
              <Text style={[styles.pillText, { color: C.accent }]}>v{available.latestVersion}</Text>
            </View>
            <Text style={[styles.body, { color: C.textSecondary }]}>
              A critical fix is available. Install the latest APK to keep using Flowly.
            </Text>
            {lines.length > 0 ? (
              <View style={[styles.changelogBox, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
                {lines.map((line, i) => (
                  <View key={i} style={styles.changelogRow}>
                    <View style={[styles.bullet, { backgroundColor: C.accent }]} />
                    <Text style={[styles.changelogLine, { color: C.textSecondary }]}>{line}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <GlowButton
              label={`Download Flowly ${available.latestVersion}`}
              onPress={handleDownload}
              variant="primary"
              fullWidth
              size="lg"
            />
          </View>
        </ClayCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: { width: '100%' },
  cardInner: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 28, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  versionPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  changelogBox: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 8,
  },
  changelogRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  changelogLine: { flex: 1, fontSize: 13, lineHeight: 19 },
});
