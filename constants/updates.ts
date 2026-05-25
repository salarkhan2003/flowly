/** Public manifest — host this file on your site or GitHub (see DISTRIBUTION.md). */
export const DEFAULT_UPDATE_MANIFEST_URL =
  'https://raw.githubusercontent.com/salarkhan2003/flowly/main/release/version.json';

export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function getUpdateManifestUrl(): string {
  return process.env.EXPO_PUBLIC_UPDATE_MANIFEST_URL ?? DEFAULT_UPDATE_MANIFEST_URL;
}
