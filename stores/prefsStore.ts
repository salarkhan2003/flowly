import { create } from 'zustand';
import { storage } from '../lib/storage';

const MS_24H = 24 * 60 * 60 * 1000;

interface PrefsState {
  /** Whether the home join banner should render (after init). */
  showTeamBanner: boolean;
  teamJoined: boolean;
  telegramPromptDismissed: boolean;
  init: () => Promise<void>;
  /** Snooze home banner for 24 hours (Ignore). */
  snoozeTeamBanner24h: () => Promise<void>;
  /** Hide banner permanently after successful join submit. */
  markTeamJoined: () => Promise<void>;
  dismissTelegramPrompt: () => Promise<void>;
  resetPrefs: () => void;
}

function shouldShowBanner(snoozeUntil: number | null, joined: boolean): boolean {
  if (joined) return false;
  if (!snoozeUntil) return true;
  return Date.now() >= snoozeUntil;
}

export const usePrefsStore = create<PrefsState>((set) => ({
  showTeamBanner: false,
  teamJoined: false,
  telegramPromptDismissed: false,

  init: async () => {
    const [snoozeUntil, joined, telegram, legacyDismissed] = await Promise.all([
      storage.get<number>('team_banner_snooze_until'),
      storage.get<boolean>('team_joined'),
      storage.get<boolean>('telegram_prompt_dismissed'),
      storage.get<boolean>('team_banner_dismissed'),
    ]);

    let snooze = snoozeUntil ?? null;
    if (legacyDismissed && !snooze) {
      snooze = Date.now() + MS_24H;
      await storage.set('team_banner_snooze_until', snooze);
      await storage.remove('team_banner_dismissed');
    }

    const hasJoined = !!joined;
    set({
      showTeamBanner: shouldShowBanner(snooze, hasJoined),
      teamJoined: hasJoined,
      telegramPromptDismissed: !!telegram,
    });
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

  dismissTelegramPrompt: async () => {
    await storage.set('telegram_prompt_dismissed', true);
    set({ telegramPromptDismissed: true });
  },

  resetPrefs: () =>
    set({
      showTeamBanner: true,
      teamJoined: false,
      telegramPromptDismissed: false,
    }),
}));
