import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getClayToneColor, Radius, type ClayTone } from '../../constants/theme';

interface ClayCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowing?: boolean;
  cyan?: boolean;
  nav?: boolean;
  tone?: ClayTone;
  variant?: 'default' | 'alt' | 'glass' | 'deep';
}

export function ClayCard({
  children,
  style,
  glowing = false,
  cyan = false,
  nav = false,
  tone = 'default',
  variant = 'default',
}: ClayCardProps) {
  const { C } = useTheme();

  const toneColor = getClayToneColor(tone);

  const bg =
    variant === 'glass'
      ? C.bgGlass
      : variant === 'alt'
        ? C.bgCardAlt
        : variant === 'deep'
          ? C.bgCardDeep
          : tone !== 'default'
            ? toneColor + (tone === 'yellow' ? '14' : '12')
            : C.bgCard;

  const glowColor = nav ? C.accent : cyan ? C.cyan : tone !== 'default' ? toneColor : C.accent;
  const borderColor = glowing
    ? glowColor + '88'
    : tone !== 'default'
      ? toneColor + '55'
      : C.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: tone !== 'default' || glowing ? 2 : 1,
          shadowColor: glowing || tone !== 'default' ? glowColor : '#1A2E28',
          shadowOpacity: glowing ? 0.32 : tone !== 'default' ? 0.2 : 0.12,
          shadowRadius: glowing ? 26 : 22,
        },
        style,
      ]}
    >
      <View style={[styles.highlight, { backgroundColor: C.clayHighlight }]} pointerEvents="none" />
      <View
        style={[styles.innerBevel, { borderColor: C.borderLight }]}
        pointerEvents="none"
      />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    zIndex: 1,
    opacity: 0.85,
  },
  innerBevel: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: Radius.xl - 2,
    borderWidth: 1,
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
});
