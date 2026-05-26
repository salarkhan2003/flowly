import { Share } from 'react-native';
import { DEFAULT_APK_URL } from '../constants/updates';
import { fetchLatestReleaseManifest, type UpdateManifest } from './updates';

export function getFlowlyDownloadUrl(manifest?: Pick<UpdateManifest, 'apkUrl'> | null): string {
  const url = manifest?.apkUrl?.trim();
  if (url && url.startsWith('http')) return url;
  return DEFAULT_APK_URL;
}

/** Live release from version.json → GitHub API → bundled fallback. */
export async function shareLatestVersion(): Promise<boolean> {
  const release = await fetchLatestReleaseManifest();
  const message = `Flowly v${release.latestVersion}\nDownload: ${getFlowlyDownloadUrl(release)}`;

  try {
    await Share.share({
      title: `Flowly v${release.latestVersion}`,
      message,
      url: getFlowlyDownloadUrl(release),
    });
    return true;
  } catch {
    return false;
  }
}

/** @deprecated use shareLatestVersion */
export const shareFlowlyApp = shareLatestVersion;
