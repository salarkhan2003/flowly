import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Project, Task } from '../types';

export const PUSH_ENABLED_KEY = 'push_enabled';
export const PUSH_TOKEN_KEY = 'expo_push_token';
export const SCHEDULED_NOTIFS_KEY = 'scheduled_notifs';
export const PERMISSION_PROMPT_KEY = 'notif_permission_prompt_shown';
const DEADLINE_SENT_KEY = 'notif_deadlines_sent_date';

const DAILY_IDENTIFIER = 'flowly_daily_productivity';
const ANDROID_CHANNEL_ID = 'flowly-default';

export type InstantNotificationType =
  | 'note_created'
  | 'task_created'
  | 'project_created'
  | 'deadline_today';

type ScheduledNotifsMap = {
  daily?: string;
  tasks: Record<string, string>;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function logNotif(action: string, detail?: unknown) {
  console.log(`[FlowlyNotif] ${action}`, detail ?? '');
}

async function readScheduledMap(): Promise<ScheduledNotifsMap> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULED_NOTIFS_KEY);
    if (!raw) return { tasks: {} };
    const parsed = JSON.parse(raw) as ScheduledNotifsMap;
    return { daily: parsed.daily, tasks: parsed.tasks ?? {} };
  } catch {
    return { tasks: {} };
  }
}

async function writeScheduledMap(map: ScheduledNotifsMap): Promise<void> {
  try {
    await AsyncStorage.setItem(SCHEDULED_NOTIFS_KEY, JSON.stringify(map));
  } catch (e) {
    logNotif('writeScheduledMap failed', e);
  }
}

export async function isPushEnabled(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(PUSH_ENABLED_KEY);
    if (v === null) return true;
    return v === 'true';
  } catch {
    return true;
  }
}

export async function setPushEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PUSH_ENABLED_KEY, enabled ? 'true' : 'false');
    logNotif('push_enabled set', enabled);
    if (!enabled) {
      await cancelAllScheduledNotifications();
    }
  } catch (e) {
    logNotif('setPushEnabled failed', e);
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Flowly',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
      sound: 'default',
    });
  } catch (e) {
    logNotif('ensureAndroidChannel failed', e);
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      logNotif('register skipped — not a physical device');
      return null;
    }

    await ensureAndroidChannel();

    const granted = await ensureNotificationPermissions();
    if (!granted) {
      logNotif('register permission denied');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const token = tokenData.data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    console.log('FLOWLY_PUSH_TOKEN:', token);
    logNotif('push token registered', token);
    return token;
  } catch (e) {
    logNotif('registerForPushNotificationsAsync failed', e);
    return null;
  }
}

/** @deprecated use registerForPushNotificationsAsync */
export async function requestNotificationPermissions(): Promise<boolean> {
  const token = await registerForPushNotificationsAsync();
  return !!token;
}

export async function shouldShowPermissionPrompt(): Promise<boolean> {
  try {
    const shown = await AsyncStorage.getItem(PERMISSION_PROMPT_KEY);
    return shown !== 'true';
  } catch {
    return true;
  }
}

export async function markPermissionPromptShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(PERMISSION_PROMPT_KEY, 'true');
  } catch {
    /* ignore */
  }
}

function parseDueDateLocal(dueDate: string): Date | null {
  const parts = dueDate.split('-').map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 9, 0, 0, 0);
}

async function ensureNotificationPermissions(): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    logNotif('ensureNotificationPermissions failed', e);
    return false;
  }
}

