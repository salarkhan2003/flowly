import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JoinTeamBanner } from '../../components/community/JoinTeamBanner';
import { DailyBriefCard } from '../../components/home/DailyBriefCard';
import { NoteCard } from '../../components/notes/NoteCard';
import { TaskItem } from '../../components/tasks/TaskItem';
import { ClayCard } from '../../components/ui/ClayCard';
import { FAB } from '../../components/ui';
import { Radius, Spacing } from '../../constants/theme';
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

function HubTile({
  label,
  sub,
  color,
  letter,
  onPress,
}: {
  label: string;
  sub: string;
  color: string;
  letter: string;
  onPress: () => void;
}) {
  const { C, mode } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.hubTileWrap}>
      <ClayCard style={[styles.hubTile, { borderColor: color + (mode === 'light' ? '60' : '35') }]}>
        <View style={[styles.hubIcon, { backgroundColor: color + (mode === 'light' ? '50' : '28') }]}>
          <Text style={[styles.hubLetter, { color: C.textPrimary }]}>{letter}</Text>
        </View>
        <Text style={[styles.hubLabel, { color: C.textPrimary }]}>{label}</Text>
        <Text style={[styles.hubSub, { color: C.textMuted }]}>{sub}</Text>
      </ClayCard>
    </TouchableOpacity>
  );
}

function StatPill({
  label,
  value,
  color,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  onPress: () => void;
}) {
  const { C } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.statPill, { backgroundColor: C.bgCard, borderColor: color + '40' }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: C.textMuted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { C } = useTheme();
  const { user } = useAuthStore();
  const { notes, loadNotes } = useNotesStore();
  const { tasks, loadTasks, getTodayTasks } = useTasksStore();
  const { projects, loadProjects } = useProjectsStore();
  const { dailyBrief, setDailyBrief } = useAIStore();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    if (user?.id) {
      loadNotes(user.id);
      loadTasks(user.id);
      loadProjects(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (dailyBrief) return;
    const todayTasks = getTodayTasks();
    generateDailyBrief({
      tasks: todayTasks.map((t) => t.title).join(', ') || 'none',
      notes: notes.slice(0, 5).map((n) => n.title).join(', '),
      date: format(new Date(), 'EEEE, MMMM d'),
    })
      .then((text) => {
        setDailyBrief({
          greeting: `Good ${getTimeOfDay()}, ${firstName}`,
          summary: text,
          focus_tasks: todayTasks.slice(0, 3),
          insights: [],
          generated_at: new Date().toISOString(),
        });
      })
      .catch(() => {});
  }, [user?.id, notes.length, tasks.length]);

  const todayTasks = getTodayTasks().slice(0, 4);
  const recentNotes = notes.slice(0, 2);
  const today = format(new Date(), 'EEE, MMM d');
  const activeTasks = tasks.filter((t) => t.status !== 'done').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.date, { color: C.textMuted }]}>{today}</Text>
            <Text style={[styles.hello, { color: C.textSecondary }]}>
              Good {getTimeOfDay()},
            </Text>
            <Text style={[styles.name, { color: C.textPrimary }]}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={() => router.push('/hub/search')}
          >
            <View style={[styles.searchRing, { borderColor: C.textSecondary }]} />
          </TouchableOpacity>
        </View>

        <JoinTeamBanner />

        <View style={styles.statsRow}>
          <StatPill label="Tasks" value={activeTasks} color={C.pastelMint} onPress={() => router.push('/(tabs)/tasks')} />
          <StatPill label="Notes" value={notes.length} color={C.pastelSky} onPress={() => router.push('/(tabs)/notes')} />
          <StatPill label="Done" value={doneCount} color={C.pastelLavender} onPress={() => router.push('/hub/completed')} />
          <StatPill label="Projects" value={projects.length} color={C.pastelPeach} onPress={() => router.push('/hub/projects')} />
        </View>

        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Explore</Text>
        <View style={styles.hubGrid}>
          <HubTile label="Calendar" sub="Schedule" letter="C" color={C.pastelPeach} onPress={() => router.push('/hub/calendar')} />
          <HubTile label="Projects" sub={`${projects.length} active`} letter="P" color={C.pastelLavender} onPress={() => router.push('/hub/projects')} />
          <HubTile label="AI Chat" sub="Ask Flowly" letter="AI" color={C.pastelSky} onPress={() => router.push('/(tabs)/ai')} />
          <HubTile label="Completed" sub="Archive" letter="✓" color={C.pastelMint} onPress={() => router.push('/hub/completed')} />
        </View>

        <DailyBriefCard />

        {todayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Today</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
                <Text style={[styles.seeAll, { color: C.accent }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        )}

        {recentNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Recent notes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/notes')}>
                <Text style={[styles.seeAll, { color: C.accent }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} compact />
            ))}
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>
      <FAB mode="picker" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  date: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  hello: { fontSize: 16, marginTop: 4 },
  name: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  searchRing: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: Spacing.sm },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  seeAll: { fontSize: 13, fontWeight: '700' },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  hubTileWrap: { width: '47.5%' },
  hubTile: { padding: Spacing.md, gap: 8 },
  hubIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubLetter: { fontSize: 18, fontWeight: '800' },
  hubLabel: { fontSize: 15, fontWeight: '700' },
  hubSub: { fontSize: 11 },
  section: { marginBottom: Spacing.lg },
});
