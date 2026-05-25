import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { GlowButton, ClayCard, DatePicker } from '../../components/ui';
import { TaskItem } from '../../components/tasks/TaskItem';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useProjectsStore } from '../../stores/projectsStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useAuthStore } from '../../stores/authStore';
import { Project, ProjectStatus } from '../../types';

const PROJECT_COLORS = ['#00B86B', '#2563EB', '#E53E5A', '#D97706', '#8833CC', '#FF6B35'];
const PROJECT_ICONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const STATUSES: ProjectStatus[] = ['active', 'on_hold', 'completed', 'archived'];

export default function ProjectDetailScreen() {
  const { C } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addProject, updateProject, deleteProject, getProjectById } = useProjectsStore();
  const { getTasksByProject } = useTasksStore();
  const { user } = useAuthStore();
  const isNew = id === 'new';
  const existing = isNew ? null : getProjectById(id);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [color, setColor] = useState(existing?.color ?? PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(existing?.icon ?? PROJECT_ICONS[0]);
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? 'active');
  const [dueDate, setDueDate] = useState(existing?.due_date ?? '');
  const projectTasks = isNew ? [] : getTasksByProject(id);

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    if (isNew) {
      await addProject({ id: `proj_${Date.now()}`, user_id: user.id, name: name.trim(), description, color, icon, status, due_date: dueDate || undefined, task_ids: [], note_ids: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Project);
    } else { await updateProject(id, { name, description, color, icon, status, due_date: dueDate || undefined }); }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Project', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { if (!isNew) await deleteProject(id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border, backgroundColor: C.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={[s.backArrow, { borderColor: C.accent }]} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: C.textPrimary }]}>{isNew ? 'New Project' : 'Edit Project'}</Text>
        {!isNew ? (
          <TouchableOpacity onPress={handleDelete} style={[s.delBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + '40' }]}>
            <Text style={[s.delTxt, { color: C.danger }]}>Delete</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Name + icon preview */}
        <View style={s.nameRow}>
          <View style={[s.iconPreview, { backgroundColor: color + '22', borderColor: color + '60' }]}>
            <Text style={[s.iconPreviewText, { color }]}>{icon}</Text>
          </View>
          <TextInput style={[s.nameInput, { color: C.textPrimary, borderBottomColor: C.border }]} value={name} onChangeText={setName} placeholder="Project name..." placeholderTextColor={C.textMuted} />
        </View>

        <TextInput style={[s.descInput, { color: C.textSecondary }]} value={description} onChangeText={setDescription} placeholder="Description (optional)" placeholderTextColor={C.textMuted} multiline />

        {/* Color */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>COLOR</Text>
            <View style={s.colorRow}>
              {PROJECT_COLORS.map((c) => (
                <TouchableOpacity key={c} style={[s.colorDot, { backgroundColor: c }, color === c && { borderWidth: 3, borderColor: C.textPrimary }]} onPress={() => setColor(c)} />
              ))}
            </View>
          </View>
        </ClayCard>

        {/* Icon */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>ICON LETTER</Text>
            <View style={s.iconRow}>
              {PROJECT_ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[s.iconBtn, { borderColor: color + '40', backgroundColor: icon === ic ? color + '20' : 'transparent' }, icon === ic && { borderColor: color }]} onPress={() => setIcon(ic)}>
                  <Text style={[s.iconBtnText, { color: icon === ic ? color : C.textMuted }]}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ClayCard>

        {/* Status */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>STATUS</Text>
            <View style={s.statusRow}>
              {STATUSES.map((st) => (
                <TouchableOpacity key={st} style={[s.statusBtn, { borderColor: C.border }, status === st && { backgroundColor: C.accentDim, borderColor: C.borderGlow }]} onPress={() => setStatus(st)}>
                  <Text style={[s.statusText, { color: status === st ? C.accent : C.textSecondary }]}>{st.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ClayCard>

        {/* Due date */}
        <ClayCard style={s.fieldCard}>
          <View style={[s.fieldContent, { backgroundColor: C.bgCard }]}>
            <Text style={[s.fieldLabel, { color: C.textMuted }]}>DEADLINE</Text>
            <DatePicker value={dueDate} onChange={setDueDate} placeholder="Pick date & time" showTime />
          </View>
        </ClayCard>

        {!isNew && projectTasks.length > 0 && (
          <View style={s.tasksSection}>
            <Text style={[s.tasksSectionTitle, { color: C.textPrimary }]}>Tasks ({projectTasks.length})</Text>
            {projectTasks.map((task) => <TaskItem key={task.id} task={task} />)}
          </View>
        )}

        <GlowButton label={isNew ? 'Create Project' : 'Save Changes'} onPress={handleSave} size="lg" style={s.saveBtn} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backArrow: { width: 8, height: 8, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }, { translateX: 2 }] },
  headerTitle: { ...Typography.headingMd, flex: 1, textAlign: 'center', fontWeight: '700' },
  delBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  delTxt: { fontSize: 12, fontWeight: '600' },
  content: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 80 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm },
  iconPreview: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  iconPreviewText: { fontSize: 22, fontWeight: '800' },
  nameInput: { flex: 1, ...Typography.displaySm, fontWeight: '700', borderBottomWidth: 1, paddingBottom: 8 },
  descInput: { ...Typography.bodyLg, minHeight: 60, marginBottom: Spacing.sm },
  fieldCard: { marginBottom: 0 },
  fieldContent: { padding: Spacing.md, gap: 10 },
  fieldLabel: { ...Typography.caption },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16, fontWeight: '800' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  tasksSection: { gap: 8 },
  tasksSectionTitle: { fontSize: 16, fontWeight: '700' },
  saveBtn: { marginTop: Spacing.sm },
});
