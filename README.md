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

[![Version](https://img.shields.io/badge/version-1.0.8-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-00FF9D?style=flat-square&labelColor=050A14)](https://expo.dev)
[![AI](https://img.shields.io/badge/AI-Multi--provider-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Notifications](https://img.shields.io/badge/notifications-Local%20%2B%20Expo%20Push-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Storage](https://img.shields.io/badge/storage-AsyncStorage%20local-00FF9D?style=flat-square&labelColor=050A14)](.)
[![License](https://img.shields.io/badge/license-MIT-00FF9D?style=flat-square&labelColor=050A14)](LICENSE)

**[Download latest APK](https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk)** · [Releases](https://github.com/salarkhan2003/flowly/releases)

</div>

---

## Overview

**Flowly** is a privacy-focused productivity app for Android and iOS. Notes, tasks, projects, and a multi-provider AI assistant stay on your device — no account, no cloud sync required. Light mint clay theme by default; dark mode in **Profile → Preferences**.

| Area | Description |
|------|-------------|
| **Notes** | Rich text, tags, pin/archive, AI inline actions, voice → note |
| **Tasks** | Priorities, due dates, subtasks, list & kanban views |
| **Projects** | Color-coded project boards |
| **AI** | Chat with context from local data; create notes, tasks, projects via text or voice |
| **Voice** | Speech-to-text on AI & Notes (production APK / dev build — not Expo Go) |
| **Notifications** | Local alerts + Expo push token; task reminders, daily planning, deadlines |
| **Updates** | GitHub `version.json` check + in-app APK download |
| **Community** | Optional team signup & feedback (Formspree) |
| **Telegram** | [Flowly AI Team](https://t.me/FlowlyAITeam) (optional) |

**Current release:** v1.0.8 · Android `com.flowly.app` · `versionCode` 9

---

## Quick start

### Prerequisites

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) for UI dev, or a **development build** for voice + full native features
- Groq API key in `.env` for local AI (production APK can bundle one via EAS)

### Install & run

```bash
git clone https://github.com/salarkhan2003/flowly.git
cd flowly
npm install --legacy-peer-deps

cp .env.example .env
# Edit .env — at minimum:
#   EXPO_PUBLIC_GROQ_API_KEY=gsk_your_key_here

npx expo start
```

Press `a` (Android) or `i` (iOS) in the Expo CLI.

> **Voice, notifications & full AI:** Use a **production APK** or dev build. Expo Go cannot load native speech or reliable scheduled notifications.

---

## Configuration

Config lives in **`app.config.js`** (not `app.json`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_GROQ_API_KEY` | Dev / EAS production | Embedded as `extra.groqApiKey` for **App default** AI |
| `EXPO_PUBLIC_POSTHOG_KEY` | No | Analytics (optional) |
| `EXPO_PUBLIC_POSTHOG_HOST` | No | PostHog host (default US cloud) |
| `EXPO_PUBLIC_UPDATE_MANIFEST_URL` | No | Override update manifest URL |

**Never commit `.env`** — it is in `.gitignore`.

### AI setup (users)

**Profile → Preferences → AI Assistant** (or `/settings/ai`):

| Mode | Description |
|------|-------------|
| **App default** | Bundled Groq key from the APK build (new users auto-configured on first launch) |
| **My API key** | User key in SecureStore; pick provider and model |

**Supported providers:** Groq · Google Gemini · Claude (Anthropic) · OpenAI · Qwen (Alibaba) · DeepSeek

**Runtime logic:**

1. **App default** → always uses bundled Groq + Groq models (ignores stale custom keys)
2. **My API key** → user’s provider, model, and key from SecureStore
3. On launch, `ensureAiReadyOnLaunch()` sets bundled Groq when the build includes a key and no valid custom key exists

### EAS environment (production APK)

```bash
# Groq — required for App default AI in release builds
npm run eas:env:groq
# Or: eas env:create --name EXPO_PUBLIC_GROQ_API_KEY --value gsk_... --scope project --environment production --environment preview --visibility secret

# PostHog — optional
npm run eas:env:posthog
```

Production builds fail at config time if `EXPO_PUBLIC_GROQ_API_KEY` is missing when `EAS_BUILD_PROFILE=production`.

### Formspree & community

**Formspree:** `https://formspree.io/f/mdajlqnk`

| `formType` | Form |
|------------|------|
| `join_team` | Profile → Join Flowly team |
| `feedback` | Profile → Feedback & bugs |
| `onboarding` | Last onboarding slide (optional email) |

**Telegram:** [https://t.me/FlowlyAITeam](https://t.me/FlowlyAITeam)

---

## Production Android build (EAS)

```bash
eas login
npm run eas:configure

# Ensure EXPO_PUBLIC_GROQ_API_KEY is set on EAS (production + preview)
npm run eas:build:android
# Or: eas build --platform android --profile production
```

| Field | Value |
|-------|--------|
| Package | `com.flowly.app` |
| Version | `1.0.8` |
| `versionCode` | `9` |
| Output | APK (`production` profile) |
| Signing | EAS keystore (`Build Credentials QkP353jey4`) |
| Owner | `salarkhan22s-organization` |

Install from the [Expo dashboard](https://expo.dev) or download the APK artifact. Upload to [GitHub Releases](https://github.com/salarkhan2003/flowly/releases) as **`Flowly.apk`**.

**Latest notifications build (v1.0.8 · production verified):**

| | |
|--|--|
| **APK URL** | https://expo.dev/artifacts/eas/srYygikuEcPKq8WuRJkA8S.apk |
| **SHA256** | `f6f32ed12cad943075028377711ccb61798d1c8356f0d2dc1e406753fe505c2d` |
| **Local copy** | `./Flowly-v1.0.8-notifications.apk` |
| **Build page** | https://expo.dev/accounts/salarkhan22s-organization/projects/salar/builds/d62e0dae-f1f9-44ca-a979-c000de83cac8 |

---

## Releasing a new version

1. Bump **`app.config.js`**: `version`, `android.versionCode` (must increase every APK).
2. Update **`release/version.json`** on `main`:

```json
{
  "latestVersion": "1.0.8",
  "latestVersionCode": 9,
  "apkUrl": "https://github.com/salarkhan2003/flowly/releases/download/v1.0.8/Flowly.apk",
  "changelog": "• Your changes here",
  "sha256": ""
}
```

3. Run EAS production build → upload **`Flowly.apk`** to GitHub Releases.
4. Push `version.json` to `main` — in-app update checks and **Share app** use the live manifest.

**OTA rule:** Keep `android.package` as `com.flowly.app` and the same signing keystore so users can install over existing APKs.

---

## App structure

```
app/
├── (auth)/onboarding       # First launch — name + optional email
├── (tabs)/                 # Home, Notes, Tasks, AI, Profile
├── settings/ai.tsx         # AI provider, model, API key
├── forms/                  # join-team, feedback (Formspree)
├── hub/                    # Calendar, search, projects, completed
├── notes|tasks|projects/[id]
└── modals/                 # quick-capture, ai-command

components/
├── profile/                # ProfileHero, ProfileSection, ProfileRow, update buttons
├── voice/                  # VoiceAgentBar, MicIcon (SVG)
└── ui/                     # ClayCard, ClayTabBar, modals

lib/
├── ai.ts, aiConfig.ts      # Multi-provider chat + credentials
├── aiProviders.ts          # Groq, Gemini, Claude, OpenAI, Qwen, DeepSeek
├── aiBootstrap.ts          # First-launch App default setup
├── notifications.ts        # Local + Expo push notifications
├── providerChat.ts         # Provider HTTP adapters
└── updates.ts, shareApp.ts, posthog.ts, firebase.ts

hooks/
├── useNotifications.ts     # Init, AppState deadline checks, permission modal

stores/                     # Zustand + AsyncStorage
release/version.json        # Update manifest (hosted on GitHub main)
constants/                  # Theme, update URLs
```

---

## Data & privacy

- **Local-first:** Notes, tasks, projects, AI history → AsyncStorage (`flowly:*`).
- **API keys:** User keys in **expo-secure-store** (`flowly_ai_api_key`); bundled Groq only in app binary from EAS.
- **Network:** AI providers (when used), Formspree (optional), GitHub (updates), PostHog/Crashlytics (if configured).
- **Export:** Profile → Your data → **Export PDF**.
- **Reset:** Profile → **Reset app data** — wipes local storage and returns to onboarding.

---

## AI assistant

- **Default model (App default):** Groq `llama-3.3-70b-versatile`
- Reads your notes, tasks, and projects for context
- **Create** items with natural language (text or voice):

```
Create a task to call the client by Friday
Add a note about today's standup
Start a project called Website v2
```

Structured create actions are parsed server-side; users see plain confirmations.

**Test connection:** Settings screen → **Test connection** before **Save**.

---

## Push & local notifications

Flowly uses **expo-notifications** — all scheduling works **offline** on device. No backend required for alerts. The app also registers an **Expo push token** (for optional remote testing via [expo.dev/notifications](https://expo.dev/notifications)).

### What fires automatically

| Trigger | Notification |
|---------|----------------|
| Create note | `Note Created ✅` + title |
| Create task | `Task Added 📋` + title |
| Create project | `New Project 🚀` + name |
| Task due today (app open / foreground) | `Deadline Today ⚠️` + title |
| Task with due date | Reminder **1 hour before** due (9:00 AM local due time; same-day tasks → 1 hour from create) |
| Daily 9:00 AM (device local) | `Good morning! Plan 3 tasks for today 🎯` |

### User controls

- **First launch:** modal → **Allow** → system permission + token saved (`expo_push_token` in AsyncStorage)
- **Profile → Privacy → Push notifications:** ON/OFF (key `push_enabled`, default `true`)
  - OFF → cancels all scheduled notifications, skips instant alerts
  - ON → re-schedules daily reminder + all future task reminders

### Production APK requirements

Configured in `app.config.js`:

- Plugin: `expo-notifications` with icon `./assets/notification-icon.png`, color `#8B5CF6`
- Android permission: `POST_NOTIFICATIONS`
- Native module included only in **EAS / dev builds** (not Expo Go)

### Verify after installing APK

1. Install **v1.0.8+** production APK on a **physical Android device** (not emulator-only for push token).
2. Open app → tap **Allow** on the notification prompt (or Profile → Privacy → enable Push).
3. Connect device via USB and run `adb logcat | findstr FlowlyNotif` (Windows) or filter Logcat for `FlowlyNotif`.
4. Confirm logs show:
   - `FLOWLY_PUSH_TOKEN: ExponentPushToken[…]`
   - `[FlowlyNotif] VERIFY { ok: true, permission: 'granted', … }`
5. **Instant test:** create a note or task → notification should appear within 1–2 seconds.
6. **Reminder test:** create a task with **due date = today** → reminder scheduled ~1 hour later (check log: `scheduled task reminder`).
7. **Remote push test (optional):** copy token from logs → paste at [expo.dev/notifications](https://expo.dev/notifications) → send test push.

### Storage keys

| Key | Purpose |
|-----|---------|
| `push_enabled` | User toggle (default true) |
| `expo_push_token` | Expo push token string |
| `scheduled_notifs` | Map of task IDs → notification IDs + daily ID |
| `notif_permission_prompt_shown` | First-run modal dismissed |

---

## Voice input

- **Where:** AI tab (empty state + input bar mic), Note editor
- **Requires:** Production APK or dev client (`expo-speech-recognition` native module)
- **Not supported:** Expo Go (mic shows; tap explains install APK)
- **Permissions:** Microphone + speech recognition (configured in `app.config.js` plugins)

---

## Updates & sharing

Manifest: `https://raw.githubusercontent.com/salarkhan2003/flowly/main/release/version.json`

Comparison uses **`latestVersionCode > installed versionCode`**.

| UI | Behavior |
|----|----------|
| **Launch** | Optional update modal when policy allows |
| **Profile → App & updates** | Check, download, what's new, notification policy |
| **Profile → Share app** | Latest version + download link from manifest |
| **Home banners** | Update available / check snooze (24h) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| AI "not configured" (new user) | Install APK built with `EXPO_PUBLIC_GROQ_API_KEY` on EAS; or Profile → AI → **My API key** |
| AI fails with App default | Rebuild APK with Groq secret on **production** environment; Profile → AI → Test connection |
| Voice does not work | Use release APK or dev build, not Expo Go; grant mic + speech permissions |
| No notifications in APK | Install v1.0.8+; allow permission on first prompt; Profile → Privacy → Push ON; check `adb logcat` for `FlowlyNotif` |
| Instant alert missing | Grant Android notification permission; toggle Push OFF then ON in Profile |
| Task reminder not firing | Due date must be today or future; same-day tasks remind in ~1 hour; app must not force-stop |
| Mic visible but no recording | Reinstall latest APK; ensure `expo-speech-recognition` in build |
| APK update won't install | Same package `com.flowly.app` + same EAS signing key |
| Share link shows old version | Push `release/version.json` to `main` |
| `npm install` peer errors | `npm install --legacy-peer-deps` |
| Formspree fails | Check internet and `formType` in Formspree dashboard |

---

## Tech stack

- React Native 0.81 · Expo SDK 54 · Expo Router 6
- Zustand · AsyncStorage · expo-secure-store
- expo-speech-recognition · react-native-svg
- PostHog · Firebase Crashlytics (optional, native build)
- TypeScript · expo-haptics · expo-notifications · expo-print (PDF export)
- Formspree · Multi-provider LLM APIs · EAS Build

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Made with focus. Built for flow.

[Download APK](https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk) · [Telegram — Flowly AI Team](https://t.me/FlowlyAITeam)

</div>
