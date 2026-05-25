import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyBriefCard } from '../../components/home/DailyBriefCard';
import { NoteCard } from '../../components/notes/NoteCard';
import { TaskItem } from '../../components/tasks/TaskItem';
import { FAB } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';
import { useNotesStore } from '../../stores/notesStore';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useAIStore } from '../../stores/aiStore';
import { generateDailyBrief } from '../../lib/ai';
import { format } from 'date-fns';

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 5) return 'Night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

// ─── Inline SVG-style icons ───────────────────────────────────────────────────

function ActiveIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

function NotesIconSm({ color }: { color: string }) {
  return (
    <View style={{ width: 14, height: 18 }}>
      <View style={{ flex: 1, borderWidth: 1.5, borderColor: color, borderRadius: 2, padding: 3, gap: 2 }}>
        <View style={{ height: 1.5, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ height: 1.5, backgroundColor: color, borderRadius: 1, width: '75%' }} />
        <View style={{ height: 1.5, backgroundColor: color, borderRadius: 1, width: '55%' }} />
      </View>
    </View>
  );
}

function DoneIconSm({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 6, height: 3.5, borderLeftWidth: 1.8, borderBottomWidth: 1.8, borderColor: color, transform: [{ rotate: '-45deg' }, { translateY: -0.5 }] }} />
      </View>
    </View>
  );
}

