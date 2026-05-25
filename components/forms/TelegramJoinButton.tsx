import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FLOWLY_TELEGRAM_URL } from '../../constants/community';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export function TelegramJoinButton({ compact }: { compact?: boolean }) {
  const { C } = useTheme();

  const openChannel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(FLOWLY_TELEGRAM_URL);
    } catch {
      /* ignore */
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        compact && styles.btnCompact,
        { backgroundColor: C.bgCard, borderColor: C.borderGlow },
      ]}
      onPress={openChannel}
      activeOpacity={0.85}
    >
      <View style={[styles.icon, { backgroundColor: '#229ED9' + '33' }]}>
        <Text style={styles.iconTxt}>✈</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: C.textPrimary }]}>
          {compact ? 'Join Telegram' : 'Join Flowly on Telegram'}
        </Text>
        {!compact ? (
          <Text style={[styles.hint, { color: C.textMuted }]}>@FlowlyAITeam · optional</Text>
        ) : null}
      </View>
      <Text style={[styles.arrow, { color: C.accent }]}>↗</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  btnCompact: { paddingVertical: 10 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontSize: 18 },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12 },
  arrow: { fontSize: 18, fontWeight: '700' },
});
