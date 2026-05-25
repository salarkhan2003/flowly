import { create } from 'zustand';
import { storage } from '../lib/storage';

const MS_24H = 24 * 60 * 60 * 1000;

interface PrefsState {
  showTeamBanner: boolean;
  teamJoined: boolean;
  /** Home APK update strip (when manifest says newer version). */
  showUpdateBanner: boolean;
  telegramPromptDismissed: boolean;
  init: () => Promise<void>;
  snoozeTeamBanner24h: () => Promise<void>;
  markTeamJoined: () => Promise<void>;
  snoozeUpdateBanner24h: (version: string) => Promise<void>;
  refreshUpdateBannerVisibility: (latestVersion: string | null) => void;
  dismissTelegramPrompt: () => Promise<void>;
  resetPrefs: () => void;
}

function shouldShowTeamBanner(snoozeUntil: number | null, joined: boolean): boolean {
  if (joined) return false;
  if (!snoozeUntil) return true;
  return Date.now() >= snoozeUntil;
}

function shouldShowUpdateBanner(
  snoozeUntil: number | null,
  snoozeVersion: string | null,
  latestVersion: string | null
): boolean {
  if (!latestVersion) return false;
  if (!snoozeUntil) return true;
  if (snoozeVersion !== latestVersion) return true;
  return Date.now() >= snoozeUntil;
}

export const usePrefsStore = create<PrefsState>((set, get) => ({
  showTeamBanner: false,
  teamJoined: false,
  showUpdateBanner: false,
  telegramPromptDismissed: false,

  init: async () => {
    const [snoozeUntil, joined, telegram, legacyDismissed, updateSnoozeUntil, updateSnoozeVersion] =
      await Promise.all([
        storage.get<number>('team_banner_snooze_until'),
        storage.get<boolean>('team_joined'),
        storage.get<boolean>('telegram_prompt_dismissed'),
        storage.get<boolean>('team_banner_dismissed'),
        storage.get<number>('update_banner_snooze_until'),
        storage.get<string>('update_banner_snooze_version'),
      ]);

    let snooze = snoozeUntil ?? null;
    if (legacyDismissed && !snooze) {
      snooze = Date.now() + MS_24H;
      await storage.set('team_banner_snooze_until', snooze);
      await storage.remove('team_banner_dismissed');
    }

    const hasJoined = !!joined;
    set({
      showTeamBanner: shouldShowTeamBanner(snooze, hasJoined),
      teamJoined: hasJoined,
      telegramPromptDismissed: !!telegram,
      showUpdateBanner: shouldShowUpdateBanner(
        updateSnoozeUntil ?? null,
        updateSnoozeVersion ?? null,
        null
      ),
    });
  },

  refreshUpdateBannerVisibility: (latestVersion) => {
    storage
      .get<number>('update_banner_snooze_until')
      .then((until) =>
        storage.get<string>('update_banner_snooze_version').then((ver) => {
          set({
            showUpdateBanner: shouldShowUpdateBanner(until ?? null, ver ?? null, latestVersion),
          });
        })
      );
  },

  snoozeTeamBanner24h: async () => {
    const until = Date.now() + MS_24H;
    await storage.set('team_banner_snooze_until', until);
    set({ showTeamBanner: false });
  },

  markTeamJoined: async () => {
    await storage.set('team_joined', true);
    set({ showTeamBanner: false, teamJoined: true });
  },

  snoozeUpdateBanner24h: async (version) => {
    const until = Date.now() + MS_24H;
    await storage.set('update_banner_snooze_until', until);
    await storage.set('update_banner_snooze_version', version);
    set({ showUpdateBanner: false });
  },

  dismissTelegramPrompt: async () => {
    await storage.set('telegram_prompt_dismissed', true);
    set({ telegramPromptDismissed: true });
  },

  resetPrefs: () =>
    set({
      showTeamBanner: true,
      teamJoined: false,
      showUpdateBanner: false,
      telegramPromptDismissed: false,
    }),
}));
