import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface GlowInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function GlowInput({ label, error, containerStyle, leftIcon, rightIcon, style, onFocus, onBlur, ...props }: GlowInputProps) {
  const { C } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>}
      <View style={[
        styles.inputRow,
        { backgroundColor: C.bgCard, borderColor: focused ? C.borderGlow : error ? C.danger : C.border },
        focused && { shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, { color: C.textPrimary }, leftIcon ? styles.inputWithLeft : null, rightIcon ? styles.inputWithRight : null, style]}
          placeholderTextColor={C.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.error, { color: C.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '400',
  },
  inputWithLeft: { paddingLeft: 8 },
  inputWithRight: { paddingRight: 8 },
  iconLeft: { paddingLeft: 16 },
  iconRight: { paddingRight: 16 },
  error: { fontSize: 12, fontWeight: '500', marginLeft: 2 },
});
