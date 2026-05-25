import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ClayCard } from './ClayCard';
import { GlowButton } from './GlowButton';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing } from '../../constants/theme';
import type { AppModalVariant } from '../../stores/modalStore';

export interface ClayModalProps {
  visible: boolean;
  variant: AppModalVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  dismissable?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

function ModalIcon({ variant }: { variant: AppModalVariant }) {
  const { C } = useTheme();
  const map = {
    info: { bg: C.infoDim, border: C.info + '55', color: C.info, glyph: 'i' },
    confirm: { bg: C.accentDim, border: C.borderGlow, color: C.accent, glyph: '?' },
    destructive: { bg: C.dangerDim, border: C.danger + '50', color: C.danger, glyph: '!' },
    success: { bg: C.successDim, border: C.borderGlow, color: C.accent, glyph: '✓' },
    error: { bg: C.dangerDim, border: C.danger + '50', color: C.danger, glyph: '×' },
  }[variant];

  return (
    <View style={[styles.iconRing, { backgroundColor: map.bg, borderColor: map.border }]}>
      <Text style={[styles.iconGlyph, { color: map.color }]}>{map.glyph}</Text>
    </View>
  );
}

export function ClayModal({
  visible,
  variant,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  loading = false,
  dismissable = true,
  onConfirm,
  onCancel,
  children,
}: ClayModalProps) {
  const { C } = useTheme();
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowing = variant === 'confirm' || variant === 'destructive';

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 85, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [visible]);

  const handleBackdrop = () => {
    if (!dismissable || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel?.();
  };

  const showCancel = variant === 'confirm' || variant === 'destructive';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleBackdrop}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={handleBackdrop} />
        <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
          <ClayCard
            glowing={glowing}
            cyan={variant === 'info'}
            style={styles.card}
            variant="deep"
          >
            <View style={styles.inner}>
              <ModalIcon variant={variant} />
              <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
              <Text style={[styles.message, { color: C.textSecondary }]}>{message}</Text>
              {children}
              <View style={styles.actions}>
                {showCancel && onCancel ? (
                  <GlowButton
                    label={cancelLabel}
                    onPress={onCancel}
                    variant="ghost"
                    fullWidth
                    disabled={loading}
                  />
                ) : null}
                <GlowButton
                  label={loading ? 'Please wait…' : confirmLabel}
                  onPress={onConfirm}
                  variant={variant === 'destructive' ? 'danger' : variant === 'success' ? 'primary' : 'cyan'}
                  fullWidth
                  disabled={loading}
                  loading={loading}
                />
              </View>
            </View>
          </ClayCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 3, 8, 0.82)',
  },
  center: { width: '88%', maxWidth: 380 },
  card: { width: '100%' },
  inner: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconGlyph: { fontSize: 26, fontWeight: '800' },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.35,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  actions: { width: '100%', gap: 10, marginTop: Spacing.sm },
});
