import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius } from '../../constants/theme';

interface EmptyStateProps {
  icon?: string; // kept for API compat but ignored
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

function EmptyIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: color, opacity: 0.5 }} />
      <View style={{ position: 'absolute', width: 18, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 2, height: 18, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  const { C } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: C.accentSoft, borderColor: C.borderGlow }]}>
        <EmptyIcon color={C.accent} />
      </View>
      <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: C.textSecondary }]}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    shadowColor: '#00FF9D', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  action: { marginTop: 8 },
});
