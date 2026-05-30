import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ClayCard } from '../ui/ClayCard';
import { useTheme } from '../../hooks/useTheme';
import { ClayTone, Spacing, Typography } from '../../constants/theme';

type ProfileSectionProps = {
  title: string;
  subtitle?: string;
  tone?: ClayTone;
  glowing?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ProfileSection({
  title,
  subtitle,
  tone = 'default',
  glowing = false,
  children,
  style,
}: ProfileSectionProps) {
  const { C } = useTheme();

  return (
    <ClayCard tone={tone} glowing={glowing} style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: C.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.body}>{children}</View>
    </ClayCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 4, gap: 2 },
  title: { ...Typography.headingSm, fontWeight: '800', letterSpacing: -0.2 },
  subtitle: { ...Typography.bodySm, lineHeight: 18 },
  body: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 2 },
});
