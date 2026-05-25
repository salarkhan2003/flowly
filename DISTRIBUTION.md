# Flowly — APK distribution & updates

Flowly is distributed **outside the Play Store** as a signed APK. Android never auto-updates sideloaded apps — you host the APK, and the app **asks** users when a newer version exists.

---

## How it works (3 pieces)

| Piece | You maintain | App behavior |
| --- | --- | --- |
| **APK file** | GitHub Release or your server | User downloads & installs manually |
| **`release/version.json`** | Same repo / your domain | App fetches this when online |
| **In-app checker** | Built into Flowly (`lib/updates.ts`) | Compares `versionCode`, shows badge or prompt |

There is **no silent auto-update**. Users tap Download → browser → install over the old app (data stays if `versionCode` increased and signing key matches).

---

## 1. Build a production APK

`eas.json` is set to **`buildType: "apk"`** for the `production` profile.

```powershell
cd "D:\PROJECTS\NOTE TAKER\SOFTWARE\V1-NOTE TAKER"
npm install

# If `eas` fails, use the global install path:
& "D:\npm-global\eas.cmd" build:configure -p android
& "D:\npm-global\eas.cmd" build --platform android --profile production
```

When the build finishes, Expo gives a **download URL**. Save the file as e.g. `Flowly-1.0.0.apk`.

### Before every release

1. Bump in **`app.json`**:
   - `"version": "1.0.1"` — shown to users
   - `"android": { "versionCode": 2 }` — **must increase by 1** or Android says “App not installed”
2. Use the **same EAS credentials** every time (EAS handles signing; do not reset the keystore).
3. Test on a real phone: install v1, then install v2 over it. Notes/tasks should remain.

### EAS CLI on Windows

If `eas` errors with `Cannot find module ... eas-cli\bin\run`, your PATH may point to a broken shim. Use:

```powershell
& "D:\npm-global\eas.cmd" build ...
```

Or: `npx eas-cli@latest build ...`

### Groq API key for cloud builds

Do **not** put keys in `eas.json`. Set once:

```powershell
eas secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value YOUR_KEY --scope project
```

---

## 2. Host the APK on your website

**Recommended: GitHub Releases** (free, reliable, `latest` URL).

1. GitHub → **salarkhan2003/flowly** → Releases → **Draft new release**
2. Tag: `v1.0.0`, upload `Flowly-1.0.0.apk`
3. Optional: rename asset to **`Flowly.apk`** on every release so the URL stays stable

**Stable download URL:**

```text
https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk
```

### Website HTML (landing page)

```html
<a
  href="https://github.com/salarkhan2003/flowly/releases/latest/download/Flowly.apk"
  class="download-btn"
  download
>
  Download Flowly APK · v1.0.0 · ~30 MB
</a>

<p class="help-text">
  Android may block “unknown apps”. Tap <strong>Download</strong> → open the file →
  <strong>Settings</strong> → allow this browser → <strong>Install</strong>.
  <a href="/install-help">Install help</a>
</p>
```

Add a **QR code** on desktop so users scan with their phone.

---

## 3. Host `version.json` (update manifest)

File in this repo: **`release/version.json`**

After each release, update it and push to `main`. The app loads:

```text
https://raw.githubusercontent.com/salarkhan2003/flowly/main/release/version.json
```

Override with `.env`:

```env
EXPO_PUBLIC_UPDATE_MANIFEST_URL=https://yourdomain.com/flowly/version.json
```

### Example for v1.0.1

```json
{
  "latestVersion": "1.0.1",
  "latestVersionCode": 2,
  "apkUrl": "https://github.com/salarkhan2003/flowly/releases/download/v1.0.1/Flowly-1.0.1.apk",
  "changelog": "• Fixed crash on launch\n• Faster search",
  "forceUpdate": false
}
```

| Field | Rule |
| --- | --- |
| `latestVersionCode` | Must match `app.json` `android.versionCode` of the new APK |
| `apkUrl` | Direct link to the **new** APK |
| `forceUpdate` | `true` only for critical bugs — blocks the app until user downloads |

---

## 4. What users see (update UX)

Configured in **Profile → App & Updates**:

| Setting | Behavior |
| --- | --- |
| **Notify in Settings** (default) | Check at most once per 24h when online; **“New”** badge + banner in Settings |
| **Prompt on launch** | Same check + **alert** when an update exists |
| **Never check** | No network check; user can tap “Check for updates now” |

Tapping **Download** opens the browser. User installs the new APK over the old one.

**Android will never update in the background** — that is normal for APK distribution.

---

## 5. Release checklist (every new version)

Copy this for v1.0.1, v1.0.2, …

- [ ] Edit `app.json`: bump `version` and `android.versionCode` (+1)
- [ ] `eas build --platform android --profile production`
- [ ] Download APK from Expo; test install over previous version on a phone
- [ ] Create GitHub Release `v1.0.x`, upload APK
- [ ] Edit `release/version.json` (`latestVersion`, `latestVersionCode`, `apkUrl`, `changelog`)
- [ ] `git add` / `commit` / `push` so `version.json` is live on `main`
- [ ] Update website download label (version + size)
- [ ] Announce (optional): “Update available when you open Flowly online”

---

## 6. Preview APK vs production APK

| Profile | Use |
| --- | --- |
| `preview` | Internal testing APK |
| `production` | What you ship on the website |

Both output APK in this project. Use **production** for public downloads.

---

## 7. Long-term: F-Droid (optional auto-updates)

APK + `version.json` = you control everything. For users who want **automatic** updates without Google Play, submit Flowly to [F-Droid](https://f-droid.org). Then your site can offer:

- **Download APK** — instant, manual updates  
- **Get on F-Droid** — updates via F-Droid app  

---

## Quick answers

**Will users get updates automatically?**  
No. They get a **prompt** (if enabled) and download the new APK.

**What do I change when I ship 1.0.1?**  
`app.json` version codes → EAS build → GitHub Release APK → `release/version.json`.

**Same APK link on the website forever?**  
Use `releases/latest/download/Flowly.apk` if you always name the asset `Flowly.apk`.

**Broken install “App not installed”?**  
`versionCode` not incremented, or different signing key than the installed app.

---

## Files added for this system

- `lib/updates.ts` — manifest fetch & version compare  
- `stores/updateStore.ts` — check state & alerts  
- `components/ForceUpdateGate.tsx` — blocks app when `forceUpdate: true`  
- `release/version.json` — template manifest (host on GitHub)  
- `constants/updates.ts` — default manifest URL  

See `DISTRIBUTION.md` whenever you ship a new APK.
