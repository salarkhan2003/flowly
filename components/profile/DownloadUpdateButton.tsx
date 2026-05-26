import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlowButton } from '../ui/GlowButton';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { getFlowlyDownloadUrl } from '../../lib/shareApp';
import { isUpdateAvailable } from '../../lib/updates';
import { useUpdateStore } from '../../stores/updateStore';

function ChangelogLine({ line }: { line: string }) {
  const { C } = useTheme();
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <View style={styles.changelogRow}>
      <View style={[styles.dot, { backgroundColor: C.accent }]} />
      <Text style={[styles.changelogLine, { color: C.textSecondary }]} numberOfLines={2}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <Text key={i} style={{ fontWeight: '700', color: C.textPrimary }}>
              {part.slice(2, -2)}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    </View>
  );
}

export function DownloadUpdateButton() {
  const { C } = useTheme();
  const available = useUpdateStore((s) => s.available);

  if (!available || !isUpdateAvailable(available)) return null;

  const url = getFlowlyDownloadUrl(available);
  const lines = available.changelog
    .split('\n')
    .map((l) => l.replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  const handleDownload = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Linking.openURL(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: C.accent }]}>
          <Text style={[styles.badgeTxt, { color: C.bg }]}>NEW</Text>
        </View>
        <Text style={[styles.version, { color: C.accent }]}>v{available.latestVersion}</Text>
      </View>

      {lines.length > 0 ? (
        <View style={styles.changelog}>
          {lines.map((line, i) => (
            <ChangelogLine key={i} line={line} />
          ))}
        </View>
      ) : null}

      <GlowButton
        label={`Download v${available.latestVersion}`}
        onPress={handleDownload}
        variant="primary"
        size="lg"
        fullWidth
      />

      <Text style={[styles.urlHint, { color: C.textMuted }]} numberOfLines={1}>
        {url.replace('https://', '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: 4,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  version: { fontSize: 18, fontWeight: '800', flex: 1 },
  changelog: { gap: 6, marginVertical: 4 },
  changelogRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 6 },
  changelogLine: { flex: 1, fontSize: 13, lineHeight: 18 },
  urlHint: { fontSize: 10, textAlign: 'center', marginTop: 2 },
});
