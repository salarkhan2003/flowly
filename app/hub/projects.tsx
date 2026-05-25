import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { showConfirm } from '../../lib/alert';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClayCard, EmptyState, FAB, GlowButton, ScreenHeader } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { Project } from '../../types';
import * as Haptics from 'expo-haptics';

export default function ProjectsScreen() {
  const { C } = useTheme();
  const { projects } = useProjectsStore();
  const { getTasksByProject } = useTasksStore();

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader showBack title="Projects" subtitle={`${projects.length} workspaces`} badge={projects.length} />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjectCard project={item} taskCount={getTasksByProject(item.id).length} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No projects yet"
            subtitle="Create a project to organize your work"
            action={<GlowButton label="New Project" onPress={() => router.push('/projects/new')} />}
          />
        }
      />
      <FAB mode="project" />
    </SafeAreaView>
  );
}

function ProjectCard({ project, taskCount }: { project: Project; taskCount: number }) {
  const { C } = useTheme();
  const { deleteProject } = useProjectsStore();

  const statusColors: Record<string, string> = {
    active: C.accent, on_hold: C.warning, completed: C.info, archived: C.textMuted,
  };
  const color = statusColors[project.status] ?? C.accent;

  const handleDelete = () => {
    showConfirm({
      title: 'Delete project',
      message: `Remove "${project.name}"? This cannot be undone.`,
      destructive: true,
      confirmLabel: 'Delete',
      onConfirm: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        deleteProject(project.id);
      },
    });
  };

  return (
    <TouchableOpacity onPress={() => router.push(`/projects/${project.id}` as any)} activeOpacity={0.8}>
      <ClayCard style={s.card}>
        {/* Color bar */}
        <View style={[s.colorBar, { backgroundColor: project.color }]} />
        <View style={s.cardBody}>
          {/* Top row */}
          <View style={s.cardTop}>
            <View style={[s.iconWrap, { backgroundColor: project.color + '20', borderColor: project.color + '40' }]}>
              <Text style={[s.iconTxt, { color: project.color }]}>{project.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.projName, { color: C.textPrimary }]}>{project.name}</Text>
              {project.description ? (
                <Text style={[s.projDesc, { color: C.textSecondary }]} numberOfLines={1}>{project.description}</Text>
              ) : null}
            </View>
            <View style={[s.statusBadge, { backgroundColor: color + '18', borderColor: color + '40' }]}>
              <Text style={[s.statusTxt, { color }]}>{project.status.replace('_', ' ')}</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={s.meta}>
            <View style={[s.metaPill, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
              <View style={[s.metaDot, { backgroundColor: C.textMuted }]} />
              <Text style={[s.metaTxt, { color: C.textMuted }]}>{taskCount} tasks</Text>
            </View>
            {project.due_date && (
              <View style={[s.metaPill, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}>
                <View style={[s.metaDot, { backgroundColor: C.warning }]} />
                <Text style={[s.metaTxt, { color: C.textMuted }]}>
                  Due {new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={[s.footer, { borderTopColor: C.border }]}>
            <TouchableOpacity
              style={[s.editBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
              onPress={() => { Haptics.selectionAsync(); router.push(`/projects/${project.id}` as any); }}
            >
              <Text style={[s.editTxt, { color: C.accent }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.delBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + '40' }]}
              onPress={handleDelete}
            >
              <Text style={[s.delTxt, { color: C.danger }]}>Delete</Text>
            </TouchableOpacity>
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
  card: { marginBottom: Spacing.sm, flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 4 },
  cardBody: { flex: 1, padding: Spacing.md, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 16, fontWeight: '800' },
  projName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  projDesc: { fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  statusTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  meta: { flexDirection: 'row', gap: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  metaDot: { width: 5, height: 5, borderRadius: 2.5 },
  metaTxt: { fontSize: 11, fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  editTxt: { fontSize: 12, fontWeight: '700' },
  delBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  delTxt: { fontSize: 12, fontWeight: '700' },
});
