# Flowly privacy & analytics

Flowly is **offline-first**: your notes, tasks, and projects stay on your device. This document describes optional telemetry used to improve stability and product quality.

## PostHog (product analytics)

- Used for **anonymous product analytics** (e.g. which screens are used, when a note is created, when a PDF export completes).
- **We do not send note text, task titles, project names, or AI prompts.** Only metadata such as word counts, tag presence, and action types.
- **Session replay** may be enabled with **all text inputs and images masked** in the recording.
- Data is sent to PostHog US Cloud (`us.i.posthog.com`).

## Firebase (Crashlytics & Analytics)

- **Crashlytics** receives crash reports and non-content error context to fix bugs. **No note or task content** is included.
- **Firebase Analytics** receives screen names (e.g. `Notes`, `Profile`) for usage trends—not your personal data.
- Requires a production/dev build with native Firebase modules (not available in Expo Go).

## Your choices

- In **Profile → Privacy**, toggle **Send Analytics**:
  - **Off**: PostHog `optOut()` and Firebase `setAnalyticsCollectionEnabled(false)`.
  - **On**: analytics resume (default for new installs).
- You can also uninstall the app to stop all collection.

## Contact

For privacy questions about Flowly, use the in-app feedback form or your usual support channel.
