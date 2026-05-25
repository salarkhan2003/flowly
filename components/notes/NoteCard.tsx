import React, { useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Tag } from '../ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Note } from '../../types';
import { useNotesStore } from '../../stores/notesStore';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps { note: Note; compact?: boolean; }

export function NoteCard({ note, compact = false }: NoteCardProps) {
  const { C } = useTheme();
  const { deleteNote, updateNote } = useNotesStore();
  const [showActions, setShowActions] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (showActions) { setShowActions(false); return; }
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    Haptics.selectionAsync();
    router.push(`/notes/${note.id}` as any);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions((v) => !v);
  };

  const handleDelete = () => {
    setShowActions(false);
    Alert.alert('Delete Note', `Delete "${note.title || 'Untitled'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); deleteNote(note.id); } },
    ]);
  };

  const preview = note.content.replace(/[#*`>\-]/g, '').slice(0, 100);
  const isPinned = note.is_pinned;

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: Spacing.sm }}>
      <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress} activeOpacity={0.88}>
        <View style={[
          styles.card,
          {
            backgroundColor: C.bgCard,
            borderColor: isPinned ? C.borderGlow : C.border,
            shadowColor: isPinned ? C.accent : '#000',
            shadowOpacity: isPinned ? 0.25 : 0.5,
          }
        ]}>
          {/* Clay top highlight */}
          <View style={[styles.highlight, { backgroundColor: C.bgGlassLight }]} />

          {/* Pinned accent bar */}
          {isPinned && <View style={[styles.pinStripe, { backgroundColor: C.accent }]} />}

          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {isPinned && (
                  <View style={[styles.pinDot, { backgroundColor: C.accent, shadowColor: C.accent }]} />
                )}
                <Text style={[styles.title, { color: C.textPrimary }]} numberOfLines={1}>
                  {note.title || 'Untitled'}
                </Text>
              </View>
              <Text style={[styles.time, { color: C.textMuted }]}>
                {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </Text>
            </View>

            {/* Preview */}
            {!compact && preview ? (
              <Text style={[styles.preview, { color: C.textSecondary }]} numberOfLines={2}>
                {preview}
              </Text>
            ) : null}

            {/* Tags */}
            {note.tags.length > 0 && (
              <View style={styles.tags}>
                {note.tags.slice(0, 3).map((tag) => <Tag key={tag} label={tag} />)}
                {note.tags.length > 3 && (
                  <Text style={[styles.moreTags, { color: C.textMuted }]}>+{note.tags.length - 3}</Text>
                )}
              </View>
            )}

            {/* Quick Actions */}
            {showActions && (
              <View style={[styles.actionBar, { borderTopColor: C.border }]}>
                {[
                  { label: 'Edit', color: C.accent, bg: C.accentDim, border: C.borderGlow, action: () => { setShowActions(false); router.push(`/notes/${note.id}` as any); } },
                  { label: isPinned ? 'Unpin' : 'Pin', color: C.cyan, bg: C.cyanDim, border: C.borderCyan, action: () => { setShowActions(false); updateNote(note.id, { is_pinned: !note.is_pinned }); } },
                  { label: note.is_archived ? 'Unarchive' : 'Archive', color: C.warning, bg: C.warningDim, border: C.warning + '40', action: () => { setShowActions(false); updateNote(note.id, { is_archived: !note.is_archived }); } },
                  { label: 'Delete', color: C.danger, bg: C.dangerDim, border: C.danger + '40', action: handleDelete },
                ].map((a) => (
                  <TouchableOpacity key={a.label} style={[styles.actionBtn, { backgroundColor: a.bg, borderColor: a.border }]} onPress={a.action}>
                    <Text style={[styles.actionTxt, { color: a.color }]}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  highlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1 },
  pinStripe: { height: 2.5 },
  inner: { padding: Spacing.md, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pinDot: {
    width: 7, height: 7, borderRadius: 4, flexShrink: 0,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },
  title: { fontSize: 16, fontWeight: '700', flex: 1, letterSpacing: -0.2 },
  time: { fontSize: 11, fontWeight: '500', flexShrink: 0 },
  preview: { fontSize: 13, lineHeight: 21, opacity: 0.85 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moreTags: { fontSize: 11, fontWeight: '600', alignSelf: 'center' },
  actionBar: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTopWidth: 1, marginTop: 2 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  actionTxt: { fontSize: 12, fontWeight: '700' },
});
