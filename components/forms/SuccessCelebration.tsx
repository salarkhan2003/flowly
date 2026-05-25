import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export function SuccessCelebration({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { C } = useTheme();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]}>
      <View style={[styles.ring, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
        <Text style={[styles.check, { color: C.accent }]}>✓</Text>
      </View>
      <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
      <Text style={[styles.sub, { color: C.textSecondary }]}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 14 },
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 40, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.lg },
});