function isTodayDue(dueDate: string): boolean {
  const due = parseDueDateLocal(dueDate);
  if (!due) return false;
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

function taskReminderTrigger(dueDate: string): Date | null {
  const due = parseDueDateLocal(dueDate);
  if (!due) return null;
  const now = Date.now();
  let trigger = new Date(due.getTime() - 60 * 60 * 1000);
  if (trigger.getTime() <= now) {
    if (isTodayDue(dueDate)) {
      trigger = new Date(now + 60 * 60 * 1000);
      logNotif('same-day task reminder → 1 hour from now', trigger.toISOString());
    } else {
      return null;
    }
  }
  return trigger;
}

function taskReminderIdentifier(taskId: string): string {
  return `flowly_task_reminder_${taskId}`;
}

export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    logNotif('cancelled', id);
  } catch (e) {
    logNotif('cancelNotification failed', { id, e });
  }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  try {
    const map = await readScheduledMap();
    const id = map.tasks[taskId] ?? taskReminderIdentifier(taskId);
    await cancelNotification(id);
    delete map.tasks[taskId];
    await writeScheduledMap(map);
  } catch (e) {
    logNotif('cancelTaskReminder failed', e);
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await writeScheduledMap({ tasks: {} });
    logNotif('cancelled all scheduled');
  } catch (e) {
    logNotif('cancelAllScheduledNotifications failed', e);
  }
}

