import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { NoteCard } from '../../components/notes/NoteCard';
import { EmptyState, FAB, GlowInput, ScreenHeader } from '../../components/ui';
import { ClayCard } from '../../components/ui/ClayCard';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { htmlToPlainText } from '../../lib/noteContent';
import { useNotesStore } from '../../stores/notesStore';

type FilterType = 'all' | 'pinned' | 'archived' | 'tagged' | 'recent';
type SortType = 'updated' | 'created' | 'title' | 'words';
type ViewMode = 'list' | 'compact';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'recent', label: 'Recent' },
  { key: 'tagged', label: 'Tagged' },
  { key: 'archived', label: 'Archive' },
];

const SORTS: { key: SortType; label: string }[] = [
  { key: 'updated', label: 'Updated' },
  { key: 'created', label: 'Created' },
  { key: 'title', label: 'A–Z' },
  { key: 'words', label: 'Length' },
];

export default function NotesScreen() {
  const { C } = useTheme();
  const { notes } = useNotesStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const activeNotes = notes.filter((n) => !n.is_archived);
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [notes]);

  const stats = useMemo(
    () => ({
      total: activeNotes.length,
      pinned: activeNotes.filter((n) => n.is_pinned).length,
      archived: notes.filter((n) => n.is_archived).length,
      words: activeNotes.reduce(
        (sum, n) => sum + (htmlToPlainText(n.content).split(/\s+/).filter(Boolean).length || 0),
        0
      ),
    }),
    [activeNotes, notes]
  );

  const filtered = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let list = notes.filter((n) => {
      if (filter === 'pinned' && !n.is_pinned) return false;
      if (filter === 'archived' && !n.is_archived) return false;
      if (filter === 'all' && n.is_archived) return false;
      if (filter === 'tagged' && n.tags.length === 0) return false;
      if (filter === 'recent' && new Date(n.updated_at).getTime() < weekAgo) return false;
      if (tagFilter && !n.tags.includes(tagFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          htmlToPlainText(n.content).toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sort === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === 'words') {
        const wa = htmlToPlainText(a.content).split(/\s+/).filter(Boolean).length;
        const wb = htmlToPlainText(b.content).split(/\s+/).filter(Boolean).length;
        return wb - wa;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return list;
  }, [notes, filter, sort, search, tagFilter]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader
        title="Notes"
        subtitle={`${stats.total} active · ${stats.words.toLocaleString()} words`}
        badge={stats.total}
      />

      <View style={s.statsRow}>
        <ClayCard variant="alt" style={s.statChip}>
          <Text style={[s.statNum, { color: C.accent }]}>{stats.pinned}</Text>
          <Text style={[s.statLbl, { color: C.textMuted }]}>Pinned</Text>
        </ClayCard>
        <ClayCard variant="alt" style={s.statChip}>
          <Text style={[s.statNum, { color: C.cyan }]}>{allTags.length}</Text>
          <Text style={[s.statLbl, { color: C.textMuted }]}>Tags</Text>
        </ClayCard>
        <ClayCard variant="alt" style={s.statChip}>
          <Text style={[s.statNum, { color: C.textSecondary }]}>{stats.archived}</Text>
          <Text style={[s.statLbl, { color: C.textMuted }]}>Archived</Text>
        </ClayCard>
      </View>

      <GlowInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search title, body, tags..."
        containerStyle={s.search}
      />

      <View style={s.toolRow}>
        <View style={s.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                s.filterBtn,
                { borderColor: C.border, backgroundColor: C.bgCard },
                filter === f.key && { backgroundColor: C.accentDim, borderColor: C.borderGlow },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.key);
              }}
            >
              <Text style={[s.filterTxt, { color: filter === f.key ? C.accent : C.textSecondary }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.sortRow}>
        <Text style={[s.sortLabel, { color: C.textMuted }]}>Sort</Text>
        {SORTS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              s.sortBtn,
              { borderColor: C.border },
              sort === opt.key && { backgroundColor: C.accent, borderColor: C.accent },
            ]}
            onPress={() => setSort(opt.key)}
          >
            <Text style={[s.sortTxt, { color: sort === opt.key ? C.bg : C.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={s.viewToggle}>
          {(['list', 'compact'] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                s.viewBtn,
                { borderColor: C.border },
                viewMode === m && { backgroundColor: C.bgCardAlt, borderColor: C.borderGlow },
              ]}
              onPress={() => setViewMode(m)}
            >
              <Text style={[s.viewTxt, { color: viewMode === m ? C.accent : C.textMuted }]}>
                {m === 'list' ? 'List' : 'Compact'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {allTags.length > 0 && (
        <View style={s.tagRow}>
          <TouchableOpacity
            style={[
              s.tagChip,
              { borderColor: C.border, backgroundColor: !tagFilter ? C.accentDim : C.bgCard },
            ]}
            onPress={() => setTagFilter(null)}
          >
            <Text style={[s.tagChipTxt, { color: !tagFilter ? C.accent : C.textMuted }]}>All tags</Text>
          </TouchableOpacity>
          {allTags.slice(0, 8).map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                s.tagChip,
                { borderColor: C.border, backgroundColor: tagFilter === tag ? C.accentDim : C.bgCard },
              ]}
              onPress={() => setTagFilter(tagFilter === tag ? null : tag)}
            >
              <Text style={[s.tagChipTxt, { color: tagFilter === tag ? C.accent : C.textSecondary }]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        key={viewMode}
        numColumns={viewMode === 'compact' ? 2 : 1}
        columnWrapperStyle={viewMode === 'compact' ? s.gridRow : undefined}
        renderItem={({ item }) => (
          <View style={viewMode === 'compact' ? s.gridCell : undefined}>
            <NoteCard note={item} compact={viewMode === 'compact'} />
          </View>
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No notes found"
            subtitle={search ? 'Try another search' : 'Tap + to create your first note'}
          />
        }
        ListHeaderComponent={
          filtered.length > 0 ? (
            <Text style={[s.resultCount, { color: C.textMuted }]}>
              {filtered.length} note{filtered.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
      />
      <FAB mode="note" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statChip: { flex: 1, padding: 10, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLbl: { fontSize: 10, fontWeight: '600' },
  search: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  toolRow: { marginBottom: 4 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.md,
  },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1 },
  filterTxt: { fontSize: 12, fontWeight: '700' },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  sortLabel: { fontSize: 11, fontWeight: '700', marginRight: 4 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  sortTxt: { fontSize: 11, fontWeight: '700' },
  viewToggle: { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  viewTxt: { fontSize: 11, fontWeight: '700' },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagChipTxt: { fontSize: 11, fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 140 },
  gridRow: { gap: Spacing.sm },
  gridCell: { flex: 1 },
  resultCount: { fontSize: 12, marginBottom: 8, fontWeight: '600' },
});
