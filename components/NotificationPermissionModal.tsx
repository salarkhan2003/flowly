import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayCard } from './ui/ClayCard';
import { GlowButton } from './ui';
import { Radius, Spacing, Typography } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

type NotificationPermissionModalProps = {
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
};

export function NotificationPermissionModal({
  visible,
  onAllow,
  onDismiss,
}: NotificationPermissionModalProps) {
  const { C } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <SafeAreaView style={styles.center}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ClayCard tone="purple" glowing style={styles.card}>
              <Text style={[styles.title, { color: C.textPrimary }]}>
                Stay on track
              </Text>
              <Text style={[styles.body, { color: C.textSecondary }]}>
                Enable notifications to get task reminders, daily planning nudges, and deadline
                alerts — all on your device, offline.
              </Text>
              <View style={styles.actions}>
                <GlowButton label="Allow" onPress={onAllow} fullWidth size="lg" />
                <Pressable onPress={onDismiss} style={styles.later}>
                  <Text style={[styles.laterText, { color: C.textMuted }]}>Not now</Text>
                </Pressable>
              </View>
            </ClayCard>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,16,14,0.72)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  center: { flex: 1, justifyContent: 'center' },
  card: { padding: Spacing.lg, gap: Spacing.md },
  title: { ...Typography.headingMd, fontWeight: '800', textAlign: 'center' },
  body: { ...Typography.bodyMd, lineHeight: 22, textAlign: 'center' },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
  later: { alignItems: 'center', paddingVertical: 10 },
  laterText: { fontSize: 14, fontWeight: '600' },
});
