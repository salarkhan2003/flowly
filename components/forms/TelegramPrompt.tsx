import React from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FLOWLY_TELEGRAM_URL } from '../../constants/community';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { usePrefsStore } from '../../stores/prefsStore';

export function TelegramPrompt({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { C } = useTheme();
  const dismissTelegramPrompt = usePrefsStore((s) => s.dismissTelegramPrompt);

  const handleClose = async () => {
    await dismissTelegramPrompt();
    onClose();
  };

  const handleJoin = async () => {
    try {
      await Linking.openURL(FLOWLY_TELEGRAM_URL);
    } catch {
      /* ignore */
    }
    await handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}>
          <Text style={[styles.title, { color: C.textPrimary }]}>Join our Telegram</Text>
          <Text style={[styles.body, { color: C.textSecondary }]}>
            Get early updates, tips, and chat with the Flowly community. Totally optional.
          </Text>
          <TouchableOpacity
            style={[styles.primary, { backgroundColor: C.accent }]}
            onPress={handleJoin}
            activeOpacity={0.88}
          >
            <Text style={[styles.primaryTxt, { color: C.bg }]}>Join @FlowlyAITeam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={[styles.closeTxt, { color: C.textMuted }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.lg,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21 },
  primary: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryTxt: { fontSize: 16, fontWeight: '800' },
  closeBtn: { alignItems: 'center', paddingVertical: 10 },
  closeTxt: { fontSize: 14, fontWeight: '600' },
});
