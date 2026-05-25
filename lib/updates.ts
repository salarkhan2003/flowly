import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Alert, Linking } from 'react-native';
import { getUpdateManifestUrl } from '../constants/updates';
import type { UpdateCheckPolicy } from '../types';
import { storage } from './storage';

export type { UpdateCheckPolicy };

export interface UpdateManifest {
  latestVersion: string;
  latestVersionCode: number;
  apkUrl: string;
  changelog: string;
  forceUpdate?: boolean;
}

export type UpdateCheckStatus = 'available' | 'up_to_date' | 'error';

export interface UpdateCheckResult {
  status: UpdateCheckStatus;
  manifest?: UpdateManifest;
  message?: string;
}

const LAST_CHECK_KEY = 'update_last_check';
const GITHUB_RELEASES_URL = 'https://api.github.com/repos/salarkhan2003/flowly/releases/latest';

/** Shipped with the app — used if remote manifest is unreachable. */
const BUNDLED_MANIFEST: UpdateManifest = require('../release/version.json');

export function getInstalledVersionName(): string {
  return Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '1.0.0';
}

/** Android versionCode — must increment every APK release. */
export function getInstalledVersionCode(): number {
  const build = Application.nativeBuildVersion;
  if (build) {
    const parsed = parseInt(build, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const fromConfig = Constants.expoConfig?.android?.versionCode;
  if (typeof fromConfig === 'number') return fromConfig;
  return 1;
}

export function normalizeVersion(version: string): string {
  return version.trim().replace(/^[vV]/, '');
}

/** Returns 1 if a > b, -1 if a < b, 0 if equal. */
export function compareSemver(a: string, b: string): number {
  const pa = normalizeVersion(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = normalizeVersion(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function parseManifest(data: unknown): UpdateManifest | null {
  if (!data || typeof data !== 'object') return null;
  const raw = data as Record<string, unknown>;
  const latestVersion = typeof raw.latestVersion === 'string' ? raw.latestVersion : null;
  const versionCodeRaw = raw.latestVersionCode;
  const latestVersionCode =
    typeof versionCodeRaw === 'number'
      ? versionCodeRaw
      : typeof versionCodeRaw === 'string'
        ? parseInt(versionCodeRaw, 10)
        : NaN;
  const apkUrl = typeof raw.apkUrl === 'string' ? raw.apkUrl : null;
  const changelog = typeof raw.changelog === 'string' ? raw.changelog : '';
  if (!latestVersion || Number.isNaN(latestVersionCode) || !apkUrl) return null;
  return {
    latestVersion: normalizeVersion(latestVersion),
    latestVersionCode,
    apkUrl,
    changelog,
    forceUpdate: raw.forceUpdate === true,
  };
}

export function isUpdateAvailable(manifest: UpdateManifest): boolean {
  const installedCode = getInstalledVersionCode();
  const installedName = normalizeVersion(getInstalledVersionName());

  if (manifest.latestVersionCode > installedCode) return true;
  if (manifest.latestVersionCode < installedCode) return false;
  return compareSemver(manifest.latestVersion, installedName) > 0;
}

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchManifestFromUrl(): Promise<UpdateManifest | null> {
  const base = getUpdateManifestUrl();
  const url = base.includes('?') ? `${base}&t=${Date.now()}` : `${base}?t=${Date.now()}`;
  const data = await fetchJson(url);
  return parseManifest(data);
}

async function fetchManifestFromGitHubReleases(): Promise<UpdateManifest | null> {
  const data = (await fetchJson(GITHUB_RELEASES_URL)) as {
    tag_name?: string;
    body?: string;
    assets?: { name?: string; browser_download_url?: string }[];
  } | null;
  if (!data?.tag_name) return null;

  const apk = data.assets?.find(
    (a) => a.name?.toLowerCase().endsWith('.apk') && a.browser_download_url
  );
  if (!apk?.browser_download_url) return null;

  const version = normalizeVersion(data.tag_name);

  return {
    latestVersion: version,
    // Match installed code so semver decides (avoids false positives vs Android versionCode 1).
    latestVersionCode: getInstalledVersionCode(),
    apkUrl: apk.browser_download_url,
    changelog: (data.body ?? '').trim() || `Flowly ${version} is available.`,
    forceUpdate: false,
  };
}

async function resolveManifest(): Promise<{ manifest: UpdateManifest | null; source: string }> {
  const remote = await fetchManifestFromUrl();
  if (remote) return { manifest: remote, source: 'version.json' };

  const github = await fetchManifestFromGitHubReleases();
  if (github) return { manifest: github, source: 'GitHub Releases' };

  return { manifest: parseManifest(BUNDLED_MANIFEST), source: 'bundled' };
}

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const { manifest, source } = await resolveManifest();

  if (!manifest) {
    return {
      status: 'error',
      message:
        'Could not load update info. Check your internet connection, or download the latest APK from the Flowly website.',
    };
  }

  if (!isUpdateAvailable(manifest)) {
    return {
      status: 'up_to_date',
      manifest,
      message: `You're on the latest version (v${getInstalledVersionName()}). Checked via ${source}.`,
    };
  }

  return { status: 'available', manifest };
}

export async function shouldRunUpdateCheck(policy: UpdateCheckPolicy): Promise<boolean> {
  if (policy === 'never') return false;
  const last = await storage.get<number>(LAST_CHECK_KEY);
  if (!last) return true;
  return Date.now() - last >= 24 * 60 * 60 * 1000;
}

export async function markUpdateCheckComplete(): Promise<void> {
  await storage.set(LAST_CHECK_KEY, Date.now());
}

/** @deprecated Use checkForAppUpdate — kept for callers that only need manifest */
export async function fetchAvailableUpdate(): Promise<UpdateManifest | null> {
  const result = await checkForAppUpdate();
  return result.status === 'available' ? result.manifest ?? null : null;
}

export async function openApkDownload(url: string): Promise<boolean> {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export function showUpdateAlert(manifest: UpdateManifest, options?: { force?: boolean }) {
  const force = options?.force ?? manifest.forceUpdate ?? false;
  const buttons = force
    ? [{ text: 'Download update', onPress: () => openApkDownload(manifest.apkUrl) }]
    : [
        { text: 'Later', style: 'cancel' as const },
        { text: 'Download', onPress: () => openApkDownload(manifest.apkUrl) },
      ];

  Alert.alert(
    `Flowly ${manifest.latestVersion} available`,
    manifest.changelog?.trim() || 'A new version is ready to install.',
    buttons,
    { cancelable: !force }
  );
}

export function showUpToDateAlert(message?: string) {
  Alert.alert(
    'Up to date',
    message ?? `You're running Flowly v${getInstalledVersionName()}.`,
    [{ text: 'OK' }]
  );
}

export function showUpdateErrorAlert(message: string) {
  Alert.alert('Update check failed', message, [{ text: 'OK' }]);
}
