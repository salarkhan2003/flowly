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

[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-00FF9D?style=flat-square&labelColor=050A14)](https://expo.dev)
[![AI](https://img.shields.io/badge/AI-Groq%20llama--3.3--70b-00FF9D?style=flat-square&labelColor=050A14)](https://groq.com)
[![Storage](https://img.shields.io/badge/storage-AsyncStorage%20local-00FF9D?style=flat-square&labelColor=050A14)](.)
[![License](https://img.shields.io/badge/license-MIT-00FF9D?style=flat-square&labelColor=050A14)](LICENSE)

</div>

---

## Overview

**Flowly** is a privacy-focused productivity app for Android and iOS. Notes, tasks, projects, and an AI assistant live on your device — no account, no cloud sync required. Light theme is the default; dark mode is available in Profile.

| Area | Description |
|------|-------------|
| **Notes** | Markdown notes, tags, pin/archive, AI inline actions |
| **Tasks** | Priorities, due dates, subtasks, today view |
| **Projects** | Group work with color-coded projects |
| **AI** | Groq-powered chat with context from your local data |
| **Community** | Optional team signup & feedback via Formspree |
| **Telegram** | [Flowly AI Team](https://t.me/FlowlyAITeam) channel (optional) |

---

## Quick start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) or a dev build for device testing
- Groq API key for AI features

### Install & run

```bash
git clone <your-repo-url>
cd flowly
npm install

# Add your Groq key (required for AI)
echo EXPO_PUBLIC_GROQ_API_KEY=your_key_here > .env

npx expo start
```

Press `a` for Android or `i` for iOS in the Expo CLI.

### Production Android build (EAS)

```bash
npm run eas:configure
npm run eas:build:android
```

---

## Configuration

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_GROQ_API_KEY` | Yes (for AI) | Groq API access |
| Formspree | Pre-configured | Team join, feedback, onboarding emails |

**Formspree** endpoint: `https://formspree.io/f/mdajlqnk`

Every submission includes a hidden-style field:

| `formType` value | Form |
|------------------|------|
| `join_team` | Profile → Join Flowly team |
| `feedback` | Profile → Bugs & feedback |
| `onboarding` | Last onboarding slide (optional email) |

**Telegram:** [https://t.me/FlowlyAITeam](https://t.me/FlowlyAITeam) — linked from join form, success screen, and Profile.

---

## App structure

```
app/
├── (auth)/onboarding     # First launch — name + optional email
├── (tabs)/               # Home, Notes, Tasks, AI, Profile
├── forms/                # join-team, feedback (Formspree)
├── hub/                  # Calendar, search, projects, completed
├── notes|tasks|projects/[id]
└── modals/

components/               # UI, forms, navigation (ClayTabBar)
stores/                   # Zustand + AsyncStorage persistence
lib/                      # AI, Formspree, storage, updates
constants/                # Theme, community links
```

---

## Data & privacy

- **Local-first:** Notes, tasks, projects, AI history → `AsyncStorage` (`flowly:*` prefix).
- **Network:** Only Groq (AI chat) and Formspree (optional forms) when you submit or chat.
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

## Forms & community

All forms are **optional**. Home header notifications:

| Banner | When | Actions |
|--------|------|---------|
| **Join team** | Until joined or **Later** (24h snooze) | Join → form · Later |
| **Update available** | Remote version **newer** than installed (e.g. v1.0.1 vs v1.0.0) | Tap → Profile · **Download** → GitHub APK · **Later** (24h) |
| **Check for updates** | Once per 24h when already up to date | **Check** → GitHub scan + Profile · **Later** (24h) |

Updates are checked on launch and when you open Home. APK downloads open the [GitHub release](https://github.com/salarkhan2003/flowly/releases/latest) in Chrome/your browser.

- **Join team:** Name, email, mobile, age range (chips), gender (chips)
- **Feedback:** Category, title, details, reply email
- **Onboarding:** Optional email on last slide (submits with `formType: onboarding`)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| AI says "not configured" | Set `EXPO_PUBLIC_GROQ_API_KEY` in `.env`, restart Metro |
| `Unable to activate keep awake` (dev) | Run `npx expo install expo-keep-awake`, restart bundler |
| Form keyboard dismisses | Fixed via `FormScrollLayout` — pull latest |
| Formspree fails | Check internet; confirm field `formType` exists in Formspree dashboard |

---

## Tech stack

- React Native 0.81 · Expo SDK 54 · Expo Router 6
- Zustand · AsyncStorage
- TypeScript · expo-haptics · expo-notifications
- Formspree (JSON POST) · Groq API

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Made with focus. Built for flow.

[Telegram — Flowly AI Team](https://t.me/FlowlyAITeam)

</div>
