import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useTasksStore } from '../stores/tasksStore';
import {
  checkDeadlinesDaily,
  initNotificationsOnLaunch,
  isPushEnabled,
  markPermissionPromptShown,
  registerForPushNotificationsAsync,
  shouldShowPermissionPrompt,
} from '../lib/notifications';

export function useNotifications() {
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const tasks = useTasksStore((s) => s.tasks);
  const tasksRef = useRef(tasks);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!isOnboarded || initialized.current) return;
    initialized.current = true;

    (async () => {
      const user = useAuthStore.getState().user;
      if (user?.settings?.notifications_enabled === false) {
        const { setPushEnabled } = await import('../lib/notifications');
        await setPushEnabled(false);
      }
      const enabled = await isPushEnabled();
      if (enabled) {
        await initNotificationsOnLaunch(tasksRef.current);
      }
      const shouldPrompt = await shouldShowPermissionPrompt();
      if (shouldPrompt && enabled) {
        setShowPermissionModal(true);
      }
    })().catch(() => {});
  }, [isOnboarded]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        checkDeadlinesDaily(tasksRef.current).catch(() => {});
      }
    };

    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, []);

  const handleAllowNotifications = useCallback(async () => {
    await markPermissionPromptShown();
    setShowPermissionModal(false);
    await registerForPushNotificationsAsync();
    await initNotificationsOnLaunch(tasksRef.current);
    const { verifyNotificationsReady } = await import('../lib/notifications');
    await verifyNotificationsReady();
  }, []);

  const handleDismissPermissionModal = useCallback(async () => {
    await markPermissionPromptShown();
    setShowPermissionModal(false);
  }, []);

  return {
    showPermissionModal,
    handleAllowNotifications,
    handleDismissPermissionModal,
  };
}
