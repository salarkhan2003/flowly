import { create } from 'zustand';
import { Alert } from 'react-native';
import {
  checkForAppUpdate,
  getInstalledVersionCode,
  getInstalledVersionName,
  markUpdateCheckComplete,
  openApkDownload,
  shouldRunUpdateCheck,
  showUpdateAlert,
  showUpToDateAlert,
  showUpdateErrorAlert,
  UpdateCheckPolicy,
  UpdateManifest,
} from '../lib/updates';
import { useAuthStore } from './authStore';

interface UpdateState {
  available: UpdateManifest | null;
  isChecking: boolean;
  lastMessage: string | null;
  installedVersion: string;
  installedVersionCode: number;
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

  refreshInstalledVersion: () => {
    set({
      installedVersion: getInstalledVersionName(),
      installedVersionCode: getInstalledVersionCode(),
    });
  },

  openUpdateDownload: async () => {
    const { available } = get();
    if (!available) {
      Alert.alert('No update', 'Check for updates first to get the download link.');
      return;
    }
    const ok = await openApkDownload(available.apkUrl);
    if (!ok) {
      Alert.alert(
        'Could not open link',
        'Copy this URL in your browser:\n\n' + available.apkUrl
      );
    }
  },

  promptUpdate: () => {
    const { available } = get();
    if (!available) {
      get().checkForUpdates({ force: true, showAlert: true });
      return;
    }
    showUpdateAlert(available);
  },

  checkForUpdates: async (options) => {
    const policy = getPolicy();
    if (policy === 'never' && !options?.force) return;

    const runCheck = options?.force || (await shouldRunUpdateCheck(policy));
    if (!runCheck && !options?.force) return;

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

        const showAlert =
          options?.showAlert ??
          (policy === 'on_launch' || result.manifest.forceUpdate === true);

        if (showAlert) {
          showUpdateAlert(result.manifest, { force: result.manifest.forceUpdate });
        }
        return;
      }

      if (result.status === 'up_to_date') {
        set({
          available: null,
          isChecking: false,
          lastMessage: result.message ?? 'Up to date',
        });
        if (options?.showAlert) showUpToDateAlert(result.message);
        return;
      }

      set({
        available: null,
        isChecking: false,
        lastMessage: result.message ?? 'Check failed',
      });
      if (options?.showAlert) {
        showUpdateErrorAlert(result.message ?? 'Could not check for updates.');
      }
    } catch {
      const msg = 'Something went wrong while checking for updates.';
      set({ isChecking: false, lastMessage: msg });
      if (options?.showAlert) showUpdateErrorAlert(msg);
    }
  },
}));
