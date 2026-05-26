import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import { DEFAULT_APK_URL, getUpdateManifestUrl, GITHUB_RELEASES_API_URL } from '../constants/updates';
import type { UpdateCheckPolicy } from '../types';
import { showAlert, showError, showSuccess } from './alert';
import { storage } from './storage';

export type { UpdateCheckPolicy };

export interface UpdateManifest {
  latestVersion: string;
  latestVersionCode: number;
  apkUrl: string;
  changelog: string;
  forceUpdate?: boolean;
  /** True when versionCode is not authoritative (GitHub tag fallback). */
  semverOnly?: boolean;
}

export type UpdateCheckStatus = 'available' | 'up_to_date' | 'error';

export interface UpdateCheckResult {
  status: UpdateCheckStatus;
  manifest?: UpdateManifest;
  message?: string;
}

const LAST_CHECK_KEY = 'update_last_check';
const INSTALLED_CODE_CACHE_KEY = 'flowly_installed_version_code';
const GITHUB_RELEASES_URL = GITHUB_RELEASES_API_URL;

const BUNDLED_MANIFEST: UpdateManifest = require('../release/version.json');

const FLOWLY_PACKAGE = 'com.flowly.app';

function configVersionName(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

function configVersionCode(): number {
  const code = Constants.expoConfig?.android?.versionCode;
  return typeof code === 'number' && code > 0 ? code : 1;
}

/** True when running the installed Flowly APK (not Expo Go / dev client host). */
export function isFlowlyProductionBuild(): boolean {
  const appId = Application.applicationId ?? '';
  return appId === FLOWLY_PACKAGE;
}

/** App version from APK manifest, or app.config when using Expo Go. */
export function getInstalledVersionName(): string {
  if (isFlowlyProductionBuild()) {
    const native = Application.nativeApplicationVersion?.trim();
    if (native) return native;
  }
  return configVersionName();
}

/** Parse Android versionCode only — reject semver strings like "1.0.2" (parseInt → 1). */
function parseNativeVersionCode(build: string | null | undefined): number | null {
  if (!build) return null;
  const trimmed = String(build).trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = parseInt(trimmed, 10);
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : null;
}

let resolvedInstalledCode: number | null = null;

export function clearResolvedVersionCache(): void {
  resolvedInstalledCode = null;
}

/** Human-readable installed version for Profile UI. */
export function getInstalledVersionDisplay(): string {
  const name = getInstalledVersionName();
  const build = getInstalledVersionCode();
  if (isFlowlyProductionBuild()) {
    return `v${name} · build ${build}`;
  }
  return `v${name} · build ${build} (dev)`;
}

/** Android versionCode from the installed APK (native integer, then expo config). */
export function getInstalledVersionCode(): number {
  if (resolvedInstalledCode != null) return resolvedInstalledCode;

  if (isFlowlyProductionBuild()) {
    const fromNative = parseNativeVersionCode(Application.nativeBuildVersion);
    if (fromNative != null) return fromNative;
  }

  return configVersionCode();
}

export async function cacheInstalledVersionCode(): Promise<number> {
  clearResolvedVersionCache();

  const fromNative = isFlowlyProductionBuild()
    ? parseNativeVersionCode(Application.nativeBuildVersion)
    : null;
  const configCode = configVersionCode();
  const cached = await storage.get<number>(INSTALLED_CODE_CACHE_KEY);
  const code = Math.max(fromNative ?? 0, configCode, cached ?? 0, 1);
  resolvedInstalledCode = code;
  await storage.set(INSTALLED_CODE_CACHE_KEY, code);
  return code;
}

export async function getCachedInstalledVersionCode(): Promise<number> {
  if (resolvedInstalledCode != null) return resolvedInstalledCode;
  const cached = await storage.get<number>(INSTALLED_CODE_CACHE_KEY);
  if (cached != null && cached > 0) return cached;
  return getInstalledVersionCode();
}

export function normalizeVersion(version: string): string {
  return version.trim().replace(/^[vV]/, '');
}

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
    semverOnly: false,
  };
}

