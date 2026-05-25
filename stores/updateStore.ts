import { create } from 'zustand';
import {
  checkForAppUpdate,
  getInstalledVersionCode,
  getInstalledVersionName,
  markUpdateCheckComplete,
  openApkDownload,
  shouldRunUpdateCheck,
  UpdateCheckPolicy,
  UpdateManifest,
} from '../lib/updates';
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
  isChecking: boolean;
  lastMessage: string | null;
  installedVersion: string;
  installedVersionCode: number;
  modal: UpdateModalState;
  showUpdateModal: (payload: Omit<UpdateModalState, 'visible'> & { visible?: boolean }) => void;
  hideUpdateModal: () => void;
  checkForUpdates: (options?: { force?: boolean; showAlert?: boolean }) => Promise<void>;
  openUpdateDownload: () => Promise<void>;
  promptUpdate: () => void;
  refreshInstalledVersion: () => void;
}

function getPolicy(): UpdateCheckPolicy {
  return useAuthStore.getState().user?.settings?.update_check_policy ?? 'notify';
}

export const useUpdateStore = create<UpdateState>((set, get) => ({
  available: null,
  isChecking: false,
  lastMessage: null,
  installedVersion: getInstalledVersionName(),
  installedVersionCode: getInstalledVersionCode(),
  modal: CLOSED_MODAL,

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
    set({
      installedVersion: getInstalledVersionName(),
      installedVersionCode: getInstalledVersionCode(),
    });
  },

  openUpdateDownload: async () => {
    const { available } = get();
    if (!available) {
      get().showUpdateModal({
        kind: 'error',
        title: 'No update ready',
        message: 'Check for updates first to get the download link.',
      });
      return;
    }
    const ok = await openApkDownload(available.apkUrl);
    if (!ok) {
      get().showUpdateModal({
        kind: 'link_error',
        title: 'Could not open browser',
        message: 'Open this link manually in Chrome or Firefox:',
        manifest: available,
      });
    }
  },

  promptUpdate: () => {
    const { available, installedVersion } = get();
    if (!available) {
      get().checkForUpdates({ force: true, showAlert: true });
      return;
    }
    get().showUpdateModal({
      kind: 'available',
      title: 'Update available',
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

      if (result.status === 'available' && result.manifest) {
        set({
          available: result.manifest,
          isChecking: false,
          lastMessage: `Update available: v${result.manifest.latestVersion}`,
        });
        const { usePrefsStore } = require('./prefsStore');
        usePrefsStore.getState().refreshUpdateBannerVisibility(result.manifest.latestVersion);

        const showModal =
          options?.showAlert ??
          (policy === 'on_launch' || result.manifest.forceUpdate === true);

        if (showModal) {
          get().showUpdateModal({
            kind: 'available',
            title: 'Update available',
            message: result.manifest.changelog,
            manifest: result.manifest,
            force: result.manifest.forceUpdate,
            installedVersion,
          });
        } else if (options?.showAlert) {
          get().hideUpdateModal();
        }
        return;
      }

      if (result.status === 'up_to_date') {
        set({
          available: null,
          isChecking: false,
          lastMessage: result.message ?? 'Up to date',
        });
        const { usePrefsStore } = require('./prefsStore');
        usePrefsStore.getState().refreshUpdateBannerVisibility(null);
        if (options?.showAlert) {
          get().showUpdateModal({
            kind: 'up_to_date',
            title: "You're up to date",
            message:
              result.message ??
              `Flowly v${installedVersion} is the latest version on your channel.`,
            installedVersion,
          });
        } else {
          get().hideUpdateModal();
        }
        return;
      }

      const errMsg = result.message ?? 'Could not check for updates.';
      set({
        available: null,
        isChecking: false,
        lastMessage: errMsg,
      });
      const { usePrefsStore } = require('./prefsStore');
      usePrefsStore.getState().refreshUpdateBannerVisibility(null);
      if (options?.showAlert) {
        get().showUpdateModal({
          kind: 'error',
          title: 'Update check failed',
          message: errMsg,
          installedVersion,
        });
      } else {
        get().hideUpdateModal();
      }
    } catch {
      const msg = 'Something went wrong while checking for updates.';
      set({ isChecking: false, lastMessage: msg });
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
