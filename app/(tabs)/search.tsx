import React, { useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayCard } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { SearchResult, SearchResultType } from '../../types';

const TYPE_COLORS: Record<SearchResultType, string> = {
  note: '#4D9FFF',
  task: '#00B86B',
  project: '#B44DFF',
  event: '#FFB830',
};

function NoteIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 12, height: 14 }}>
      <View style={{ flex: 1, borderWidth: 1.5, borderColor: color, borderRadius: 2, padding: 2, gap: 2 }}>
        <View style={{ height: 1, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ height: 1, backgroundColor: color, borderRadius: 1, width: '70%' }} />
      </View>
    </View>
  );
}

function TaskIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 5, height: 3, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: color, transform: [{ rotate: '-45deg' }, { translateY: -0.5 }] }} />
    </View>
  );
}

function ProjectIcon({ color }: { color: string }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ width: 14, height: 5, borderRadius: 1.5, borderWidth: 1.5, borderColor: color }} />
      <View style={{ width: 10, height: 5, borderRadius: 1.5, borderWidth: 1.5, borderColor: color }} />
    </View>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 13, height: 13, borderRadius: 6.5, borderWidth: 2, borderColor: color, position: 'absolute', top: 0, left: 0 }} />
      <View style={{ position: 'absolute', bottom: 1, right: 1, width: 6, height: 2, backgroundColor: color, borderRadius: 1, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

export default function SearchScreen() {
  const { C } = useTheme();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { notes } = useNotesStore();
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();

  const results: SearchResult[] = query.trim().length < 2 ? [] : [
    ...notes
      .filter((n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
      .map((n): SearchResult => ({ id: n.id, type: 'note', title: n.title || 'Untitled', excerpt: n.content.replace(/[#*`>\-]/g, '').slice(0, 80), score: 1, item: n })),
    ...tasks
      .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
      .map((t): SearchResult => ({ id: t.id, type: 'task', title: t.title, excerpt: t.description ?? '', score: 1, item: t })),
    ...projects
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .map((p): SearchResult => ({ id: p.id, type: 'project', title: p.name, excerpt: p.description ?? '', score: 1, item: p })),
  ];

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'note': router.push(`/notes/${result.id}` as any); break;
      case 'task': router.push(`/tasks/${result.id}` as any); break;
      case 'project': router.push(`/projects/${result.id}` as any); break;
    }
  };

  const typeIcon = (type: SearchResultType, color: string) => {
    if (type === 'note') return <NoteIcon color={color} />;
    if (type === 'task') return <TaskIcon color={color} />;
    return <ProjectIcon color={color} />;
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { color: C.textPrimary }]}>Search</Text>
        </View>

        {/* Search input — NOT using GlowInput to avoid focus issues */}
        <View style={[s.inputWrap, { backgroundColor: C.bgCard, borderColor: C.borderGlow }]}>
          <View style={s.searchIconWrap}>
            <SearchIcon color={C.textMuted} />
          </View>
          <TextInput
            ref={inputRef}
            style={[s.input, { color: C.textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search notes, tasks, projects..."
            placeholderTextColor={C.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); inputRef.current?.focus(); }} style={s.clearBtn}>
              <View style={[s.clearCircle, { backgroundColor: C.textMuted }]}>
                <View style={[s.clearX1, { backgroundColor: C.bg }]} />
                <View style={[s.clearX2, { backgroundColor: C.bg }]} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Result count */}
        {query.length >= 2 && (
          <Text style={[s.resultCount, { color: C.textMuted }]}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </Text>
        )}

        <FlatList
          data={query.length < 2 ? [] : results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={s.list}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              {query.length < 2 ? (
                <>
                  <View style={[s.emptyIcon, { backgroundColor: C.accentSoft, borderColor: C.borderGlow }]}>
                    <SearchIcon color={C.accent} />
                  </View>
                  <Text style={[s.emptyTitle, { color: C.textPrimary }]}>Search everything</Text>
                  <Text style={[s.emptySub, { color: C.textMuted }]}>Notes, tasks, and projects</Text>
                  {/* Quick stats */}
                  <View style={s.statsRow}>
                    {[
                      { label: 'Notes', count: notes.length, color: TYPE_COLORS.note },
                      { label: 'Tasks', count: tasks.length, color: TYPE_COLORS.task },
                      { label: 'Projects', count: projects.length, color: TYPE_COLORS.project },
                    ].map((item) => (
                      <View key={item.label} style={[s.statPill, { backgroundColor: item.color + '15', borderColor: item.color + '40' }]}>
                        <View style={[s.statDot, { backgroundColor: item.color }]} />
                        <Text style={[s.statTxt, { color: item.color }]}>{item.count} {item.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={[s.emptyIcon, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                    <SearchIcon color={C.textMuted} />
                  </View>
                  <Text style={[s.emptyTitle, { color: C.textPrimary }]}>No results</Text>
                  <Text style={[s.emptySub, { color: C.textMuted }]}>Nothing found for "{query}"</Text>
                </>
              )}
            </View>
          }
          renderItem={({ item: result }) => {
            const color = TYPE_COLORS[result.type];
            return (
              <TouchableOpacity onPress={() => handleResultPress(result)} activeOpacity={0.8}>
                <ClayCard style={s.resultCard}>
                  {/* Color left bar */}
                  <View style={[s.resultBar, { backgroundColor: color }]} />
                  <View style={s.resultBody}>
                    <View style={s.resultTop}>
                      <View style={[s.typePill, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                        {typeIcon(result.type, color)}
                        <Text style={[s.typeLabel, { color }]}>{result.type}</Text>
                      </View>
                    </View>
                    <Text style={[s.resultTitle, { color: C.textPrimary }]} numberOfLines={1}>{result.title}</Text>
                    {result.excerpt ? (
                      <Text style={[s.resultExcerpt, { color: C.textSecondary }]} numberOfLines={2}>{result.excerpt}</Text>
                    ) : null}
                  </View>
                </ClayCard>
              </TouchableOpacity>
            );
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, borderWidth: 1.5, minHeight: 52,
    shadowColor: '#00B86B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  searchIconWrap: { paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 15, fontWeight: '400' },
  clearBtn: { paddingRight: 14 },
  clearCircle: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  clearX1: { position: 'absolute', width: 10, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 10, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  resultCount: { fontSize: 12, fontWeight: '600', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  list: { padding: Spacing.md, paddingBottom: 140, gap: 10 },
  emptyWrap: { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  emptySub: { fontSize: 14, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statTxt: { fontSize: 12, fontWeight: '600' },
  resultCard: { flexDirection: 'row', overflow: 'hidden' },
  resultBar: { width: 3 },
  resultBody: { flex: 1, padding: Spacing.md, gap: 6 },
  resultTop: { flexDirection: 'row' },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  typeLabel: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  resultTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  resultExcerpt: { fontSize: 13, lineHeight: 20 },
});
