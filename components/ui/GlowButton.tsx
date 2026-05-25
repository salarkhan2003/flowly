import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator, View, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function GlowButton({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon, fullWidth = false,
}: GlowButtonProps) {
  const { C } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBg = () => {
    switch (variant) {
      case 'primary':   return C.accent;
      case 'secondary': return C.accentDim;
      case 'ghost':     return 'transparent';
      case 'danger':    return C.dangerDim;
      case 'cyan':      return C.cyanDim;
    }
  };

  const getBorder = () => {
    switch (variant) {
      case 'primary':   return C.accent;
      case 'secondary': return C.borderGlow;
      case 'ghost':     return C.border;
      case 'danger':    return C.danger + '50';
      case 'cyan':      return C.borderCyan;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':   return C.bg;
      case 'secondary': return C.accent;
      case 'ghost':     return C.textSecondary;
      case 'danger':    return C.danger;
      case 'cyan':      return C.cyan;
    }
  };

  const getShadow = () => {
    if (variant === 'primary') return { shadowColor: C.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 10 };
    if (variant === 'cyan') return { shadowColor: C.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 };
    return {};
  };

  const padding = size === 'sm' ? { paddingHorizontal: 16, paddingVertical: 9 }
    : size === 'lg' ? { paddingHorizontal: 36, paddingVertical: 18 }
    : { paddingHorizontal: 26, paddingVertical: 14 };

  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: getBg(), borderColor: getBorder() },
        getShadow(),
        padding,
        fullWidth && { alignSelf: 'stretch' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text style={[styles.text, { color: getTextColor(), fontSize }, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '700', letterSpacing: -0.1 },
  disabled: { opacity: 0.4 },
});
