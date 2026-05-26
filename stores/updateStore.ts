import { create } from 'zustand';
import {
  cacheInstalledVersionCode,
  checkForAppUpdate,
  clearResolvedVersionCache,
  fetchLatestReleaseManifest,
  getInstalledVersionCode,
  getInstalledVersionName,
  isUpdateAvailable,
  markUpdateCheckComplete,
  openApkDownload,
  shouldRunUpdateCheck,
  UpdateCheckPolicy,
  UpdateCheckOutcome,
  UpdateManifest,
} from '../lib/updates';

const BUNDLED_RELEASE: UpdateManifest = require('../release/version.json');
import type { UpdateModalKind } from '../components/ui/UpdateModal';
import { useAuthStore } from './authStore';

export interface UpdateModalState {
  visible: boolean;
  kind: UpdateModalKind;
  title: string;
  message: string;
  manifest?: UpdateManifest;
  force?: boolean;
  installedVersion?: string;
}

const CLOSED_MODAL: UpdateModalState = {
  visible: false,
  kind: 'up_to_date',
  title: '',
  message: '',
};

interface UpdateState {
  available: UpdateManifest | null;
  latestRelease: UpdateManifest;
  isChecking: boolean;
  lastMessage: string | null;
  installedVersion: string;
  installedVersionCode: number;
  modal: UpdateModalState;
  showUpdateModal: (payload: Omit<UpdateModalState, 'visible'> & { visible?: boolean }) => void;
  hideUpdateModal: () => void;
  checkForUpdates: (options?: { force?: boolean; showAlert?: boolean }) => Promise<void>;
  refreshLatestRelease: () => Promise<void>;
  openUpdateDownload: () => Promise<void>;
  promptUpdate: () => void;
  refreshInstalledVersion: () => void;
  applyCheckResult: (outcome: UpdateCheckOutcome) => void;
}

function getPolicy(): UpdateCheckPolicy {
  return useAuthStore.getState().user?.settings?.update_check_policy ?? 'notify';
}

function syncBanners(manifest: UpdateManifest | null) {
  const { usePrefsStore } = require('./prefsStore');
  usePrefsStore.getState().syncHomeUpdateBanners(manifest);
}

export const useUpdateStore = create<UpdateState>((set, get) => ({
  available: null,
  latestRelease: BUNDLED_RELEASE,
  isChecking: false,
  lastMessage: null,
  installedVersion: getInstalledVersionName(),
  installedVersionCode: getInstalledVersionCode(),
  modal: CLOSED_MODAL,

  refreshLatestRelease: async () => {
    try {
      get().refreshInstalledVersion();
      const manifest = await fetchLatestReleaseManifest();
      set({ latestRelease: manifest });
      const avail = get().available;
      if (avail && !isUpdateAvailable(avail)) {
        set({ available: null });
        syncBanners(null);
      }
    } catch {
      /* keep previous */
    }
  },

  showUpdateModal: (payload) => {
    const installedVersion = getInstalledVersionName();
    set({
      modal: {
        ...CLOSED_MODAL,
        installedVersion,
        ...payload,
        visible: payload.visible ?? true,
      },
    });
  },

  hideUpdateModal: () => set({ modal: CLOSED_MODAL }),

  refreshInstalledVersion: () => {
    clearResolvedVersionCache();
    const name = getInstalledVersionName();
    const code = getInstalledVersionCode();
    cacheInstalledVersionCode().catch(() => {});
    set({
      installedVersion: name,
      installedVersionCode: code,
    });
  },

  applyCheckResult: (outcome) => {
    get().refreshInstalledVersion();
    if (outcome.manifest) {
      set({ latestRelease: outcome.manifest });
    }
    const manifest = outcome.manifest;
    const hasUpdate = !!(manifest && isUpdateAvailable(manifest));
    if (hasUpdate && manifest) {
      set({
        available: manifest,
        lastMessage: outcome.message ?? `Update available: v${manifest.latestVersion}`,
      });
      syncBanners(manifest);
    } else {
      set({
        available: null,
        lastMessage: outcome.message ?? "You're on the latest version",
      });
      syncBanners(manifest ?? null);
    }
  },

  openUpdateDownload: async () => {
    const manifest = get().available ?? get().latestRelease;
    if (!manifest || !isUpdateAvailable(manifest)) {
      get().showUpdateModal({
        kind: 'error',
        title: 'No update ready',
        message: 'You are already on the latest version.',
      });
      return;
    }
    const ok = await openApkDownload(manifest.apkUrl);
    if (!ok) {
      get().showUpdateModal({
        kind: 'link_error',
        title: 'Could not open browser',
        message: 'Open this link manually in Chrome or Firefox:',
        manifest,
      });
    }
  },

  promptUpdate: () => {
    const { available, installedVersion } = get();
    if (!available || !isUpdateAvailable(available)) {
      get().checkForUpdates({ force: true, showAlert: true });
      return;
    }
    get().showUpdateModal({
      kind: 'available',
      title: `Update Available: v${available.latestVersion}`,
      message: available.changelog,
      manifest: available,
      force: available.forceUpdate,
      installedVersion,
    });
  },

  checkForUpdates: async (options) => {
    const policy = getPolicy();
    if (policy === 'never' && !options?.force) return;

    const runCheck = options?.force || (await shouldRunUpdateCheck(policy));
    if (!runCheck && !options?.force) return;

    get().refreshInstalledVersion();
    const installedVersion = getInstalledVersionName();

    if (options?.showAlert) {
      get().showUpdateModal({
        kind: 'checking',
        title: 'Checking for updates',
        message: 'Connecting to GitHub for the latest Flowly APK…',
        installedVersion,
      });
    }

    set({ isChecking: true, lastMessage: null });
    try {
      const result = await checkForAppUpdate();
      await markUpdateCheckComplete();
      get().refreshInstalledVersion();

      if (result.manifest) {
        set({ latestRelease: result.manifest });
      }

      const manifest = result.manifest;
      const hasUpdate = !!(manifest && isUpdateAvailable(manifest));

      if (hasUpdate && manifest) {
        set({
          available: manifest,
          isChecking: false,
          lastMessage: `Update available: v${manifest.latestVersion}`,
        });
        syncBanners(manifest);

        const showModal =
          options?.showAlert ??
          (policy === 'on_launch' || manifest.forceUpdate === true);

        if (showModal) {
          get().showUpdateModal({
            kind: 'available',
            title: `Update Available: v${manifest.latestVersion}`,
            message: manifest.changelog,
            manifest,
            force: manifest.forceUpdate,
            installedVersion,
          });
        } else if (options?.showAlert) {
          get().hideUpdateModal();
        }
        return;
      }

      set({
        available: null,
        isChecking: false,
        lastMessage: result.message ?? "You're on the latest version",
      });
      syncBanners(manifest ?? null);

      if (options?.showAlert) {
        get().showUpdateModal({
          kind: 'up_to_date',
          title: "You're up to date",
          message:
            result.message ??
            `Flowly v${installedVersion} (build ${getInstalledVersionCode()}) is current.`,
          installedVersion,
        });
      } else {
        get().hideUpdateModal();
      }
    } catch {
      const msg = 'Something went wrong while checking for updates.';
      set({ isChecking: false, lastMessage: msg, available: null });
      syncBanners(null);
      if (options?.showAlert) {
        get().showUpdateModal({
          kind: 'error',
          title: 'Update check failed',
          message: msg,
          installedVersion,
        });
      } else {
        get().hideUpdateModal();
      }
    }
  },
}));
