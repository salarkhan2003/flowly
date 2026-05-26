import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ClayCard } from './ClayCard';
import { GlowButton } from './GlowButton';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing } from '../../constants/theme';
import type { UpdateManifest } from '../../lib/updates';
import { getInstalledVersionName } from '../../lib/updates';

export type UpdateModalKind = 'checking' | 'available' | 'up_to_date' | 'error' | 'link_error';

export interface UpdateModalProps {
  visible: boolean;
  kind: UpdateModalKind;
  title: string;
  message: string;
  manifest?: UpdateManifest;
  force?: boolean;
  installedVersion?: string;
  onClose: () => void;
  onDownload?: () => void;
}

function ModalIcon({ kind }: { kind: UpdateModalKind }) {
  const { C } = useTheme();

  const cfg = {
    checking: { bg: C.infoDim, border: C.info + '55', color: C.info, glyph: null as string | null },
    available: { bg: C.accentDim, border: C.borderGlow, color: C.accent, glyph: '↑' },
    up_to_date: { bg: C.successDim, border: C.borderGlow, color: C.accent, glyph: '✓' },
    error: { bg: C.dangerDim, border: C.danger + '50', color: C.danger, glyph: '!' },
    link_error: { bg: C.warningDim, border: C.warning + '50', color: C.warning, glyph: '↗' },
  }[kind];

  return (
    <View style={[styles.iconRing, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      {kind === 'checking' ? (
        <ActivityIndicator color={cfg.color} size="small" />
      ) : (
        <Text style={[styles.iconGlyph, { color: cfg.color }]}>{cfg.glyph}</Text>
      )}
    </View>
  );
}

function ChangelogLine({ line }: { line: string }) {
  const { C } = useTheme();
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  if (parts.length === 1 && !line.includes('**')) {
    return (
      <View style={styles.changelogRow}>
        <View style={[styles.bullet, { backgroundColor: C.accent }]} />
        <Text style={[styles.changelogLine, { color: C.textSecondary }]}>{line}</Text>
      </View>
    );
  }

  return (
    <View style={styles.changelogRow}>
      <View style={[styles.bullet, { backgroundColor: C.accent }]} />
      <Text style={[styles.changelogLine, { color: C.textSecondary }]}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={i} style={{ fontWeight: '700', color: C.textPrimary }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    </View>
  );
}

function ChangelogList({ text }: { text: string }) {
  const { C } = useTheme();
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <ScrollView
      style={[styles.changelogScroll, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
      contentContainerStyle={styles.changelogScrollContent}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      {lines.map((line, i) => (
        <ChangelogLine key={`${i}-${line.slice(0, 24)}`} line={line} />
      ))}
    </ScrollView>
  );
}

export function UpdateModal({
  visible,
  kind,
  title,
  message,
  manifest,
  force = false,
  installedVersion,
  onClose,
  onDownload,
}: UpdateModalProps) {
  const { C } = useTheme();
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const installedLabel = installedVersion ?? getInstalledVersionName();

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
  }, [visible, kind]);

  const handleClose = () => {
    if (force && kind === 'available') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleDownload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDownload?.();
    if (!force) onClose();
  };

  const showChangelog = kind === 'available' && !!manifest?.changelog;
  const canDismiss = !(force && kind === 'available');

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={canDismiss ? handleClose : undefined} />
        <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
          <ClayCard glowing={kind === 'available'} cyan={kind === 'checking'} style={styles.card}>
            <View style={styles.cardInner}>
              <ModalIcon kind={kind} />

              <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>

              {kind === 'available' && manifest ? (
                <View style={[styles.versionPill, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                  <Text style={[styles.versionPillText, { color: C.accent }]}>
                    v{manifest.latestVersion}
                  </Text>
                  <Text style={[styles.versionFrom, { color: C.textMuted }]}>
                    from v{installedLabel}
                  </Text>
                </View>
              ) : null}

              {showChangelog ? (
                <ChangelogList text={manifest!.changelog} />
              ) : (
                <Text style={[styles.message, { color: C.textSecondary }]}>{message}</Text>
              )}

              {kind === 'link_error' && manifest?.apkUrl ? (
                <ScrollView style={[styles.urlBox, { backgroundColor: C.bgCardDeep, borderColor: C.border }]}>
                  <Text style={[styles.urlText, { color: C.textMuted }]} selectable>
                    {manifest.apkUrl}
                  </Text>
                </ScrollView>
              ) : null}
            </View>

            <View style={[styles.actions, { borderTopColor: C.border }]}>
              {kind === 'checking' ? null : kind === 'available' ? (
                <>
                  {!force ? (
                    <GlowButton label="Later" onPress={handleClose} variant="ghost" fullWidth />
                  ) : null}
                  <GlowButton
                    label={`Download Flowly ${manifest?.latestVersion ?? ''}`.trim()}
                    onPress={handleDownload}
                    variant="primary"
                    fullWidth
                  />
                </>
              ) : kind === 'up_to_date' ? (
                <GlowButton label="Got it" onPress={handleClose} variant="primary" fullWidth />
              ) : (
                <GlowButton label="OK" onPress={handleClose} variant="secondary" fullWidth />
              )}
            </View>
          </ClayCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 20, 0.78)',
  },
  center: {
    width: '88%',
    maxWidth: 380,
  },
  card: {
    width: '100%',
  },
  cardInner: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
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
    marginBottom: 4,
  },
  iconGlyph: {
    fontSize: 26,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  versionPillText: { fontSize: 14, fontWeight: '800' },
  versionFrom: { fontSize: 12, fontWeight: '500' },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  changelogScroll: {
    width: '100%',
    maxHeight: 400,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  changelogScrollContent: {
    padding: Spacing.md,
    gap: 8,
  },
  changelogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  changelogLine: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  urlBox: {
    width: '100%',
    maxHeight: 72,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 10,
  },
  urlText: { fontSize: 11, lineHeight: 16 },
  actions: {
    width: '100%',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 10,
    borderTopWidth: 1,
  },
});
