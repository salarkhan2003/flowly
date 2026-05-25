import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday,
} from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showTime?: boolean;
}

type Step = 'date' | 'time';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function safeDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export function DatePicker({ value, onChange, placeholder = 'Select date & time', showTime = true }: DatePickerProps) {
  const { C } = useTheme();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('date');
  const [current, setCurrent] = useState(() => safeDate(value) ?? new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(() => safeDate(value));
  const [hour, setHour] = useState(() => safeDate(value)?.getHours() ?? 9);
  const [minute, setMinute] = useState(() => safeDate(value)?.getMinutes() ?? 0);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
  });

  const displayValue = () => {
    const d = safeDate(value);
    if (!d) return null;
    if (showTime && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
      return format(d, 'MMM d, yyyy · h:mm a');
    }
    return format(d, 'MMM d, yyyy');
  };

  const handleOpen = () => {
    const d = safeDate(value) ?? new Date();
    setCurrent(d);
    setSelectedDay(safeDate(value));
    setHour(d.getHours());
    setMinute(d.getMinutes());
    setStep('date');
    setOpen(true);
  };

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    if (showTime) { setStep('time'); }
    else { onChange(format(day, 'yyyy-MM-dd')); setOpen(false); }
  };

  const handleConfirmTime = () => {
    if (!selectedDay) return;
    const dt = new Date(selectedDay);
    dt.setHours(hour, minute, 0, 0);
    onChange(dt.toISOString());
    setOpen(false);
    setStep('date');
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    setStep('date');
    setSelectedDay(null);
  };

  const display = displayValue();

  return (
    <>
      <TouchableOpacity
        style={[st.trigger, { backgroundColor: C.bgCardAlt, borderColor: C.border }]}
        onPress={handleOpen}
      >
        <Text style={[st.triggerTxt, { color: display ? C.textPrimary : C.textMuted }]}>
          {display ?? placeholder}
        </Text>
        <View style={[st.calBadge, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]}>
          <Text style={[st.calTxt, { color: C.accent }]}>{showTime ? 'Date+Time' : 'Date'}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => { setOpen(false); setStep('date'); }}>
        <TouchableOpacity style={st.backdrop} activeOpacity={1} onPress={() => { setOpen(false); setStep('date'); }}>
          <TouchableOpacity activeOpacity={1} style={[st.sheet, { backgroundColor: C.bgCard, borderColor: C.border, shadowColor: C.accent }]}>

            {step === 'date' ? (
              <>
                <View style={st.monthRow}>
                  <TouchableOpacity onPress={() => setCurrent(subMonths(current, 1))} style={st.navBtn}>
                    <Text style={[st.navTxt, { color: C.accent }]}>{'<'}</Text>
                  </TouchableOpacity>
                  <Text style={[st.monthLabel, { color: C.textPrimary }]}>{format(current, 'MMMM yyyy')}</Text>
                  <TouchableOpacity onPress={() => setCurrent(addMonths(current, 1))} style={st.navBtn}>
                    <Text style={[st.navTxt, { color: C.accent }]}>{'>'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={st.dayHeaders}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                    <Text key={d} style={[st.dayHeader, { color: C.textMuted }]}>{d}</Text>
                  ))}
                </View>

                <View style={st.grid}>
                  {days.map((day) => {
                    const isSel = selectedDay ? isSameDay(day, selectedDay) : false;
                    const inMonth = isSameMonth(day, current);
                    const today = isToday(day);
                    return (
                      <TouchableOpacity
                        key={day.toISOString()}
                        style={[st.dayCell,
                          isSel && { backgroundColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
                          today && !isSel && { backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.borderGlow },
                        ]}
                        onPress={() => handleDaySelect(day)}
                      >
                        <Text style={[st.dayNum, { color: C.textPrimary },
                          !inMonth && { color: C.textMuted },
                          isSel && { color: C.bg, fontWeight: '800' },
                          today && !isSel && { color: C.accent, fontWeight: '700' },
                        ]}>
                          {format(day, 'd')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={st.actions}>
                  <TouchableOpacity style={[st.clearBtn, { borderColor: C.border }]} onPress={handleClear}>
                    <Text style={[st.clearTxt, { color: C.textSecondary }]}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.confirmBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]} onPress={() => handleDaySelect(new Date())}>
                    <Text style={[st.confirmTxt, { color: C.accent }]}>Today</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[st.timeTitle, { color: C.textPrimary }]}>
                  {selectedDay ? format(selectedDay, 'EEE, MMM d') : 'Pick time'}
                </Text>
                <Text style={[st.timeSubtitle, { color: C.textMuted }]}>Select deadline time</Text>

                <View style={st.timeRow}>
                  <View style={st.timeCol}>
                    <Text style={[st.timeColLabel, { color: C.textMuted }]}>Hour</Text>
                    <ScrollView style={st.timeScroll} showsVerticalScrollIndicator={false}>
                      {HOURS.map((h) => (
                        <TouchableOpacity
                          key={h}
                          style={[st.timeItem, hour === h && { backgroundColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }]}
                          onPress={() => setHour(h)}
                        >
                          <Text style={[st.timeItemTxt, { color: hour === h ? C.bg : C.textSecondary }, hour === h && { fontWeight: '800' }]}>
                            {h.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <Text style={[st.timeSep, { color: C.accent }]}>:</Text>

                  <View style={st.timeCol}>
                    <Text style={[st.timeColLabel, { color: C.textMuted }]}>Min</Text>
                    <ScrollView style={st.timeScroll} showsVerticalScrollIndicator={false}>
                      {MINUTES.map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[st.timeItem, minute === m && { backgroundColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }]}
                          onPress={() => setMinute(m)}
                        >
                          <Text style={[st.timeItemTxt, { color: minute === m ? C.bg : C.textSecondary }, minute === m && { fontWeight: '800' }]}>
                            {m.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {selectedDay && (
                  <View style={[st.timePreview, { backgroundColor: C.bgCardAlt, borderColor: C.borderGlow }]}>
                    <Text style={[st.timePreviewTxt, { color: C.accent }]}>
                      {format(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), hour, minute), 'MMM d, yyyy · h:mm a')}
                    </Text>
                  </View>
                )}

                <View style={st.actions}>
                  <TouchableOpacity style={[st.clearBtn, { borderColor: C.border }]} onPress={() => setStep('date')}>
                    <Text style={[st.clearTxt, { color: C.textSecondary }]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.confirmBtn, { backgroundColor: C.accentDim, borderColor: C.borderGlow }]} onPress={handleConfirmTime}>
                    <Text style={[st.confirmTxt, { color: C.accent }]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const st = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  triggerTxt: { ...Typography.bodyMd, fontWeight: '500', flex: 1 },
  calBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  calTxt: { fontSize: 10, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,10,20,0.85)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: 320, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md, gap: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 20 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: 8 },
  navTxt: { fontSize: 20, fontWeight: '700' },
  monthLabel: { ...Typography.headingMd, fontWeight: '700' },
  dayHeaders: { flexDirection: 'row' },
  dayHeader: { flex: 1, textAlign: 'center', ...Typography.bodySm, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm },
  dayNum: { ...Typography.bodyMd, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  clearBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  clearTxt: { ...Typography.bodyMd, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  confirmTxt: { ...Typography.bodyMd, fontWeight: '700' },
  timeTitle: { ...Typography.headingMd, fontWeight: '700', textAlign: 'center' },
  timeSubtitle: { ...Typography.bodySm, textAlign: 'center', marginTop: -8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  timeCol: { alignItems: 'center', gap: 6 },
  timeColLabel: { ...Typography.caption },
  timeScroll: { height: 160, width: 64 },
  timeItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.md, alignItems: 'center', marginBottom: 2 },
  timeItemTxt: { fontSize: 18, fontWeight: '600' },
  timeSep: { fontSize: 28, fontWeight: '800', marginTop: 20 },
  timePreview: { borderRadius: Radius.md, borderWidth: 1, padding: 10, alignItems: 'center' },
  timePreviewTxt: { ...Typography.bodyMd, fontWeight: '600' },
});