function ProjectIconSm({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <View style={{ width: 18, height: 7, borderRadius: 2, borderWidth: 1.5, borderColor: color }} />
      <View style={{ width: 14, height: 7, borderRadius: 2, borderWidth: 1.5, borderColor: color }} />
    </View>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 8, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: 1, width: 5, height: 5, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, Icon, onPress }: {
  label: string; value: number; color: string;
  Icon: React.ComponentType<{ color: string }>; onPress: () => void;
}) {
  const { C } = useTheme();
  return (
    <TouchableOpacity
      style={[sc.card, { backgroundColor: C.bgCard, borderColor: color + '35',
        shadowColor: color }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[sc.topBar, { backgroundColor: color }]} />
      <View style={[sc.shine, { backgroundColor: C.bgGlassLight }]} />
      <View style={sc.inner}>
        <View style={[sc.iconWrap, { backgroundColor: color + '18', borderColor: color + '35' }]}>
          <Icon color={color} />
        </View>
        <Text style={[sc.value, { color }]}>{value}</Text>
        <Text style={[sc.label, { color: C.textMuted }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 18, borderWidth: 1, overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  topBar: { height: 3 },
  shine: { position: 'absolute', top: 3, left: 0, right: 0, height: 1 },
  inner: { paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 7 },
  iconWrap: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─── Quick nav card ───────────────────────────────────────────────────────────

function QuickCard({ label, sub, color, onPress }: {
  label: string; sub: string; color: string; onPress: () => void;
}) {
  const { C } = useTheme();
  return (
    <TouchableOpacity
      style={[qc.card, { backgroundColor: C.bgCard, borderColor: color + '25' }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[qc.shine, { backgroundColor: C.bgGlassLight }]} />
      <View style={[qc.dot, { backgroundColor: color, shadowColor: color }]} />
      <Text style={[qc.label, { color: C.textPrimary }]}>{label}</Text>
      <View style={qc.footer}>
        <Text style={[qc.sub, { color: color }]}>{sub}</Text>
        <ArrowIcon color={color} />
      </View>
    </TouchableOpacity>
  );
}

const qc = StyleSheet.create({
  card: {
    width: '47.5%', borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md,
    gap: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 10,
  },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4 },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sub: { fontSize: 12, fontWeight: '600' },
});

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll, color }: { title: string; onSeeAll: () => void; color: string }) {
  const { C } = useTheme();
  return (
    <View style={sh.row}>
      <View style={[sh.accent, { backgroundColor: color }]} />
      <Text style={[sh.title, { color: C.textPrimary }]}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} style={[sh.btn, { borderColor: color + '40', backgroundColor: color + '12' }]}>
        <Text style={[sh.btnTxt, { color }]}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm },
  accent: { width: 3, height: 18, borderRadius: 2 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  btn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  btnTxt: { fontSize: 11, fontWeight: '700' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { C } = useTheme();
  const { user } = useAuthStore();
  const { notes, loadNotes } = useNotesStore();
  const { tasks, loadTasks, getTodayTasks } = useTasksStore();
  const { projects, loadProjects } = useProjectsStore();
  const { dailyBrief, setDailyBrief } = useAIStore();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    if (user?.id) { loadNotes(user.id); loadTasks(user.id); loadProjects(user.id); }
  }, [user?.id]);

  useEffect(() => {
    if (dailyBrief) return;
    const todayTasks = getTodayTasks();
    generateDailyBrief({
      tasks: todayTasks.map((t) => t.title).join(', ') || 'none',
      notes: notes.slice(0, 5).map((n) => n.title).join(', '),
      date: format(new Date(), 'EEEE, MMMM d'),
    }).then((text) => {
      setDailyBrief({
        greeting: `Good ${getTimeOfDay()}, ${firstName}`,
        summary: text,
        focus_tasks: todayTasks.slice(0, 3),
        insights: [],
        generated_at: new Date().toISOString(),
      });
    }).catch(() => {});
  }, [user?.id, notes.length, tasks.length]);

  const todayTasks = getTodayTasks().slice(0, 4);
  const recentNotes = notes.slice(0, 3);
  const today = format(new Date(), 'EEE, MMM d');
  const activeTasks = tasks.filter((t) => t.status !== 'done').length;
  const doneTodayCount = tasks.filter((t) => t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString()).length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={[s.dateText, { color: C.textMuted }]}>{today}</Text>
            <Text style={[s.greeting, { color: C.textSecondary }]}>
              Good {getTimeOfDay()},{'\n'}
              <Text style={[s.greetingName, { color: C.textPrimary }]}>{firstName}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[s.searchBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={() => router.push('/(tabs)/search')}
          >
            {/* Search icon */}
            <View style={[s.searchCircle, { borderColor: C.textSecondary }]} />
            <View style={[s.searchHandle, { backgroundColor: C.textSecondary }]} />
          </TouchableOpacity>
        </View>

        {/* ── Stat boxes ── */}
        <View style={s.statsRow}>
          <StatCard label="Active" value={activeTasks} color={C.accent} Icon={ActiveIcon} onPress={() => router.push('/(tabs)/tasks')} />
          <StatCard label="Notes" value={notes.length} color={C.info} Icon={NotesIconSm} onPress={() => router.push('/(tabs)/notes')} />
          <StatCard label="Done" value={doneTodayCount} color="#B44DFF" Icon={DoneIconSm} onPress={() => router.push('/(tabs)/completed')} />
          <StatCard label="Projects" value={projects.length} color={C.warning} Icon={ProjectIconSm} onPress={() => router.push('/(tabs)/projects')} />
        </View>

        {/* ── Quick nav ── */}
        <View style={s.quickGrid}>
          <QuickCard label="Notes" sub={`${notes.length} total`} color={C.info} onPress={() => router.push('/(tabs)/notes')} />
          <QuickCard label="Tasks" sub={`${activeTasks} active`} color={C.accent} onPress={() => router.push('/(tabs)/tasks')} />
          <QuickCard label="Projects" sub={`${projects.length} open`} color="#B44DFF" onPress={() => router.push('/(tabs)/projects')} />
          <QuickCard label="Calendar" sub="Schedule" color={C.warning} onPress={() => router.push('/(tabs)/calendar')} />
        </View>

        {/* ── Daily brief ── */}
        <DailyBriefCard />

        {/* ── Today's tasks ── */}
        {todayTasks.length > 0 && (
          <View style={s.section}>
            <SectionHeader title="Today's Focus" color={C.accent} onSeeAll={() => router.push('/(tabs)/tasks')} />
            {todayTasks.map((task) => <TaskItem key={task.id} task={task} />)}
          </View>
        )}

        {/* ── Recent notes ── */}
        {recentNotes.length > 0 && (
          <View style={s.section}>
            <SectionHeader title="Recent Notes" color={C.info} onSeeAll={() => router.push('/(tabs)/notes')} />
            {recentNotes.map((note) => <NoteCard key={note.id} note={note} compact />)}
          </View>
        )}

        {/* ── Projects ── */}
        {projects.slice(0, 3).length > 0 && (
          <View style={s.section}>
            <SectionHeader title="Projects" color="#B44DFF" onSeeAll={() => router.push('/(tabs)/projects')} />
            {projects.slice(0, 3).map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[s.projRow, { backgroundColor: C.bgCard, borderColor: C.border, borderLeftColor: project.color }]}
                onPress={() => router.push(`/projects/${project.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[s.shine, { backgroundColor: C.bgGlassLight }]} />
                <View style={[s.projIcon, { backgroundColor: project.color + '20' }]}>
                  <Text style={[s.projIconTxt, { color: project.color }]}>{project.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.projName, { color: C.textPrimary }]}>{project.name}</Text>
                  {project.description ? <Text style={[s.projDesc, { color: C.textMuted }]} numberOfLines={1}>{project.description}</Text> : null}
                </View>
                <View style={[s.projStatus, { backgroundColor: project.color + '18', borderColor: project.color + '40' }]}>
                  <Text style={[s.projStatusTxt, { color: project.color }]}>{project.status.replace('_', ' ')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>
      <FAB onPress={() => router.push('/modals/quick-capture')} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.lg },
  dateText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
  greeting: { fontSize: 17, fontWeight: '400', lineHeight: 26 },
  greetingName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  searchBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  searchCircle: { position: 'absolute', width: 13, height: 13, borderRadius: 6.5, borderWidth: 1.5, top: 10, left: 10 },
  searchHandle: { position: 'absolute', width: 6, height: 1.5, borderRadius: 1, bottom: 11, right: 10, transform: [{ rotate: '45deg' }] },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  projRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.lg, borderWidth: 1, borderLeftWidth: 3,
    padding: Spacing.md, marginBottom: Spacing.sm, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  shine: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  projIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  projIconTxt: { fontSize: 16, fontWeight: '800' },
  projName: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  projDesc: { fontSize: 12, marginTop: 2 },
  projStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  projStatusTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