export async function scheduleTaskReminder(task: Task): Promise<string | null> {
  try {
    if (!(await isPushEnabled())) return null;
    if (!task.due_date || task.status === 'done') return null;

    const triggerDate = taskReminderTrigger(task.due_date);
    if (!triggerDate) {
      logNotif('task reminder skipped (past)', task.id);
      return null;
    }

    await cancelTaskReminder(task.id);
    if (!(await ensureNotificationPermissions())) return null;
    await ensureAndroidChannel();

    const identifier = taskReminderIdentifier(task.id);
    const notifId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Task reminder',
        body: `"${task.title}" is due in 1 hour`,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        data: { type: 'task_reminder', taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    const map = await readScheduledMap();
    map.tasks[task.id] = notifId;
    await writeScheduledMap(map);
    logNotif('scheduled task reminder', { taskId: task.id, at: triggerDate.toISOString(), notifId });
    return notifId;
  } catch (e) {
    logNotif('scheduleTaskReminder failed', e);
    return null;
  }
}

export async function scheduleDailyProductivity(): Promise<string | null> {
  try {
    if (!(await isPushEnabled())) return null;

    const map = await readScheduledMap();
    if (map.daily) {
      await cancelNotification(map.daily);
    }
    await cancelNotification(DAILY_IDENTIFIER);

    if (!(await ensureNotificationPermissions())) return null;
    await ensureAndroidChannel();

    const notifId = await Notifications.scheduleNotificationAsync({
      identifier: DAILY_IDENTIFIER,
      content: {
        title: 'Flowly',
        body: 'Good morning! Plan 3 tasks for today 🎯',
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        data: { type: 'daily_productivity' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    map.daily = notifId;
    await writeScheduledMap(map);
    logNotif('scheduled daily productivity 9:00 local', notifId);
    return notifId;
  } catch (e) {
    logNotif('scheduleDailyProductivity failed', e);
    return null;
  }
}

export async function sendInstantNotification(
  type: InstantNotificationType,
  data: { title?: string; name?: string }
): Promise<void> {
  try {
    if (!(await isPushEnabled())) {
      logNotif('instant skipped — push disabled', type);
      return;
    }

    const granted = await ensureNotificationPermissions();
    if (!granted) {
      logNotif('instant skipped — no permission', type);
      return;
    }

    await ensureAndroidChannel();

    let title = 'Flowly';
    let body = '';

    switch (type) {
      case 'note_created':
        title = 'Note Created ✅';
        body = data.title ?? 'New note';
        break;
      case 'task_created':
        title = 'Task Added 📋';
        body = data.title ?? 'New task';
        break;
      case 'project_created':
        title = 'New Project 🚀';
        body = data.name ?? 'New project';
        break;
      case 'deadline_today':
        title = 'Deadline Today ⚠️';
        body = data.title ?? 'Task due today';
        break;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        data: { type },
      },
      trigger: null,
    });
    logNotif('sent instant', { type, body });
  } catch (e) {
    logNotif('sendInstantNotification failed', e);
  }
}

export async function checkDeadlinesDaily(tasks: Task[]): Promise<void> {
  try {
    if (!(await isPushEnabled())) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastSent = await AsyncStorage.getItem(DEADLINE_SENT_KEY);
    if (lastSent === todayKey) {
      logNotif('deadlines already checked today');
      return;
    }

    const dueToday = tasks.filter(
      (t) => t.due_date && t.status !== 'done' && isTodayDue(t.due_date)
    );

    for (const task of dueToday) {
      await sendInstantNotification('deadline_today', { title: task.title });
    }

    await AsyncStorage.setItem(DEADLINE_SENT_KEY, todayKey);
    logNotif('checkDeadlinesDaily done', dueToday.length);
  } catch (e) {
    logNotif('checkDeadlinesDaily failed', e);
  }
}

export async function rescheduleAllTaskReminders(tasks: Task[]): Promise<void> {
  try {
    if (!(await isPushEnabled())) return;
    for (const task of tasks) {
      if (task.due_date && task.status !== 'done') {
        await scheduleTaskReminder(task);
      }
    }
    await scheduleDailyProductivity();
    logNotif('rescheduled all task reminders', tasks.length);
  } catch (e) {
    logNotif('rescheduleAllTaskReminders failed', e);
  }
}

export async function onPushEnabledChanged(
  enabled: boolean,
  tasks: Task[]
): Promise<void> {
  await setPushEnabled(enabled);
  if (enabled) {
    await registerForPushNotificationsAsync();
    await rescheduleAllTaskReminders(tasks);
  } else {
    await cancelAllScheduledNotifications();
  }
}

export async function initNotificationsOnLaunch(tasks: Task[]): Promise<void> {
  try {
    if (!(await isPushEnabled())) return;
    await registerForPushNotificationsAsync();
    await scheduleDailyProductivity();
    await checkDeadlinesDaily(tasks);
    await verifyNotificationsReady();
    logNotif('init on launch complete');
  } catch (e) {
    logNotif('initNotificationsOnLaunch failed', e);
  }
}

/** Logs permission + scheduled count — use after APK install to confirm notifications are live. */
export async function verifyNotificationsReady(): Promise<{
  ok: boolean;
  permission: string;
  pushEnabled: boolean;
  scheduledCount: number;
  pushToken: string | null;
}> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    const pushEnabled = await isPushEnabled();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    const ok = perm.status === 'granted' && pushEnabled;
    console.log('[FlowlyNotif] VERIFY', {
      ok,
      permission: perm.status,
      pushEnabled,
      scheduledCount: scheduled.length,
      pushToken: pushToken ? `${pushToken.slice(0, 24)}…` : null,
    });
    return {
      ok,
      permission: perm.status,
      pushEnabled,
      scheduledCount: scheduled.length,
      pushToken,
    };
  } catch (e) {
    logNotif('verifyNotificationsReady failed', e);
    return {
      ok: false,
      permission: 'unknown',
      pushEnabled: false,
      scheduledCount: 0,
      pushToken: null,
    };
  }
}

export function onNoteCreated(note: { title: string }): void {
  sendInstantNotification('note_created', { title: note.title }).catch(() => {});
}

export function onTaskCreated(task: Task): void {
  sendInstantNotification('task_created', { title: task.title }).catch(() => {});
  if (task.due_date) {
    scheduleTaskReminder(task).catch(() => {});
  }
}

export function onTaskUpdated(prev: Task | undefined, next: Task): void {
  if (next.status === 'done') {
    cancelTaskReminder(next.id).catch(() => {});
    return;
  }
  if (prev?.due_date !== next.due_date) {
    cancelTaskReminder(next.id)
      .then(() => {
        if (next.due_date) return scheduleTaskReminder(next);
      })
      .catch(() => {});
  }
}

export function onProjectCreated(project: Project): void {
  sendInstantNotification('project_created', { name: project.name }).catch(() => {});
}
