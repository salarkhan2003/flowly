import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NoteCard } from '../../components/notes/NoteCard';
import { EmptyState, FAB, GlowInput, ScreenHeader } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotesStore } from '../../stores/notesStore';

type FilterType = 'all' | 'pinned' | 'archived';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'archived', label: 'Archived' },
];

export default function NotesScreen() {
  const { C } = useTheme();
  const { notes } = useNotesStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = notes.filter((n) => {
    if (filter === 'pinned' && !n.is_pinned) return false;
    if (filter === 'archived' && !n.is_archived) return false;
    if (filter === 'all' && n.is_archived) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader
        title="Notes"
        subtitle={`${notes.filter((n) => !n.is_archived).length} saved locally`}
        badge={notes.filter((n) => !n.is_archived).length}
      />

      {/* Search */}
      <GlowInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search notes..."
        containerStyle={s.search}
      />

      {/* Filters */}
      <View style={s.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, { borderColor: C.border, backgroundColor: C.bgCard },
              filter === f.key && { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.filterTxt, { color: filter === f.key ? C.accent : C.textSecondary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard note={item} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="No notes yet" subtitle="Tap + to create your first note" />
        }
      />
      <FAB mode="note" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  search: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1 },
  filterTxt: { fontSize: 13, fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 140 },
});
