import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskItem } from '../../components/tasks/TaskItem';
import { EmptyState, FAB, ScreenHeader } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useTasksStore } from '../../stores/tasksStore';
import { useScreenAnalytics } from '../../hooks/useScreenAnalytics';
import { Task, TaskStatus } from '../../types';

type ViewMode = 'list' | 'kanban';
type SmartList = 'all' | 'today' | 'overdue' | 'starred';

const SMART_LISTS: { key: SmartList; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'starred', label: 'Starred' },
];

function ListIcon({ color }: { color: string }) {
  return (
    <View style={{ gap: 3 }}>
      {[1, 0.7, 0.5].map((op, i) => (
        <View key={i} style={{ width: 14, height: 1.5, backgroundColor: color, borderRadius: 1, opacity: op }} />
      ))}
    </View>
  );
}

function KanbanIcon({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 0.7, 0.5].map((op, i) => (
        <View key={i} style={{ width: 4, height: 14, backgroundColor: color, borderRadius: 1, opacity: op }} />
      ))}
    </View>
  );
}

export default function TasksScreen() {
  useScreenAnalytics('Tasks');
  const { C } = useTheme();
  const { tasks, getTodayTasks, getOverdueTasks } = useTasksStore();
  const [view, setView] = useState<ViewMode>('list');
  const [smartList, setSmartList] = useState<SmartList>('all');

  const KANBAN_COLS: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: C.textMuted },
    { status: 'in_progress', label: 'In Progress', color: C.warning },
    { status: 'done', label: 'Done', color: C.accent },
  ];

  const getFiltered = (): Task[] => {
    switch (smartList) {
      case 'today': return getTodayTasks();
      case 'overdue': return getOverdueTasks();
      case 'starred': return tasks.filter((t) => t.is_starred);
      default: return tasks.filter((t) => t.status !== 'done');
    }
  };

  const activeTasks = tasks.filter((t) => t.status !== 'done').length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader title="Tasks" subtitle={`${activeTasks} active`} badge={activeTasks} />
      <View style={s.viewRow}>
        <View style={[s.viewToggle, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          {(['list', 'kanban'] as ViewMode[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[s.toggleBtn, view === v && { backgroundColor: C.accentDim }]}
              onPress={() => setView(v)}
            >
              {v === 'list' ? <ListIcon color={view === v ? C.accent : C.textMuted} /> : <KanbanIcon color={view === v ? C.accent : C.textMuted} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Smart filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {SMART_LISTS.map((sl) => (
          <TouchableOpacity
            key={sl.key}
            style={[s.filterBtn, { borderColor: C.border, backgroundColor: C.bgCard },
              smartList === sl.key && { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
            onPress={() => setSmartList(sl.key)}
          >
            <Text style={[s.filterTxt, { color: smartList === sl.key ? C.accent : C.textSecondary }]}>
              {sl.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {view === 'list' ? (
        <FlatList
          data={getFiltered()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="All clear" subtitle="No tasks here." />}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={s.kanban}>
            {KANBAN_COLS.map((col) => (
              <View key={col.status} style={[s.kanbanCol, { backgroundColor: C.bgCard, borderColor: col.color + '30' }]}>
                <View style={[s.kanbanHeader, { borderBottomColor: col.color + '30' }]}>
                  <View style={[s.kanbanDot, { backgroundColor: col.color }]} />
                  <Text style={[s.kanbanTitle, { color: col.color }]}>{col.label}</Text>
                  <View style={[s.kanbanCount, { backgroundColor: col.color + '20' }]}>
                    <Text style={[s.kanbanCountTxt, { color: col.color }]}>
                      {tasks.filter((t) => t.status === col.status).length}
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={tasks.filter((t) => t.status === col.status)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <TaskItem task={item} />}
                  scrollEnabled={false}
                  contentContainerStyle={{ padding: Spacing.sm }}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <FAB mode="task" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  viewRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  viewToggle: { flexDirection: 'row', gap: 2, borderRadius: Radius.md, padding: 4, borderWidth: 1 },
  toggleBtn: { padding: 8, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { maxHeight: 46 },
  filterContent: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1 },
  filterTxt: { fontSize: 13, fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 140 },
  kanban: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm },
  kanbanCol: { width: 270, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  kanbanHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md, borderBottomWidth: 1 },
  kanbanDot: { width: 8, height: 8, borderRadius: 4 },
  kanbanTitle: { flex: 1, fontSize: 13, fontWeight: '700' },
  kanbanCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  kanbanCountTxt: { fontSize: 11, fontWeight: '700' },
});
