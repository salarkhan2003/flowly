import React from 'react';
import { StyleSheet, Text, View, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskItem } from '../../components/tasks/TaskItem';
import { ClayCard, EmptyState, ScreenHeader } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Project } from '../../types';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function CompletedScreen() {
  const { C } = useTheme();
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const isEmpty = completedTasks.length === 0 && completedProjects.length === 0;

  const sections = [
    { title: 'Completed Projects', data: completedProjects, renderItem: ({ item }: any) => <ProjectCardSimple project={item} /> },
    { title: 'Completed Tasks', data: completedTasks, renderItem: ({ item }: any) => <TaskItem task={item} /> },
  ] as any;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader
        showBack
        title="Completed"
        subtitle="Finished tasks & projects"
        badge={completedTasks.length + completedProjects.length}
      />

      {isEmpty ? (
        <EmptyState title="Nothing completed yet" subtitle="Finish tasks or projects to see them here." />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title, data } }) =>
            data.length > 0 ? (
              <View style={[s.sectionHeader, { backgroundColor: C.bg }]}>
                <View style={[s.sectionAccent, { backgroundColor: C.info }]} />
                <Text style={[s.sectionTitle, { color: C.textSecondary }]}>{title}</Text>
                <View style={[s.sectionCount, { backgroundColor: C.info + '18', borderColor: C.info + '40' }]}>
                  <Text style={[s.sectionCountTxt, { color: C.info }]}>{data.length}</Text>
                </View>
              </View>
            ) : null
          }
          contentContainerStyle={s.list}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function ProjectCardSimple({ project }: { project: Project }) {
  const { C } = useTheme();
  return (
    <TouchableOpacity onPress={() => router.push(`/projects/${project.id}` as any)} activeOpacity={0.8} style={{ marginBottom: Spacing.sm }}>
      <ClayCard style={s.projCard}>
        <View style={[s.projBar, { backgroundColor: project.color }]} />
        <View style={s.projBody}>
          <View style={s.projTop}>
            <View style={[s.projIcon, { backgroundColor: project.color + '20', borderColor: project.color + '40' }]}>
              <Text style={[s.projIconTxt, { color: project.color }]}>{project.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.projName, { color: C.textPrimary }]}>{project.name}</Text>
              <Text style={[s.projDate, { color: C.textMuted }]}>
                Completed {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : ''}
              </Text>
            </View>
            <View style={[s.doneBadge, { backgroundColor: C.info + '18', borderColor: C.info + '40' }]}>
              <Text style={[s.doneTxt, { color: C.info }]}>Done</Text>
            </View>
          </View>
        </View>
      </ClayCard>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  countPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  countTxt: { fontSize: 14, fontWeight: '700' },
  list: { padding: Spacing.md, paddingBottom: 140 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  sectionAccent: { width: 3, height: 16, borderRadius: 2 },
  sectionTitle: { flex: 1, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  sectionCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  sectionCountTxt: { fontSize: 11, fontWeight: '700' },
  projCard: { flexDirection: 'row', overflow: 'hidden' },
  projBar: { width: 4 },
  projBody: { flex: 1, padding: Spacing.md },
  projTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  projIcon: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  projIconTxt: { fontSize: 14, fontWeight: '800' },
  projName: { fontSize: 15, fontWeight: '700' },
  projDate: { fontSize: 11, marginTop: 2 },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  doneTxt: { fontSize: 10, fontWeight: '700' },
});
