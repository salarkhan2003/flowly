import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useVoiceCapture } from '../../hooks/useVoiceCapture';
import { MicIcon } from '../icons/MicIcon';
import { Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import type { VoiceAgentBarProps } from './VoiceAgentBar';

export function VoiceAgentBarImpl({
  onSubmit,
  disabled = false,
  placeholder = 'Tap mic — speak to create notes, tasks, or projects',
  compact = false,
}: VoiceAgentBarProps) {
  const { C } = useTheme();
  const voice = useVoiceCapture();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (voice.phase !== 'listening') {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 520, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 520, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [voice.phase, pulse]);

  const handleMicPress = async () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (voice.phase === 'listening') {
      voice.stopListening();
      return;
    }
    if (voice.phase === 'review') return;
    await voice.startListening();
  };

  const handleCreate = async () => {
    const text = voice.displayText.trim();
    if (!text || disabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onSubmit(text);
    voice.cancel();
  };

  if (voice.phase === 'idle' && compact) {
    return (
      <Pressable
        onPress={handleMicPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.compactMic,
          {
            backgroundColor: C.voiceMic,
            opacity: pressed ? 0.9 : disabled ? 0.45 : 1,
          },
          Shadows.voice3d,
        ]}
        accessibilityLabel="Start voice input"
      >
        <MicIcon size={22} color="#FFFFFF" />
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {voice.phase === 'idle' && (
        <View style={styles.idleBlock}>
          <Text style={[styles.hint, { color: C.textSecondary }]}>{placeholder}</Text>
          <Pressable
            onPress={handleMicPress}
            disabled={disabled}
            style={({ pressed }) => [styles.micOuter, pressed && { opacity: 0.92 }]}
          >
            <Animated.View
              style={[
                styles.mic3d,
                {
                  backgroundColor: C.voiceMic,
                  transform: [{ scale: pulse }],
                },
                Shadows.voice3d,
              ]}
            >
              <View style={styles.micRing} />
              <MicIcon size={36} color="#FFFFFF" />
            </Animated.View>
            <Text style={[styles.startLabel, { color: C.textPrimary }]}>Start creating</Text>
            <Text style={[styles.startSub, { color: C.textMuted }]}>Voice → AI agent</Text>
          </Pressable>
        </View>
      )}

      {voice.phase === 'listening' && (
        <View style={[styles.panel, { backgroundColor: C.bgCard, borderColor: C.voiceMicGlow }]}>
          <View style={styles.listeningRow}>
            <Animated.View
              style={[
                styles.liveDot,
                { backgroundColor: C.voiceMic, transform: [{ scale: pulse }] },
              ]}
            />
            <Text style={[styles.listeningTxt, { color: C.textPrimary }]}>Listening…</Text>
          </View>
          <Text style={[styles.livePreview, { color: C.textSecondary }]} numberOfLines={3}>
            {voice.displayText || 'Speak now'}
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.stopBtn, { backgroundColor: C.dangerDim, borderColor: C.danger }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                voice.stopListening();
              }}
            >
              <Text style={[styles.stopTxt, { color: C.danger }]}>Stop</Text>
            </Pressable>
          </View>
        </View>
      )}

      {voice.phase === 'review' && (
        <View style={[styles.panel, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}>
          <Text style={[styles.reviewLabel, { color: C.accent }]}>YOUR REQUEST</Text>
          <Text style={[styles.reviewText, { color: C.textPrimary }]}>{voice.displayText}</Text>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.ghostBtn, { borderColor: C.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                voice.cancel();
              }}
            >
              <Text style={[styles.ghostTxt, { color: C.textMuted }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, { backgroundColor: C.accent }, Shadows.clayGlow]}
              onPress={handleCreate}
              disabled={!voice.displayText.trim() || disabled}
            >
              <Text style={[styles.createTxt, { color: '#FFFFFF' }]}>Create</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: Spacing.sm },
  wrapCompact: { marginVertical: 0 },
  idleBlock: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  hint: { ...Typography.bodySm, textAlign: 'center', paddingHorizontal: Spacing.md },
  micOuter: { alignItems: 'center', gap: 10 },
  mic3d: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  micRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  startLabel: { ...Typography.headingSm, fontWeight: '800' },
  startSub: { ...Typography.bodySm },
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  listeningRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveDot: { width: 12, height: 12, borderRadius: 6 },
  listeningTxt: { ...Typography.headingSm, fontWeight: '700' },
  livePreview: { ...Typography.bodyMd, minHeight: 44 },
  reviewLabel: { ...Typography.caption },
  reviewText: { ...Typography.bodyLg, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  stopBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  stopTxt: { fontSize: 16, fontWeight: '800' },
  ghostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  ghostTxt: { fontSize: 15, fontWeight: '600' },
  createBtn: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  createTxt: { fontSize: 16, fontWeight: '800' },
  compactMic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
});
