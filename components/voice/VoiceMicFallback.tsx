import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { showError } from '../../lib/alert';
import { getExpoGoVoiceHint, isSpeechRecognitionSupported } from '../../lib/speechRecognition';
import { MicIcon } from '../icons/MicIcon';
import { Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import type { VoiceAgentBarProps } from './VoiceAgentBar';

/** Visible mic when native speech module is not loaded (Expo Go or import pending). */
export function VoiceMicFallback({
  disabled = false,
  placeholder = 'Tap mic — speak to create notes, tasks, or projects',
  compact = false,
}: VoiceAgentBarProps) {
  const { C } = useTheme();

  const onPress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isSpeechRecognitionSupported()) {
      showError('Voice input', getExpoGoVoiceHint());
      return;
    }
    showError('Voice input', 'Loading voice module… Try again in a moment.');
  };

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.compactMic,
          {
            backgroundColor: C.voiceMic,
            opacity: pressed ? 0.9 : disabled ? 0.45 : 1,
          },
          Shadows.voice3d,
        ]}
        accessibilityLabel="Voice input"
        accessibilityRole="button"
      >
        <MicIcon size={22} color="#FFFFFF" />
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.hint, { color: C.textSecondary }]}>{placeholder}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.micOuter, pressed && { opacity: 0.92 }]}
        accessibilityLabel="Voice input"
        accessibilityRole="button"
      >
        <View style={[styles.mic3d, { backgroundColor: C.voiceMic }, Shadows.voice3d]}>
          <View style={styles.micRing} />
          <MicIcon size={36} color="#FFFFFF" />
        </View>
        <Text style={[styles.startLabel, { color: C.textPrimary }]}>Tap to speak</Text>
        <Text style={[styles.startSub, { color: C.textMuted }]}>
          {isSpeechRecognitionSupported() ? 'Voice → AI agent' : 'Requires Flowly app build'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, marginVertical: Spacing.sm },
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
