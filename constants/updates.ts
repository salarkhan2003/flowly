/** GitHub repo for APK releases and update manifest (see DISTRIBUTION.md). */
export const GITHUB_REPO = 'salarkhan2003/flowly';

export const DEFAULT_APK_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/Flowly.apk`;

export const DEFAULT_UPDATE_MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/release/version.json`;

export const GITHUB_RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function getUpdateManifestUrl(): string {
  return process.env.EXPO_PUBLIC_UPDATE_MANIFEST_URL ?? DEFAULT_UPDATE_MANIFEST_URL;
}
