<div align="center">

```
███████╗██╗      ██████╗ ██╗    ██╗██╗  ██╗   ██╗
██╔════╝██║     ██╔═══██╗██║    ██║██║  ╚██╗ ██╔╝
█████╗  ██║     ██║   ██║██║ █╗ ██║██║   ╚████╔╝ 
██╔══╝  ██║     ██║   ██║██║███╗██║██║    ╚██╔╝  
██║     ███████╗╚██████╔╝╚███╔███╔╝███████╗██║   
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝   
```

**Your second brain. Offline. Private. AI-powered.**

[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-00FF9D?style=flat-square&labelColor=050A14)](.)
[![Built with](https://img.shields.io/badge/built%20with-Expo%20SDK%2054-00FF9D?style=flat-square&labelColor=050A14)](https://expo.dev)
[![AI](https://img.shields.io/badge/AI-Groq%20llama--3.3--70b-00FF9D?style=flat-square&labelColor=050A14)](https://groq.com)
[![Storage](https://img.shields.io/badge/storage-AsyncStorage%20%7C%20Offline--first-00FF9D?style=flat-square&labelColor=050A14)](.)
[![License](https://img.shields.io/badge/license-MIT-00FF9D?style=flat-square&labelColor=050A14)](LICENSE)

</div>

---

## What is Flowly?

Flowly is a fully offline, no-account productivity app. Notes, tasks, projects, and an AI assistant — all stored on your device. No cloud. No sign-in. No data leaving your phone unless you choose to export it.

---

## Features

| | |
|---|---|
| **Notes** | Rich markdown notes with tags, pinning, archiving, and AI inline actions |
| **Tasks** | Full task management — priorities, due dates, subtasks, recurring, starred |
| **Projects** | Group tasks and notes under color-coded projects |
| **AI Chat** | Groq-powered assistant with full access to your data. Ask questions, create items by voice |
| **Daily Brief** | AI-generated morning summary of your day |
| **Calendar** | Visual calendar view of all due tasks and events |
| **Search** | Instant full-text search across everything |
| **Dark / Light** | Polished dark mode by default, full light mode support |
| **Offline-first** | 100% local AsyncStorage. Works with no internet |
| **No account** | One-time name setup. That's it. |

---

## AI — How It Works

The AI assistant uses **Groq's llama-3.3-70b** model and has read access to all your notes, tasks, and projects in every conversation.

### Creating items via AI

Just ask naturally:

```
"Create a task to review the proposal by Friday"
→ Task created: "Review the proposal" · due Friday

"Make a note about my meeting with the design team"
→ Note created with your content

"Start a new project called Website Redesign"
→ Project created: Website Redesign
```

The AI responds with a confirmation message. The item appears instantly in your app. No JSON shown to you — ever.

### Asking questions

```
"What tasks are overdue?"
"Summarize my notes about marketing"
"What's my focus for today?"
```

The AI reads your actual data and answers directly.

---

## Tech Stack

```
React Native + Expo SDK 54
Expo Router (file-based navigation)
Zustand (state management)
AsyncStorage (local persistence)
Groq API — llama-3.3-70b-versatile
expo-haptics, expo-notifications
TypeScript throughout
```

---

## Project Structure

```
flowly/
├── app/
│   ├── (auth)/          # Onboarding (first launch only)
│   ├── (tabs)/          # Main app tabs
│   ├── notes/[id]       # Note detail
│   ├── tasks/[id]       # Task detail
│   ├── projects/[id]    # Project detail
│   └── modals/          # Quick capture, AI command
├── components/
│   ├── ui/              # Design system (ClayCard, GlowButton, etc.)
│   ├── tasks/
│   ├── notes/
│   └── home/
├── stores/              # Zustand stores (auth, tasks, notes, projects, ai, theme)
├── lib/                 # AI client, storage, notifications
├── constants/           # Theme, colors, spacing
└── types/               # TypeScript types
```

---

## Getting Started

```bash
# Install dependencies
cd flowly
npm install

# Start dev server
npx expo start

# Build for Android (EAS)
eas build --platform android --profile preview
```

Requires an [Expo account](https://expo.dev) for EAS builds.

---

## Data & Privacy

- All data is stored locally using AsyncStorage on your device
- Nothing is sent to any server except AI chat messages (sent to Groq's API for processing)
- AI chat history is stored locally only
- Export your data anytime from Profile → Export All Data
- Reset everything from Profile → Reset App

---

## Reset App

Profile → Reset App wipes all local data and returns to the onboarding screen. This is permanent and cannot be undone.

---

<div align="center">

Made with focus. Built for flow.

</div>
