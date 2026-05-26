import { create } from 'zustand';
import { isUpdateAvailable, type UpdateManifest } from '../lib/updates';
import { storage } from '../lib/storage';

const MS_24H = 24 * 60 * 60 * 1000;

interface PrefsState {
  showTeamBanner: boolean;
  teamJoined: boolean;
  showUpdateBanner: boolean;
  showCheckUpdatesBanner: boolean;
  telegramPromptDismissed: boolean;
  init: () => Promise<void>;
  snoozeTeamBanner24h: () => Promise<void>;
  markTeamJoined: () => Promise<void>;
  snoozeUpdateBanner24h: (version: string) => Promise<void>;
  snoozeCheckUpdatesBanner24h: () => Promise<void>;
  syncHomeUpdateBanners: (manifest: UpdateManifest | null) => Promise<void>;
  dismissTelegramPrompt: () => Promise<void>;
  resetPrefs: () => void;
}

function shouldShowTeamBanner(snoozeUntil: number | null, joined: boolean): boolean {
  if (joined) return false;
  if (!snoozeUntil) return true;
  return Date.now() >= snoozeUntil;
}

function shouldShowSnoozedBanner(snoozeUntil: number | null): boolean {
  if (!snoozeUntil) return true;
  return Date.now() >= snoozeUntil;
}

function shouldShowUpdateBanner(
  snoozeUntil: number | null,
  snoozeVersion: string | null,
  manifest: UpdateManifest
): boolean {
  if (!isUpdateAvailable(manifest)) return false;
  if (!snoozeUntil) return true;
  if (snoozeVersion !== manifest.latestVersion) return true;
  return Date.now() >= snoozeUntil;
}

export const usePrefsStore = create<PrefsState>((set) => ({
  showTeamBanner: false,
  teamJoined: false,
  showUpdateBanner: false,
  showCheckUpdatesBanner: false,
  telegramPromptDismissed: false,

  init: async () => {
    const [
      snoozeUntil,
      joined,
      telegram,
      legacyDismissed,
      updateSnoozeUntil,
      updateSnoozeVersion,
      checkSnoozeUntil,
    ] = await Promise.all([
      storage.get<number>('team_banner_snooze_until'),
      storage.get<boolean>('team_joined'),
      storage.get<boolean>('telegram_prompt_dismissed'),
      storage.get<boolean>('team_banner_dismissed'),
      storage.get<number>('update_banner_snooze_until'),
      storage.get<string>('update_banner_snooze_version'),
      storage.get<number>('check_updates_banner_snooze_until'),
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
      showUpdateBanner: false,
      showCheckUpdatesBanner: shouldShowSnoozedBanner(checkSnoozeUntil ?? null),
    });
  },

  syncHomeUpdateBanners: async (manifest) => {
    const [updateSnoozeUntil, updateSnoozeVersion, checkSnoozeUntil] = await Promise.all([
      storage.get<number>('update_banner_snooze_until'),
      storage.get<string>('update_banner_snooze_version'),
      storage.get<number>('check_updates_banner_snooze_until'),
    ]);

    if (manifest && isUpdateAvailable(manifest)) {
      set({
        showUpdateBanner: shouldShowUpdateBanner(
          updateSnoozeUntil ?? null,
          updateSnoozeVersion ?? null,
          manifest
        ),
        showCheckUpdatesBanner: false,
      });
    } else {
      set({
        showUpdateBanner: false,
        showCheckUpdatesBanner: shouldShowSnoozedBanner(checkSnoozeUntil ?? null),
      });
    }
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
    set({ showUpdateBanner: false, showCheckUpdatesBanner: false });
  },

  snoozeCheckUpdatesBanner24h: async () => {
    const until = Date.now() + MS_24H;
    await storage.set('check_updates_banner_snooze_until', until);
    set({ showCheckUpdatesBanner: false });
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
      showCheckUpdatesBanner: true,
      telegramPromptDismissed: false,
    }),
}));
