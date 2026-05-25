import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface ClayCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowing?: boolean;
  cyan?: boolean;
  variant?: 'default' | 'alt' | 'glass' | 'deep';
}

export function ClayCard({ children, style, glowing = false, cyan = false, variant = 'default' }: ClayCardProps) {
  const { C } = useTheme();

  const bg =
    variant === 'glass' ? C.bgGlass :
    variant === 'alt'   ? C.bgCardAlt :
    variant === 'deep'  ? C.bgCardDeep :
    C.bgCard;

  const glowColor = cyan ? C.cyan : C.accent;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor: glowing ? (cyan ? C.borderCyan : C.borderGlow) : C.border,
          shadowColor: glowing ? glowColor : '#000',
          shadowOpacity: glowing ? 0.3 : 0.55,
          shadowRadius: glowing ? 20 : 18,
        },
        style,
      ]}
    >
      {/* Clay highlight — top edge shine */}
      <View style={[styles.highlight, { backgroundColor: C.bgGlassLight }]} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
});
