import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAIStore } from '../../stores/aiStore';

function AISparkIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 16, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 1.5, height: 16, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 11, height: 1.5, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: 11, height: 1.5, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}

export function DailyBriefCard() {
  const { C } = useTheme();
  const brief = useAIStore((s) => s.dailyBrief);
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={[s.card, { backgroundColor: C.bgCard, borderColor: C.borderGlow, shadowColor: C.accent }]}>
      {/* Top accent bar */}
      <View style={[s.topBar, { backgroundColor: C.accent }]} />
      {/* Shine */}
      <View style={[s.shine, { backgroundColor: C.bgGlassLight }]} />

      <View style={s.content}>
        <View style={s.header}>
          <View style={s.labelRow}>
            <AISparkIcon color={C.accent} />
            <Text style={[s.label, { color: C.accent }]}>AI DAILY BRIEF</Text>
          </View>
          <Animated.View style={[s.pulse, { backgroundColor: C.accent, opacity: pulse }]} />
        </View>

        {!brief ? (
          <View style={s.loadingRow}>
            <View style={[s.loadDot, { backgroundColor: C.accent }]} />
            <Text style={[s.placeholder, { color: C.textMuted }]}>Generating your daily brief...</Text>
          </View>
        ) : (
          <>
            <Text style={[s.greeting, { color: C.textPrimary }]}>{brief.greeting}</Text>
            <Text style={[s.summary, { color: C.textSecondary }]}>{brief.summary}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  topBar: { height: 2.5 },
  shine: { position: 'absolute', top: 2.5, left: 0, right: 0, height: 1 },
  content: { padding: Spacing.md, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  pulse: { width: 8, height: 8, borderRadius: 4, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.6 },
  placeholder: { ...Typography.bodyMd, fontStyle: 'italic' },
  greeting: { ...Typography.headingMd, fontWeight: '700' },
  summary: { ...Typography.bodyMd, lineHeight: 22 },
});
