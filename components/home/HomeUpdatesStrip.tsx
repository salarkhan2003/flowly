import React from 'react';
import { usePrefsStore } from '../../stores/prefsStore';
import { useUpdateStore } from '../../stores/updateStore';
import { CheckUpdatesBanner } from './CheckUpdatesBanner';
import { UpdateAvailableBanner } from './UpdateAvailableBanner';

/** Home header: update available OR daily check reminder (never both). */
export function HomeUpdatesStrip() {
  const available = useUpdateStore((s) => s.available);
  const showUpdateBanner = usePrefsStore((s) => s.showUpdateBanner);

  if (available && showUpdateBanner) {
    return <UpdateAvailableBanner />;
  }

  return <CheckUpdatesBanner />;
}
