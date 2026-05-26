<div align="center">

```
███████╗██╗      ██████╗ ██╗    ██╗██╗  ██╗   ██╗
██╔════╝██║     ██╔═══██╗██║    ██║██║  ╚██╗ ██╔╝
█████╗  ██║     ██║   ██║██║ █╗ ██║██║   ╚████╔╝
██╔══╝  ██║     ██║   ██║██║███╗██║██║    ╚██╔╝
██║     ███████╗╚██████╔╝╚███╔███╔╝███████╗██║
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝
```

**Your second brain. Offline-first. AI-powered.**

[![Version](https://img.shields.io/badge/version-1.0.2-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-00FF9D?style=flat-square&labelColor=050A14)](https://expo.dev)
[![AI](https://img.shields.io/badge/AI-Groq%20llama--3.3--70b-00FF9D?style=flat-square&labelColor=050A14)](https://groq.com)
[![Storage](https://img.shields.io/badge/storage-AsyncStorage%20local-00FF9D?style=flat-square&labelColor=050A14)](.)
[![License](https://img.shields.io/badge/license-MIT-00FF9D?style=flat-square&labelColor=050A14)](LICENSE)

**[Download latest APK](https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk)** · [Releases](https://github.com/salarkhan2003/flowly/releases)

</div>

---

## Overview

**Flowly** is a privacy-focused productivity app for Android and iOS. Notes, tasks, projects, and an AI assistant live on your device — no account, no cloud sync required. Light theme is the default; dark mode is available in Profile.

| Area | Description |
|------|-------------|
| **Notes** | Markdown notes, tags, pin/archive, AI inline actions |
| **Tasks** | Priorities, due dates, subtasks, list & kanban views |
| **Projects** | Group work with color-coded projects |
| **AI** | Groq-powered chat with context from your local data |
| **Updates** | In-app check against GitHub `version.json` + APK download |
| **Community** | Optional team signup & feedback via Formspree |
| **Telegram** | [Flowly AI Team](https://t.me/FlowlyAITeam) channel (optional) |

**Current release:** v1.0.2 · Android `com.flowly.app` · `versionCode` 3

---

## Quick start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) or a dev build for device testing
- Groq API key for local development (production builds can bundle one via EAS)

### Install & run

```bash
git clone https://github.com/salarkhan2003/flowly.git
cd flowly
npm install --legacy-peer-deps

# Copy env template and add your Groq key
cp .env.example .env
# Edit .env: EXPO_PUBLIC_GROQ_API_KEY=gsk_your_key_here

npx expo start
```

Press `a` for Android or `i` for iOS in the Expo CLI.

---

## Configuration

Config lives in **`app.config.js`** (not `app.json`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_GROQ_API_KEY` | Dev / EAS build | Bundled into app as `extra.groqApiKey` at build time |
| `EXPO_PUBLIC_UPDATE_MANIFEST_URL` | No | Override update manifest URL (default: GitHub `release/version.json`) |

**Never commit `.env`** — it is listed in `.gitignore`.

### Groq API key (production)

Production APKs embed the key from `EXPO_PUBLIC_GROQ_API_KEY` at EAS build time:

```bash
eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value gsk_your_key --scope project
```

**Runtime priority:**

1. User override in **Profile → AI Assistant → Configure API key** (`SecureStore`, key `groq_api_key`)
2. Bundled key from the build (`Constants.expoConfig.extra.groqApiKey`)
3. Friendly message if neither is set (app does not crash)

Users can leave the Settings field empty to use the app default, or save their own key to override it.

### Formspree & community

**Formspree** endpoint: `https://formspree.io/f/mdajlqnk`

| `formType` | Form |
|------------|------|
| `join_team` | Profile → Join Flowly team |
| `feedback` | Profile → Bugs & feedback |
| `onboarding` | Last onboarding slide (optional email) |

**Telegram:** [https://t.me/FlowlyAITeam](https://t.me/FlowlyAITeam)

---

## Production Android build (EAS)

```bash
# One-time: login and configure
eas login
npm run eas:configure

# Set Groq secret before building (see above)
eas build --platform android --profile production --clear-cache
```

**Verified for v1.0.2:**

| Field | Value |
|-------|--------|
| Package | `com.flowly.app` |
| Version | `1.0.2` |
| `versionCode` | `3` |
| Signing | Existing EAS keystore (`Build Credentials QkP353jey4`) |

Install builds from the [Expo dashboard](https://expo.dev) or download the APK artifact after the build completes.

---

## Releasing a new version

1. Bump **`app.config.js`**: `version`, `android.versionCode` (must increase every APK).
2. Update **`release/version.json`** on `main`:

```json
{
  "latestVersion": "1.0.3",
  "latestVersionCode": 4,
  "apkUrl": "https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk",
  "changelog": "• Your changes here",
  "forceUpdate": false
}
```

3. Run EAS production build, upload APK to [GitHub Releases](https://github.com/salarkhan2003/flowly/releases) as **`Flowly.apk`**.
4. Push `version.json` to `main` — in-app **Share app** and update checks pick up the new version automatically.

**OTA rule:** Keep `android.package` as `com.flowly.app` and the same signing keystore so users can install over existing APKs.

---

## App structure

```
app/
├── (auth)/onboarding       # First launch — name + optional email
├── (tabs)/                 # Home, Notes, Tasks, AI, Profile
├── forms/                  # join-team, feedback (Formspree)
├── settings/ai.tsx         # Groq API key override (SecureStore)
├── hub/                    # Calendar, search, projects, completed
├── notes|tasks|projects/[id]
└── modals/

components/                 # UI, forms, navigation (ClayTabBar), profile update buttons
stores/                     # Zustand + AsyncStorage persistence
lib/                        # AI, groqKey, shareApp, Formspree, updates
release/version.json        # Update manifest (also hosted on GitHub main)
constants/                  # Theme, community links, update URLs
```

---

## Data & privacy

- **Local-first:** Notes, tasks, projects, AI history → AsyncStorage (`flowly:*` prefix).
- **Network:** Groq (AI), Formspree (optional forms), GitHub (update checks / share link) when used.
- **Export:** Profile → Export All Data (JSON share).
- **Reset:** Profile → Reset App — wipes all local data and returns to onboarding.

---

## AI assistant

Powered by **Groq `llama-3.3-70b-versatile`**. The assistant reads your notes, tasks, and projects to answer questions. Create items with natural language:

```
Create a task to call the client by Friday
Add a note about today's standup
Start a project called Website v2
```

Creation uses structured actions server-side; you only see plain confirmations.

---

## Updates & sharing

Direct APK installs do not auto-update through the Play Store. Flowly checks:

`https://raw.githubusercontent.com/salarkhan2003/flowly/main/release/version.json`

Comparison uses **`latestVersionCode > installed versionCode`** (not semver strings alone).

| UI | Behavior |
|----|----------|
| **Home banners** | Update available / check-for-updates (24h snooze) |
| **Profile → Check for updates** | Fetches manifest, shows alert only |
| **Profile → Download** | Shown only when an update is available; opens APK URL |
| **Profile → Share app** (top-right) | Shares latest `version` + download link from live manifest |

---

## Forms & community

All forms are **optional**. Home header notifications:

| Banner | When | Actions |
|--------|------|---------|
| **Join team** | Until joined or **Later** (24h snooze) | Join → form · Later |
| **Update available** | Remote `versionCode` newer than installed | Profile · Download · Later (24h) |
| **Check for updates** | Once per 24h when up to date | Check · Later (24h) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| AI says "not configured" | Set `EXPO_PUBLIC_GROQ_API_KEY` in `.env` (dev) or EAS secret (prod); or add key in Profile → AI Settings |
| APK update won't install | Package must stay `com.flowly.app` and same signing key as previous install |
| Share link shows old version | Push updated `release/version.json` to `main`; open Profile to refresh |
| `Unable to activate keep awake` (dev) | `npx expo install expo-keep-awake`, restart Metro |
| Keyboard covers inputs | Uses `FormScrollLayout` + keyboard hooks on editors and AI tab |
| Formspree fails | Check internet; confirm `formType` in Formspree dashboard |
| npm install peer errors | Use `npm install --legacy-peer-deps` |

---

## Tech stack

- React Native 0.81 · Expo SDK 54 · Expo Router 6
- Zustand · AsyncStorage · expo-secure-store
- TypeScript · expo-haptics · expo-notifications
- Formspree (JSON POST) · Groq API · EAS Build

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Made with focus. Built for flow.

[Download APK](https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk) · [Telegram — Flowly AI Team](https://t.me/FlowlyAITeam)

</div>
