import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ClayCard } from '../../components/ui/ClayCard';
import { PriorityBadge, ScreenHeader } from '../../components/ui';
import { Radius, Spacing, Typography } from '../../constants/theme';
import {
  formatDueDate,
  formatDueTime,
  isOverdueDueDate,
  isSameCalendarDay,
  parseDueDate,
  toDateOnlyString,
} from '../../lib/dates';
import { useTheme } from '../../hooks/useTheme';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useAuthStore } from '../../stores/authStore';
import type { Task, TaskPriority } from '../../types';

type FilterMode = 'all' | 'tasks' | 'projects';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function priorityColor(priority: TaskPriority, C: ReturnType<typeof import('../../constants/theme').getColors>) {
  if (priority === 'high') return C.danger;
  if (priority === 'medium') return C.warning;
  if (priority === 'low') return C.info;
  return C.accent;
}

export default function CalendarScreen() {
  const { C } = useTheme();
  const { user } = useAuthStore();
  const { tasks, loadTasks } = useTasksStore();
  const { projects } = useProjectsStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<FilterMode>('all');

  useFocusEffect(
    useCallback(() => {
      if (user?.id) loadTasks(user.id);
    }, [user?.id, loadTasks])
  );

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
      }),
    [currentDate]
  );

  const scheduledTasks = useMemo(
    () => tasks.filter((t) => !!t.due_date?.trim()),
    [tasks]
  );

  const scheduledProjects = useMemo(
    () => projects.filter((p) => !!p.due_date?.trim()),
    [projects]
  );

  const getTasksForDay = useCallback(
    (day: Date) => scheduledTasks.filter((t) => isSameCalendarDay(t.due_date, day)),
    [scheduledTasks]
  );

  const getProjectsForDay = useCallback(
    (day: Date) => scheduledProjects.filter((p) => isSameCalendarDay(p.due_date, day)),
    [scheduledProjects]
  );

  const monthTaskCount = useMemo(
    () =>
      scheduledTasks.filter((t) => {
        const d = parseDueDate(t.due_date);
        return d && isSameMonth(d, currentDate);
      }).length,
    [scheduledTasks, currentDate]
  );

  const selectedTasks = getTasksForDay(selectedDate);
  const selectedProjects = getProjectsForDay(selectedDate);
  const overdueCount = selectedTasks.filter(
    (t) => t.status !== 'done' && isOverdueDueDate(t.due_date)
  ).length;

  const showTasks = filter !== 'projects';
  const showProjects = filter !== 'tasks';
  const visibleTasks = showTasks ? selectedTasks : [];
  const visibleProjects = showProjects ? selectedProjects : [];
  const isEmpty = visibleTasks.length === 0 && visibleProjects.length === 0;

  const goToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const addTaskForDay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/tasks/new',
      params: { due: toDateOnlyString(selectedDate) },
    } as never);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader showBack title="Calendar" subtitle="Tasks, deadlines & projects" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Stats row */}
        <View style={s.statsRow}>
          <ClayCard variant="alt" style={[s.statCard, { borderColor: C.borderGlow }]} glowing>
            <Text style={[s.statNum, { color: C.accent }]}>{scheduledTasks.length}</Text>
            <Text style={[s.statLbl, { color: C.textMuted }]}>Scheduled tasks</Text>
          </ClayCard>
          <ClayCard variant="alt" style={s.statCard}>
            <Text style={[s.statNum, { color: C.pastelPeach }]}>{monthTaskCount}</Text>
            <Text style={[s.statLbl, { color: C.textMuted }]}>This month</Text>
          </ClayCard>
          <ClayCard variant="alt" style={s.statCard}>
            <Text style={[s.statNum, { color: C.danger }]}>{overdueCount}</Text>
            <Text style={[s.statLbl, { color: C.textMuted }]}>Overdue today</Text>
          </ClayCard>
        </View>

        {/* Month navigation */}
        <ClayCard style={s.monthCard}>
          <View style={s.monthNav}>
            <TouchableOpacity
              onPress={() => setCurrentDate(subMonths(currentDate, 1))}
              style={[s.navBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
            >
              <Text style={[s.navTxt, { color: C.accent }]}>‹</Text>
            </TouchableOpacity>
            <View style={s.monthCenter}>
              <Text style={[s.monthTitle, { color: C.textPrimary }]}>
                {format(currentDate, 'MMMM yyyy')}
              </Text>
              <Text style={[s.monthSub, { color: C.textMuted }]}>
                Tap a day to see schedule
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setCurrentDate(addMonths(currentDate, 1))}
              style={[s.navBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}
            >
              <Text style={[s.navTxt, { color: C.accent }]}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.todayBtn, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
            onPress={goToday}
          >
            <Text style={[s.todayTxt, { color: C.accent }]}>Jump to today</Text>
          </TouchableOpacity>

          <View style={s.dayHeaders}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={[s.dayHeader, { color: C.textMuted }]}>
                {d}
              </Text>
            ))}
          </View>

          <View style={s.grid}>
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const dayProjects = getProjectsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, currentDate);
              const todayDay = isToday(day);
              const count = dayTasks.length + dayProjects.length;
              const hasOverdue = dayTasks.some(
                (t) => t.status !== 'done' && isOverdueDueDate(t.due_date)
              );

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[
                    s.dayCell,
                    isSelected && {
                      backgroundColor: C.accent,
                      shadowColor: C.accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.45,
                      shadowRadius: 10,
                      elevation: 8,
                    },
                    todayDay &&
                      !isSelected && {
                        backgroundColor: C.accentDim,
                        borderWidth: 1,
                        borderColor: C.borderGlow,
                      },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(day);
                  }}
                >
                  <Text
                    style={[
                      s.dayNum,
                      {
                        color: !inMonth
                          ? C.textMuted
                          : isSelected
                            ? C.bg
                            : todayDay
                              ? C.accent
                              : C.textPrimary,
                      },
                      (isSelected || todayDay) && { fontWeight: '800' },
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  {count > 0 && (
                    <View style={s.cellMeta}>
                      <View style={s.dots}>
                        {dayTasks.slice(0, 2).map((t, i) => (
                          <View
                            key={`t${t.id}${i}`}
                            style={[
                              s.dot,
                              {
                                backgroundColor: isSelected
                                  ? C.bg
                                  : priorityColor(t.priority, C),
                              },
                            ]}
                          />
                        ))}
                        {dayProjects.slice(0, 1).map((p) => (
                          <View
                            key={`p${p.id}`}
                            style={[
                              s.dot,
                              { backgroundColor: isSelected ? C.bg : p.color },
                            ]}
                          />
                        ))}
                      </View>
                      {count > 1 && (
                        <Text
                          style={[
                            s.countLbl,
                            { color: isSelected ? C.bg : C.textMuted },
                          ]}
                        >
                          {count}
                        </Text>
                      )}
                    </View>
                  )}
                  {hasOverdue && !isSelected && (
                    <View style={[s.overdueMark, { backgroundColor: C.danger }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={[s.legend, { borderTopColor: C.border }]}>
            <LegendDot color={C.danger} label="High" textColor={C.textMuted} />
            <LegendDot color={C.warning} label="Medium" textColor={C.textMuted} />
            <LegendDot color={C.accent} label="Task" textColor={C.textMuted} />
            <LegendDot color={C.pastelPeach} label="Project" textColor={C.textMuted} />
          </View>
        </ClayCard>

        {/* Filters */}
        <View style={s.filterRow}>
          {(['all', 'tasks', 'projects'] as FilterMode[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                s.filterChip,
                {
                  backgroundColor: filter === f ? C.accent : C.bgCard,
                  borderColor: filter === f ? C.accent : C.border,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  s.filterTxt,
                  { color: filter === f ? C.bg : C.textSecondary },
                ]}
              >
                {f === 'all' ? 'All' : f === 'tasks' ? 'Tasks' : 'Projects'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected day */}
        <ClayCard glowing={visibleTasks.length > 0} style={s.detail}>
          <View style={s.detailHdr}>
            <View style={{ flex: 1 }}>
              <Text style={[s.detailTitle, { color: C.textPrimary }]}>
                {format(selectedDate, 'EEEE')}
              </Text>
              <Text style={[s.detailDate, { color: C.textMuted }]}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: C.accent }]}
              onPress={addTaskForDay}
            >
              <Text style={[s.addBtnTxt, { color: C.bg }]}>+ Task</Text>
            </TouchableOpacity>
          </View>

          {isEmpty ? (
            <View style={s.emptyWrap}>
              <Text style={[s.empty, { color: C.textMuted }]}>
                Nothing scheduled — add a task with a due date
              </Text>
              <TouchableOpacity onPress={addTaskForDay}>
                <Text style={[s.emptyLink, { color: C.accent }]}>
                  Create task for this day
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {visibleTasks.map((task) => (
                <TaskRow key={task.id} task={task} C={C} />
              ))}
              {visibleProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[s.itemRow, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
                  onPress={() => router.push(`/projects/${project.id}` as never)}
                >
                  <View style={[s.itemDot, { backgroundColor: project.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.itemTitle, { color: C.textPrimary }]}>
                      {project.name}
                    </Text>
                    <Text style={[s.itemSub, { color: C.textMuted }]}>
                      Project · {project.status.replace('_', ' ')}
                    </Text>
                  </View>
                  <View
                    style={[
                      s.itemBadge,
                      {
                        backgroundColor: project.color + '22',
                        borderColor: project.color + '55',
                      },
                    ]}
                  >
                    <Text style={[s.itemBadgeTxt, { color: project.color }]}>P</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ClayCard>

        {/* Upcoming strip */}
        {scheduledTasks.length > 0 && (
          <ClayCard variant="alt" style={s.upcoming}>
            <Text style={[s.upcomingTitle, { color: C.textPrimary }]}>Coming up</Text>
            {scheduledTasks
              .filter((t) => t.status !== 'done')
              .sort((a, b) => {
                const da = parseDueDate(a.due_date)?.getTime() ?? 0;
                const db = parseDueDate(b.due_date)?.getTime() ?? 0;
                return da - db;
              })
              .slice(0, 5)
              .map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={s.upcomingRow}
                  onPress={() => router.push(`/tasks/${task.id}` as never)}
                >
                  <Text style={[s.upcomingDate, { color: C.accent }]}>
                    {formatDueDate(task.due_date, 'MMM d') ?? '—'}
                  </Text>
                  <Text
                    style={[s.upcomingName, { color: C.textPrimary }]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  <PriorityBadge priority={task.priority} />
                </TouchableOpacity>
              ))}
          </ClayCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendDot({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <View style={s.legendItem}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.legendLbl, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function TaskRow({ task, C }: { task: Task; C: ReturnType<typeof import('../../constants/theme').getColors> }) {
  const done = task.status === 'done';
  const overdue = !done && isOverdueDueDate(task.due_date);
  const time = formatDueTime(task.due_date);

  return (
    <TouchableOpacity
      style={[
        s.itemRow,
        {
          backgroundColor: C.bgCardAlt,
          borderColor: overdue ? C.danger + '55' : C.border,
        },
      ]}
      onPress={() => router.push(`/tasks/${task.id}` as never)}
    >
      <View
        style={[
          s.itemDot,
          { backgroundColor: priorityColor(task.priority, C) },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={[
            s.itemTitle,
            { color: C.textPrimary },
            done && { textDecorationLine: 'line-through', color: C.textMuted },
          ]}
        >
          {task.title}
        </Text>
        <Text style={[s.itemSub, { color: C.textMuted }]}>
          {overdue ? 'Overdue · ' : ''}
          {task.priority} priority
          {time ? ` · ${time}` : ''}
        </Text>
      </View>
      <PriorityBadge priority={task.priority} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 140, gap: Spacing.md, paddingHorizontal: Spacing.md },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.sm },
  statCard: { flex: 1, padding: 12, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  monthCard: { padding: Spacing.md, gap: 12 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTxt: { fontSize: 22, fontWeight: '800' },
  monthCenter: { flex: 1, alignItems: 'center' },
  monthTitle: { ...Typography.headingLg, fontWeight: '800' },
  monthSub: { ...Typography.caption, marginTop: 2 },
  todayBtn: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  todayTxt: { fontSize: 13, fontWeight: '700' },
  dayHeaders: { flexDirection: 'row', marginTop: 4 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    gap: 3,
    paddingVertical: 4,
  },
  dayNum: { fontSize: 15, fontWeight: '500' },
  cellMeta: { alignItems: 'center', gap: 2 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  countLbl: { fontSize: 9, fontWeight: '700' },
  overdueMark: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLbl: { fontSize: 10, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTxt: { fontSize: 13, fontWeight: '700' },
  detail: { padding: Spacing.md, gap: 10 },
  detailHdr: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailTitle: { ...Typography.headingMd, fontWeight: '800' },
  detailDate: { ...Typography.bodySm, marginTop: 2 },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addBtnTxt: { fontSize: 13, fontWeight: '800' },
  emptyWrap: { alignItems: 'center', gap: 8, paddingVertical: Spacing.md },
  empty: { ...Typography.bodyMd, textAlign: 'center', fontStyle: 'italic' },
  emptyLink: { ...Typography.bodyMd, fontWeight: '700' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  itemDot: { width: 8, height: 8, borderRadius: 4 },
  itemTitle: { ...Typography.bodyMd, fontWeight: '600' },
  itemSub: { ...Typography.bodySm, marginTop: 2 },
  itemBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeTxt: { fontSize: 10, fontWeight: '800' },
  upcoming: { padding: Spacing.md, gap: 10 },
  upcomingTitle: { ...Typography.headingSm, fontWeight: '800' },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  upcomingDate: { fontSize: 12, fontWeight: '800', width: 48 },
  upcomingName: { flex: 1, fontSize: 14, fontWeight: '600' },
});
