import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface ClayCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowing?: boolean;
  cyan?: boolean;
  nav?: boolean;
  variant?: 'default' | 'alt' | 'glass' | 'deep';
}

export function ClayCard({
  children,
  style,
  glowing = false,
  cyan = false,
  nav = false,
  variant = 'default',
}: ClayCardProps) {
  const { C } = useTheme();

  const bg =
    variant === 'glass'
      ? C.bgGlass
      : variant === 'alt'
        ? C.bgCardAlt
        : variant === 'deep'
          ? C.bgCardDeep
          : C.bgCard;

  const glowColor = nav ? C.accent : cyan ? C.cyan : C.accent;
  const borderColor = glowing
    ? nav
      ? C.borderGlow
      : cyan
        ? C.borderCyan
        : C.borderGlow
    : C.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor,
          shadowColor: glowing ? glowColor : '#000',
          shadowOpacity: glowing ? 0.38 : 0.6,
          shadowRadius: glowing ? 22 : 20,
        },
        style,
      ]}
    >
      <View style={[styles.highlight, { backgroundColor: C.bgGlassLight }]} pointerEvents="none" />
      <View style={[styles.innerShadow, { borderColor: C.borderLight }]} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  innerShadow: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: Radius.xl - 1,
    borderWidth: 1,
    zIndex: 0,
  },
});
