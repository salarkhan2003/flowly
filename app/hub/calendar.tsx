import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useTasksStore } from '../../stores/tasksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths,
} from 'date-fns';

export default function CalendarScreen() {
  const { C } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
  });

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), day));

  const getProjectsForDay = (day: Date) =>
    projects.filter((p) => p.due_date && isSameDay(new Date(p.due_date), day));

  const selectedTasks = getTasksForDay(selectedDate);
  const selectedProjects = getProjectsForDay(selectedDate);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]}>
      <ScreenHeader showBack title="Calendar" subtitle="Tasks & project dates" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))} style={s.navBtn}>
            <Text style={[s.navTxt, { color: C.accent }]}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={[s.monthTitle, { color: C.textPrimary }]}>{format(currentDate, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))} style={s.navBtn}>
            <Text style={[s.navTxt, { color: C.accent }]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={s.dayHeaders}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <Text key={d} style={[s.dayHeader, { color: C.textMuted }]}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        <View style={s.grid}>
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const dayProjects = getProjectsForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, currentDate);
            const todayDay = isToday(day);
            const hasItems = dayTasks.length > 0 || dayProjects.length > 0;

            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[
                  s.dayCell,
                  isSelected && { backgroundColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
                  todayDay && !isSelected && { backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.borderGlow },
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[
                  s.dayNum,
                  { color: !inMonth ? C.textMuted : isSelected ? C.bg : todayDay ? C.accent : C.textPrimary },
                  (isSelected || todayDay) && { fontWeight: '700' },
                ]}>
                  {format(day, 'd')}
                </Text>
                {hasItems && (
                  <View style={s.dots}>
                    {dayTasks.slice(0, 2).map((t, i) => (
                      <View key={`t${i}`} style={[s.dot, { backgroundColor: t.priority === 'high' ? C.danger : t.priority === 'medium' ? C.warning : C.accent }]} />
                    ))}
                    {dayProjects.slice(0, 1).map((_, i) => (
                      <View key={`p${i}`} style={[s.dot, { backgroundColor: C.pastelPeach }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected day detail */}
        <View style={[s.detail, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[s.detailTitle, { color: C.textPrimary }]}>{format(selectedDate, 'EEEE, MMMM d')}</Text>

          {selectedTasks.length === 0 && selectedProjects.length === 0 ? (
            <Text style={[s.empty, { color: C.textMuted }]}>Nothing scheduled</Text>
          ) : (
            <>
              {selectedTasks.map((task) => (
                <TouchableOpacity key={task.id} style={s.itemRow} onPress={() => router.push(`/tasks/${task.id}` as any)}>
                  <View style={[s.itemDot, { backgroundColor: task.priority === 'high' ? C.danger : task.priority === 'medium' ? C.warning : C.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.itemTitle, { color: C.textPrimary }, task.status === 'done' && { textDecorationLine: 'line-through', color: C.textMuted }]}>{task.title}</Text>
                    <Text style={[s.itemSub, { color: C.textMuted }]}>
                      Task · {task.priority} priority
                      {task.due_date && (() => {
                        const d = new Date(task.due_date);
                        const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
                        return hasTime ? ` · ${format(d, 'h:mm a')}` : '';
                      })()}
                    </Text>
                  </View>
                  <View style={[s.itemBadge, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
                    <Text style={[s.itemBadgeTxt, { color: C.accent }]}>T</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {selectedProjects.map((project) => (
                <TouchableOpacity key={project.id} style={s.itemRow} onPress={() => router.push(`/projects/${project.id}` as any)}>
                  <View style={[s.itemDot, { backgroundColor: project.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.itemTitle, { color: C.textPrimary }]}>{project.name}</Text>
                    <Text style={[s.itemSub, { color: C.textMuted }]}>Project · {project.status.replace('_', ' ')}</Text>
                  </View>
                  <View style={[s.itemBadge, { backgroundColor: project.color + '20', borderColor: project.color + '40' }]}>
                    <Text style={[s.itemBadgeTxt, { color: project.color }]}>P</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  navBtn: { padding: 8 },
  navTxt: { fontSize: 22, fontWeight: '700' },
  monthTitle: { ...Typography.headingLg, fontWeight: '700' },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: Spacing.sm, marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', ...Typography.caption },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 0.85, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, gap: 2 },
  dayNum: { ...Typography.bodyMd, fontWeight: '500' },
  dots: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  detail: { margin: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  detailTitle: { ...Typography.headingSm, fontWeight: '700', marginBottom: 4 },
  empty: { ...Typography.bodyMd, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  itemDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  itemTitle: { ...Typography.bodyMd, fontWeight: '500' },
  itemSub: { ...Typography.bodySm, marginTop: 1 },
  itemBadge: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  itemBadgeTxt: { fontSize: 10, fontWeight: '800' },
});
