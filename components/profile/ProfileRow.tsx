import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type SwitchProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing, Typography } from '../../constants/theme';

type ProfileRowProps = {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  iconLetter?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  switchProps?: SwitchProps;
  loading?: boolean;
  last?: boolean;
};

export function ProfileRow({
  label,
  hint,
  icon,
  iconBg,
  iconColor,
  iconLetter,
  onPress,
  right,
  switchProps,
  loading,
  last,
}: ProfileRowProps) {
  const { C } = useTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.row,
        { borderBottomColor: C.border },
        !last && styles.rowBorder,
        onPress && pressed && { opacity: 0.88, backgroundColor: C.bgCardAlt },
      ]}
      disabled={!onPress}
    >
      {icon ?? (
        <View style={[styles.icon, { backgroundColor: iconBg ?? C.accentDim, borderColor: C.border }]}>
          <Text style={[styles.iconLetter, { color: iconColor ?? C.accent }]}>
            {iconLetter ?? label.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: C.textPrimary }]} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: C.textMuted }]} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={C.accent} />
      ) : switchProps ? (
        <Switch
          {...switchProps}
          trackColor={{ false: C.border, true: C.accentDim }}
          thumbColor={switchProps.value ? C.accent : C.bgCard}
          ios_backgroundColor={C.border}
        />
      ) : (
        (right ?? (onPress ? <Text style={[styles.chevron, { color: C.accent }]}>›</Text> : null))
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderRadius: Radius.md,
    paddingHorizontal: 4,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: { fontSize: 15, fontWeight: '800' },
  textCol: { flex: 1, minWidth: 0, gap: 2 },
  label: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 16 },
  chevron: { fontSize: 22, fontWeight: '700', marginLeft: 4 },
});
