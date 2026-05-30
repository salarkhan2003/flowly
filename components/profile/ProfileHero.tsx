import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClayCard } from '../ui/ClayCard';
import { useTheme } from '../../hooks/useTheme';
import { ClayCategory, Radius, Spacing, Typography } from '../../constants/theme';

type ProfileHeroProps = {
  name: string;
  editing: boolean;
  nameInput: string;
  onNameInput: (v: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  stats: { notes: number; tasks: number; projects: number };
};

export function ProfileHero({
  name,
  editing,
  nameInput,
  onNameInput,
  onStartEdit,
  onSave,
  onCancel,
  stats,
}: ProfileHeroProps) {
  const { C } = useTheme();
  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <ClayCard tone="mint" glowing style={styles.heroCard}>
      <View style={styles.heroInner}>
        <View style={[styles.avatarRing, { borderColor: C.borderGlow }]}>
          <Image source={require('../../assets/icon.png')} style={styles.avatarImg} />
          <View style={[styles.avatarBadge, { backgroundColor: C.accent }]}>
            <Text style={[styles.avatarLetter, { color: C.bg }]}>{initial}</Text>
          </View>
        </View>

        {editing ? (
          <View style={styles.editBlock}>
            <TextInput
              style={[
                styles.nameInput,
                { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bgCardAlt },
              ]}
              value={nameInput}
              onChangeText={onNameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSave}
              placeholder="Your name"
              placeholderTextColor={C.textMuted}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: C.accent }]}
                onPress={onSave}
              >
                <Text style={[styles.saveBtnText, { color: C.bg }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: C.border }]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelBtnText, { color: C.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={onStartEdit} style={styles.nameBlock} activeOpacity={0.85}>
            <Text style={[styles.name, { color: C.textPrimary }]}>{name || 'User'}</Text>
            <Text style={[styles.editLink, { color: C.accent }]}>Edit name</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.tagline, { color: C.textSecondary }]}>
          Offline-first · everything stays on this device
        </Text>

        <View style={styles.statsRow}>
          {[
            { n: stats.notes, label: 'Notes', color: ClayCategory.notes },
            { n: stats.tasks, label: 'Tasks', color: ClayCategory.tasks },
            { n: stats.projects, label: 'Projects', color: ClayCategory.projects },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.statPill, { backgroundColor: s.color + '18', borderColor: s.color + '55' }]}
            >
              <Text style={[styles.statNum, { color: s.color }]}>{s.n}</Text>
              <Text style={[styles.statLbl, { color: C.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ClayCard>
  );
}

const styles = StyleSheet.create({
  heroCard: { marginBottom: 0 },
  heroInner: { alignItems: 'center', padding: Spacing.lg, gap: 10 },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarLetter: { fontSize: 14, fontWeight: '800' },
  nameBlock: { alignItems: 'center', gap: 4 },
  name: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  editLink: { fontSize: 13, fontWeight: '700' },
  editBlock: { width: '100%', gap: 10, paddingHorizontal: Spacing.sm },
  nameInput: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
  },
  editActions: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.md },
  saveBtnText: { fontSize: 14, fontWeight: '800' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1 },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  tagline: { ...Typography.bodySm, textAlign: 'center', lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: 2,
  },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLbl: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
});