/** Compare using versionCode from version.json; semver fallback for GitHub-only manifests. */
export function isUpdateAvailable(manifest: UpdateManifest): boolean {
  const installedCode = getInstalledVersionCode();
  const installedName = normalizeVersion(getInstalledVersionName());
  const latestName = normalizeVersion(manifest.latestVersion);

  if (manifest.semverOnly) {
    return compareSemver(latestName, installedName) > 0;
  }

  if (manifest.latestVersionCode > installedCode) {
    return true;
  }

  if (manifest.latestVersionCode < installedCode) {
    return false;
  }

  return compareSemver(latestName, installedName) > 0;
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
    latestVersionCode: getInstalledVersionCode(),
    apkUrl: apk.browser_download_url,
    changelog: (data.body ?? '').trim() || `Flowly ${version} is available.`,
    forceUpdate: false,
    semverOnly: true,
  };
}

async function resolveManifest(): Promise<{ manifest: UpdateManifest | null; source: string }> {
  const remote = await fetchManifestFromUrl();
  if (remote) return { manifest: remote, source: 'version.json' };

  const github = await fetchManifestFromGitHubReleases();
  if (github) return { manifest: github, source: 'GitHub Releases' };

  const bundled = parseManifest(BUNDLED_MANIFEST);
  return { manifest: bundled, source: 'bundled' };
}

export async function fetchLatestReleaseManifest(): Promise<UpdateManifest> {
  const { manifest } = await resolveManifest();
  if (manifest) return manifest;
  const bundled = parseManifest(BUNDLED_MANIFEST);
  return (
    bundled ?? {
      latestVersion: getInstalledVersionName(),
      latestVersionCode: getInstalledVersionCode(),
      apkUrl: DEFAULT_APK_URL,
      changelog: '',
      forceUpdate: false,
    }
  );
}

export interface UpdateCheckOutcome {
  updateAvailable: boolean;
  manifest?: UpdateManifest;
  message?: string;
}

export async function checkForUpdates(): Promise<UpdateCheckOutcome> {
  await cacheInstalledVersionCode();
  await markUpdateCheckComplete();
  const result = await checkForAppUpdate();

  if (result.status === 'available' && result.manifest) {
    return {
      updateAvailable: true,
      manifest: result.manifest,
      message: `Update available: v${result.manifest.latestVersion}`,
    };
  }

  if (result.status === 'up_to_date' && result.manifest) {
    return {
      updateAvailable: false,
      manifest: result.manifest,
      message: result.message,
    };
  }

  return {
    updateAvailable: false,
    message: result.message ?? 'Could not check for updates.',
  };
}

export async function checkUpdateAndNotify(): Promise<UpdateCheckOutcome> {
  const outcome = await checkForUpdates();

  if (outcome.updateAvailable && outcome.manifest) {
    showAlert(
      'Update available',
      `Flowly v${outcome.manifest.latestVersion} is ready. Tap Download below to get the APK.`
    );
  } else if (outcome.manifest) {
    showSuccess(
      "You're on latest",
      `Flowly v${getInstalledVersionName()} (build ${getInstalledVersionCode()}) is current.`
    );
  } else {
    showError('Update check failed', outcome.message ?? 'Could not reach GitHub.');
  }

  return outcome;
}

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  await cacheInstalledVersionCode();
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
      message: `You're on the latest version (v${getInstalledVersionName()}, build ${getInstalledVersionCode()}). Checked via ${source}.`,
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

export async function openApkDownload(url: string): Promise<boolean> {
  const target = url?.trim() || DEFAULT_APK_URL;
  try {
    await Linking.openURL(target);
    return true;
  } catch {
    try {
      await Linking.openURL(DEFAULT_APK_URL);
      return true;
    } catch {
      return false;
    }
  }
}
