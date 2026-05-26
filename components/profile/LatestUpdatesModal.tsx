import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ClayCard } from '../ui/ClayCard';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { UpdateManifest } from '../../lib/updates';
import { getInstalledVersionCode, getInstalledVersionName, isUpdateAvailable } from '../../lib/updates';

function ChangelogLine({ line }: { line: string }) {
  const { C } = useTheme();
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <View style={styles.lineRow}>
      <View style={[styles.bullet, { backgroundColor: C.accent }]} />
      <Text style={[styles.lineText, { color: C.textSecondary }]}>
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

export function LatestUpdatesModal({
  visible,
  manifest,
  onClose,
}: {
  visible: boolean;
  manifest: UpdateManifest | null;
  onClose: () => void;
}) {
  const { C } = useTheme();
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const installed = getInstalledVersionName();
  const installedCode = getInstalledVersionCode();
  const hasUpdate = manifest ? isUpdateAvailable(manifest) : false;

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible]);

  const lines = (manifest?.changelog ?? '')
    .split('\n')
    .map((l) => l.replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
          <ClayCard glowing style={styles.card}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: C.textPrimary }]}>
                {hasUpdate ? "What's new" : 'Release notes'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12} style={[styles.closeBtn, { borderColor: C.border }]}>
                <Text style={[styles.closeTxt, { color: C.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.versionRow, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
              {manifest ? (
                hasUpdate ? (
                  <Text style={[styles.versionTxt, { color: C.accent }]}>
                    v{installed} (build {installedCode}) → v{manifest.latestVersion} (build{' '}
                    {manifest.latestVersionCode})
                  </Text>
                ) : (
                  <Text style={[styles.versionTxt, { color: C.accent }]}>
                    You're on v{manifest.latestVersion} · build {installedCode}
                  </Text>
                )
              ) : (
                <Text style={[styles.versionTxt, { color: C.accent }]}>
                  Loading release notes…
                </Text>
              )}
            </View>

            <ScrollView
              style={[styles.scroll, { borderColor: C.border }]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
            >
              {lines.length > 0 ? (
                lines.map((line, i) => <ChangelogLine key={i} line={line} />)
              ) : (
                <Text style={[styles.empty, { color: C.textMuted }]}>No changelog listed for this release.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: C.accent }]}
              onPress={onClose}
              activeOpacity={0.88}
            >
              <Text style={[styles.doneTxt, { color: C.bg }]}>Close</Text>
            </TouchableOpacity>
          </ClayCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5, 10, 20, 0.78)' },
  center: { width: '90%', maxWidth: 400 },
  card: { width: '100%', padding: Spacing.lg, gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { fontSize: 14, fontWeight: '700' },
  versionRow: {
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  versionTxt: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  scroll: {
    maxHeight: 360,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  scrollContent: { padding: Spacing.md, gap: 8 },
  lineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  lineText: { flex: 1, fontSize: 14, lineHeight: 20 },
  empty: { fontSize: 13, textAlign: 'center', padding: Spacing.md },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  doneTxt: { fontSize: 15, fontWeight: '800' },
});
