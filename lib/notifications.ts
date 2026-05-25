// expo-notifications push functionality is not supported in Expo Go (SDK 53+).
// Local scheduled notifications still work but we stub them here to avoid crashes.
// For full notification support, use a development build (npx expo run:android).

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleTaskReminder(
  _taskId: string,
  _title: string,
  _dueDate: Date
): Promise<string | null> {
  return null;
}

export async function scheduleDailyBrief(_hour: number, _minute: number): Promise<string> {
  return '';
}

export async function cancelNotification(_id: string): Promise<void> {}
