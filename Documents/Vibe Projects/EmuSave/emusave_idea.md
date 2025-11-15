Skip to content
Chat history

You said:
https://github.com/azahar-emu/azahar.git would you be able to build a cloud save feature into this? Using a local server on the host device to sync save datas? 
ChatGPT said:

Thought for 1m 3s
Short answer: yes, technically you can bolt a “cloud” (really LAN) save sync onto this, but you’re not going to do it inside Azahar easily unless you’re ready to swim in C++ + Kotlin and deal with GPL + upstream politics. Practically, I’d treat Azahar as a black box and build a sidecar sync system around its save folders.

Let me walk you through a concrete design you can vibe-code toward.

1. What you’re actually trying to sync
From what we know:

Azahar Android saves all data into a “User Folder” you pick on first launch. Under that:

Saves live in sdmc/Nintendo 3DS/.../title/.../<title-id>/main 
joeysretrohandhelds.com
+1

Citra on PC uses basically the same 3DS SD structure (sdmc/Nintendo 3DS/.../title/.../<title-id>/main), and Azahar can even point at Citra’s data folder and reuse it. 
GitHub
+1

So conceptually, all you need is:

“Keep the sdmc tree on PC and the sdmc tree on Android in sync.”

You don’t need game-level awareness; just move bytes.

2. Two possible routes (one easy, one DIY)
Route A – Use an existing sync tool (zero coding)
If you just want the result and don’t care about reinventing wheels:

Use Syncthing on both devices, and:

On Android: share the Azahar User Folder path (the one you selected when setting up Azahar, containing sdmc).

On PC: share Citra’s user folder (where its sdmc lives).

Set Syncthing to:

LAN-only.

Maybe “PC is master” or bidirectional, depending how you want conflicts handled.

This is exactly the type of thing people already do for other emus (Dolphin, DuckStation) on Android. 
joeysretrohandhelds.com

If you want “local cloud” with minimum pain, this is it.

Route B – DIY “local cloud” with a tiny server (what you asked for)
If you specifically want your own local server on the host device (PC) and a client on Android, do this:

2.1. Architecture
Server (PC)

Runs on your desktop / laptop.

Exposes REST endpoints over HTTP on LAN, e.g. http://192.168.1.10:5000.

Knows where Citra’s sdmc directory is.

Android client app

Knows where Azahar’s User Folder is (you’ll ask the user to pick it via a folder picker).

Watches for changes and pushes/pulls to the PC server.

You never touch Azahar’s code; you just operate on its file tree.

3. Concrete design
3.1. Server on PC (easiest in Node.js or Python)
Let’s pick Node.js + Express because it’s simple and cross-platform:

Core ideas:

Config file with:

citraSavePath – path to the sdmc directory used by Citra/Azahar on PC.

Endpoints:

GET /meta → returns current version / timestamp of save tree.

GET /download → zips the sdmc folder and streams it.

POST /upload → accepts a zip and overwrites/merges the sdmc folder.

Conflict handling: keep it simple:

Each side stores a last_sync_timestamp file.

“Last writer wins”:

Client checks /meta

If server’s timestamp > local, download; else upload.

You’d use libraries like archiver (zip) and adm-zip or unzipper to unpack.

Rough structure (no full code, just how you’d think about it):

config.json

server.js

lib/zip.js (pack/unpack helpers)

lib/fs_utils.js (safe copy, backup, etc.)

You can run this with node server.js and forward port only on LAN.

3.2. Android helper app
You’ll build a tiny Android app in Kotlin (or Java) whose only job is:

Let you choose the Azahar User Folder once (via the Storage Access Framework).

Store:

serverUrl (e.g. http://192.168.1.10:5000)

userFolderUri (the folder Azahar uses).

Offer two main actions:

“Sync from PC”

Call GET /download

Unzip into userFolderUri/sdmc, replacing existing files.

“Sync to PC”

Zip userFolderUri/sdmc

POST to POST /upload.

If you want to get fancy:

Add a FileObserver on the sdmc folder to auto-upload when saves change.

Or just a big obvious “Sync now” button you tap whenever you’re done playing on the phone.

Because Android storage is locked down, you’ll use:

Storage Access Framework (ACTION_OPEN_DOCUMENT_TREE)

Streams from a DocumentFile tree to zip/unzip.

4. How it all actually fits your use case (PC Citra ↔ Android Azahar)
Once you have this:

Pick canonical side (I’d choose the PC as canonical).

Initial setup:

Copy your existing Citra sdmc to where your server expects it.

On Android:

Point Azahar’s User Folder to e.g. Android/data/.../Azahar or a top-level Azahar folder you control.

First sync:

On Android app: “Sync from PC”

Now Azahar’s sdmc = Citra’s sdmc.

Going forward:

Play on PC:

When done, run a quick “Sync from PC” on phone before playing on Android.

Play on Android:

When done, hit “Sync to PC” before going back to PC.

Not transparent like real-time Steam Cloud, but simple and very vibe-code-able.

5. Could this be built into Azahar proper?
In theory, yes, but reality check:

Codebase:

Core is C++.

Android layer is Kotlin; desktop frontend is Qt/C++.

To add “Cloud saves” natively you’d need to:

Implement sync logic in both:

Android Kotlin UI and background workers.

Desktop C++ (Qt) settings + networking.

Possibly add cross-platform HTTP/WebDAV/WebSocket client code.

Deal with:

GPL-2.0 licensing for your code.

Upstream maintainers’ appetite for a LAN sync feature.

Azahar devs encourage feature requests via GitHub issues/milestones, but there’s no built-in save sync today. 
GitHub
+1

So realistically, for you right now, a sidecar app + small LAN server is the sane path.

6. What I can do next for you
If you want to actually build this, I can:

Sketch out a minimal Node.js server file you can drop into a folder and run.

Give you Android app skeleton:

MainActivity that:

Lets you choose the Azahar folder.

Stores the server URL.

Has two buttons: “Sync from PC” / “Sync to PC”.

Helper functions for zipping/unzipping via DocumentFile.

You tell me which part you want to start with (server vs Android app), and I’ll lay out the exact file structure + code you can paste into Android Studio / VS Code.

You said:
Maybe we turn it into an app, emu-sync. You point it towards the save folder on both the PC and android device and it automatically syncs whenever the app stops writing to the save data or whenever a save state is created. Doable? 
ChatGPT said:

Thought for 53s
Short version: yes, it’s doable, but “automatically sync whenever the app stops writing” is trickier than it sounds. You’re not going to get a perfect “hook into the emulator” without modifying the emulator itself, but you can get very close with filesystem watching + a debounce timer.

Think of Emu-Sync as:

“Watch a folder for save/save-state changes → wait a few seconds after the last write → sync the changed files to the other device.”

That’s absolutely buildable.

1. What “Emu-Sync” would actually be
Instead of hacking Azahar/Citra, you build a separate app that:

Runs on PC and on Android.

Lets the user pick a save folder on each.

Watches that folder for changes (save files & save states).

After the last file change has “settled”, it:

Zips + uploads changes to the other device, or

Pulls from the other device, depending on which side is newer.

Works for any emulator that writes to disk – not just Citra/Azahar.

2. High-level architecture
Option A – PC is the “server”, Android is the “client”
This is the simplest to get working:

PC app / daemon

Runs a small HTTP server on LAN (e.g. http://192.168.x.x:5000).

Watches one or more folders (e.g. Citra saves).

Endpoints like:

GET /manifest → list of files + hashes + timestamps.

GET /download → zip of changed files.

POST /upload → accept zip of changed files from Android.

Android app

Lets user pick Azahar’s save folder.

Watches that folder for changes (see below).

Talks to PC server over Wi-Fi.

On “change detected + quiet period”:

Compares manifests.

Pushes new files or pulls new ones.

You can start with manual buttons (“Sync to PC”, “Sync from PC”) and then add auto-triggered sync once you’re comfortable.

3. Detecting “when the emulator stops writing”
You don’t know when the emulator is done; you only know when:

A save file or savestate file changed on disk.

So you implement a debounce:

Watch the folder.

Any time a write happens, remember lastChangeTime = now.

Have a background timer check:

If now - lastChangeTime > N seconds (e.g. 5–10 sec), assume the emulator is idle → trigger sync.

PC side (easy)
On PC, this is trivial:

Use Node.js + chokidar, Python + watchdog, Go + fsnotify, etc.

You get events: add, change, unlink on files.

Pseudocode:

watcher.on('all', (event, path) => {
  if (isInSaveFolder(path)) {
    markDirty();
    lastChangeTime = Date.now();
  }
});

setInterval(() => {
  if (dirty && Date.now() - lastChangeTime > 5000) {
    runSync();
    dirty = false;
  }
}, 1000);
Android side (doable, but a bit more annoying)
Two cases:

You can access a real filesystem path for the save folder

If Azahar uses something like /storage/emulated/0/Azahar/sdmc/... and you can get that path, you can use FileObserver.

Same debounce logic as PC.

You only have a SAF / DocumentFile tree

FileObserver doesn’t work on URIs.

Workaround: when app is in foreground, do a cheap polling scan every X seconds and compare last modified times or hashes.

Or: skip auto-watch and just provide “Sync Now” for Android, and let PC watch passively.

For a first version, I’d be totally fine with:

PC: full auto-watch + debounce.

Android: “Sync Now” button plus optional periodic polling; no deep magic.

4. Sync logic & conflict handling
You need a simple way to know who has the latest saves.

4.1. Manifests
On each side, maintain something like:

{
  "deviceId": "PC_123",
  "lastSyncAt": "2025-11-14T10:15:00Z",
  "files": {
    "sdmc/Nintendo 3DS/.../main": {
      "mtime": 1731586500,
      "size": 32768,
      "hash": "abcd1234..."
    },
    "sdmc/.../state1.citra": { ... }
  }
}
Sync algorithm:

PC and Android exchange manifests.

For each file:

If exists on one side but not the other → copy it.

If exists on both but mtime/hash differs:

Simple rule: last modified wins.

Optional: keep backup by renaming the older one like main.bak.2025-11-14-1015.

No crazy merge logic; saves aren’t mergeable anyway.

4.2. Direction rules
You can give the user simple modes:

PC is master: Android only ever pulls from PC (good if PC is your “main” system).

Android is master: reverse.

Bidirectional with last-write-wins: more convenient but riskier if you forget to sync and play on both.

5. Hooking into save states
You don’t have to do anything special:

Save states are just files in some dir like states/ or similar.

Watching the folder tree will catch:

New savestate files.

Modified savestate files.

They get synced like any other file.

If you want to detect “a savestate just happened” for UI flair, just pattern-match filenames (e.g. .state, .citra, .dsv) but it’s not required for core functionality.

6. What’s hard vs what’s easy
Easy(-ish)
Watching folders on PC.

Serving files over LAN from PC.

Zipping/unzipping save directories.

A basic Android app with:

Server URL input.

Folder picker.

“Sync now” buttons.

Last-write-wins conflict logic.

Annoying / edge-casey
Flawless auto-detection on Android when using the modern storage APIs.

Handling:

Device asleep during sync.

User killing the app mid-transfer.

Network changes (switching Wi-Fi, etc.).

Making it generic for every emulator’s quirks (some write temp files, some write a lot, etc.)

None of that is show-stopping – it just means start simple:

Manual sync.

Then add auto-watch on PC.

Then add Android auto-watch/polling.

Then add nicer conflict options.

7. Reality check: is “Emu-Sync” viable as your project?
Yes, it’s actually a very good project for:

One small Node.js (or Python) backend.

One simple Kotlin Android app.

Very clear scope: “sync folders when they change.”

You don’t need to mess with Azahar’s source code at all.

If you want to actually build it, next step is to pick where to start:

Option 1: I give you a concrete Node.js server file (server.js) + folder structure and we get the PC side working first.

Option 2: I sketch the Android app’s MainActivity with a fake “Sync” call so you can get the UI and folder picking done, then wire it to the real server after.

You said:
I want a simple to use app for PC and android. Should be user friendly and simple for anyone to use. 
ChatGPT said:

Thought for 28s
Cool, so let’s define Emu-Sync as if we’re building something your non-tech cousin could actually use.

I’ll split this into:

What the user experience should look like (PC + Android)

What it does behind the scenes

A sane implementation plan you can actually build toward

1. UX: what Emu-Sync feels like
Core promise (keep this everywhere in the app)
“Pick your save folders on each device once. After that, hit Sync Now or turn on Auto Sync. That’s it.”

No jargon, no “manifests,” no “hashes,” no ports.

PC app UX (Windows)
App name: Emu-Sync
Main window has 3 visible sections:

Status card

Text like:

“Not paired with any Android device yet”

or “Paired with Pixel 10 – Last sync: 5 min ago”

Big Sync Now button

Tiny line: “Auto Sync: On/Off” with a toggle

Save folder setup

Simple list:

Citra saves → C:\Users\You\AppData\Roaming\Citra\sdmc

Other emulator (optional) → “Add folder”

Each row has:

Folder path (read-only)

“Change” button

Pairing box

If not paired:

Text: “On your phone, install Emu-Sync and scan this code to pair.”

QR code with the PC’s local IP + secret key baked in

Tiny text under it: “Or enter this code: 6F2J-QW9A”

If already paired:

“Paired with: Pixel 10 (Change…)”

First-run wizard (PC):

“Welcome to Emu-Sync”

Button: “Get started”

“Choose your emulator save folder”

Button: “Detect Citra automatically” (optional)

Button: “Browse manually”

“Pair your phone”

Show QR

Instructions: “Open Emu-Sync on Android and scan this QR”

Done:

“You’re ready! Keep this app running while you play to sync automatically.”

Android app UX
First run:

Screen 1 – “Welcome”

Text: “Emu-Sync keeps your game saves in sync between this phone and your PC.”

Button: “Continue”

Screen 2 – “Pair with PC”

Big button: Scan QR from PC

Small link: “Enter code manually”

Screen 3 – “Choose save folder”

Launch folder picker with clear text:

“Select the folder your emulator uses for saves. For Azahar, this is your User Folder (where sdmc is).”

Screen 4 – “Sync mode”

Option A (default): Manual + Smart Auto

Description: “You can tap Sync Now any time. We’ll also watch your saves and sync after you stop playing.”

Option B: Manual Only

“Only sync when you tap the button.”

Button: “Finish”

Main screen (Android, after setup)

Very simple:

Big primary button: Sync Now

Status text:

“Ready – Last synced 12 min ago.”

Or “Waiting for PC – Make sure your PC app is running on the same Wi-Fi.”

Toggle: Auto Sync [On/Off]

Small panel:

“PC: Gaming-PC (192.168.1.23)”

“Save folder: /storage/emulated/0/Azahar/sdmc”

Menu / settings:

Change PC

Change save folder

Advanced:

“Conflict handling: newer file wins (default)”

“Make a backup before overwriting” (on/off)

That’s it. No one ever sees “debounce” or “file hash” or “watchdog”.

2. Under the hood (real behavior, hidden from user)
2.1. Pairing
When you pair:

PC generates:

A random device ID and secret key

Knows its local IP and port (e.g. 192.168.1.10:5050)

QR contents can be something like:

emu-sync://pair?host=192.168.1.10&port=5050&id=PC_123&key=abc123
Android reads this, stores it, and now knows how to talk to the PC.

To user: “Scan this QR and you’re done.”

2.2. Network model
PC is the server:

Listens on host:port in LAN.

Provides endpoints:

/meta – returns info about folders + timestamps.

/pull – zip of the save directory.

/push – accepts zip with changes.

Android is the client:

Uses the host, port, key from pairing.

Handles retries if Wi-Fi drops.

Shows “Waiting for PC” if it can’t reach the server.

You can secure it minimally with the key in headers for now.

2.3. Detecting “when to sync”
What you want to look like to user:

“Auto Sync” = “We sync after you stop playing.”

What’s really happening:

PC app:

Watches configured save folders (File watcher).

Any time something changes:

Mark dirty = true.

Set lastChangeTime = now.

Every second:

If dirty and (now - lastChangeTime) > 5 seconds:

Run a sync (PC ↔ Android).

Set dirty = false.

Android app:

Option 1, simple: only sync when user taps Sync Now.

Option 2, “Smart Auto”:

When in foreground, poll the save folder every few seconds:

Track last modified times of files.

If changes stop for 5–10 seconds, trigger sync.

You tell users “we sync after you stop playing” but underneath it’s just “no file writes for X seconds.”

2.4. Sync logic (simplified but safe)
Android → PC: “Hey, here’s my manifest.”

PC:

Compares with its own manifest.

Works out which files changed where.

If bidirectional:

For each file:

If only on one side → copy to the other.

If on both, but different:

Compare mtime (last modified time).

Newer one wins.

Optionally, backup older one as filename.bak.YYYYMMDDHHMM.

For v1, you can even cheat:

Don’t bother diffing individual files.

Just zip the whole save folder and overwrite the other side.

That’s crude, but works fine as long as:

People only play on one device at a time.

You keep a backup folder.

You can always optimize later to “only changed files”.

3. Implementation plan you can actually follow
You said you’re a novice programmer but tech-savvy. So you want something you can vibe-code into existence, not a PhD project.

Step 1 – PC app (backend first, then UI)
Tech suggestion:

Backend: Node.js + Express

UI: Either:

Start with a barebones tray app / console window

OR go straight to Electron for a real desktop window

Phase 1 (barebones, functional):

Write server.js that:

Reads a config JSON (save folder path).

Has endpoints:

GET /pull → zip + send the save folder.

POST /push → receive zip, overwrite save folder.

No QR, you’ll just hardcode the IP on Android at first.

Once that works, then:

Phase 2 (friendly UI):

Wrap it in Electron:

Simple window with:

“Select save folder”

“Show QR” (once you add pairing)

List of recent syncs.

Keep the logic in Node; Electron is just a window around it.

Step 2 – Android app (basic first)
Tech: Kotlin + standard Android project.

Phase 1 (no auto, no QR):

Single activity:

Input field: PC IP/port (e.g. 192.168.1.10:5050)

Button: “Choose save folder” (Storage Access Framework).

Button: “Sync Now”

When you hit Sync Now:

Zip selected folder (or just read files into memory, zip).

POST /push to PC.

Or, for testing, just pull from PC (GET /pull) and overwrite Android folder.

Once that is stable and you understand it, then:

Phase 2 (user-friendly):

Add QR scanning:

Use a camera library (ML Kit or ZXing).

Parse emu-sync:// URL.

Replace IP field with “Scan QR”.

Add “Auto Sync” toggle and minimal polling.

Step 3 – Polishing for non-technical users
After basic sync works:

Polish error messages:

“Can’t find your PC. Are both devices on the same Wi-Fi? Is Emu-Sync running on your PC?”

Add setup wizard:

Don’t show raw config at first, only step-by-step screens.

Add backups:

Keep a backups/ folder with timestamped zips before overwriting.

4. Reality check / trade-offs (no fluff)
You are not going to get perfect, instant, Steam-quality cloud saves without:

Real hooks into each emulator, or

Deep platform-specific code.

You can get:

“Works 95% of the time.”

One-tap manual sync that’s brain-dead simple.

Auto-sync that behaves well enough that people forget it’s there.

From a user’s POV, that’s plenty:
“I played on my phone, tapped Sync, and the save was on my PC. Done.”

If you want, next I can lay out:

A concrete file structure for the PC side (Node/Electron project skeleton),

And the exact endpoints + payload formats you should implement first,
so you can start coding instead of just thinking about it.

You said:
Maybe make a quick html mockup for me of how it'd look/work too and can it work on outside networks as well if the host pc is on and is there a way to configure that in the app for an end user or do they need to port forward? 
ChatGPT said:

Thought for 24s
Good questions. Let me hit the network thing first, then I’ll give you a ready-to-save HTML mockup.

1. Outside networks / over the internet
Short answer:
Yes, it can work over the internet, but you have three realistic paths:

Option 1: Manual port forwarding (simplest to ship, ugliest UX)
Your PC app listens on port, say, 5050.

User logs into their router and forwards 5050 to their PC.

In the Android app they enter:

Either their home IP (or DDNS name) and port.

It works as long as:

Host PC is on and connected.

Router forwards correctly.

You can make this less painful by:

Having a “Remote access” toggle in the PC app that:

Shows “Your current public IP: x.x.x.x”

Recommends port number.

Gives 2–3 line help: “Log into router, forward port 5050 TCP to this PC.”

On Android, an “At home / Away” switch:

At home: use LAN IP.

Away: use public IP / hostname.

But there is no way around the fact that the user (or their router) needs to cooperate.

Option 2: VPN / overlay network (better UX, no router fiddling)
If both devices are in a Tailscale, ZeroTier, or similar mesh VPN:

From Emu-Sync’s point of view, it is still “LAN.”

No port forwarding.

Your app just talks to 100.x.x.x:5050 (Tailscale IP).

You could:

Detect “Tailscale present” and offer a helper mode.

Or just document: “If you install Tailscale on both, you can sync from anywhere without port forwarding.”

This is the easiest way to get “works outside your house” without running your own relay infra.

Option 3: Your own relay / cloud broker (best UX, most dev+infra work)
Pattern:

PC app and Android app both open outbound connections to your relay server.

Relay matches them by account or device ID and pipes data between them.

No port forwarding, no VPN, just “log in and click connect.”

That is basically building a mini Steam Remote Play / Syncthing’s relay servers. Powerful, but:

You must host and pay for the server.

You must write and maintain that backend.

For a solo project, I would:

Design the app to work beautifully on LAN.

Add “Away from home” support via “Use VPN (Tailscale, ZeroTier)” in docs.

Consider cloud relay later if this ever becomes a real product with users.

2. HTML mockup for Emu-Sync
Here is a single HTML file you can save as emu-sync-mockup.html and open in a browser. It is purely static, just to show the layout and flow for a user-friendly PC + Android UI.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Emu-Sync Mockup</title>
  <style>
    :root {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0f172a;
      color: #e5e7eb;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .app {
      max-width: 1100px;
      width: 100%;
      background: #020617;
      border-radius: 18px;
      padding: 24px 28px 30px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }

    .app-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .app-title span.logo {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: radial-gradient(circle at 30% 20%, #38bdf8, #4f46e5);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 16px;
    }

    .app-subtitle {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .badge {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.4);
    }

    .columns {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      margin-top: 10px;
    }

    @media (max-width: 840px) {
      .columns {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: rgba(15, 23, 42, 0.95);
      border-radius: 16px;
      padding: 16px 18px 18px;
      border: 1px solid rgba(148, 163, 184, 0.35);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pill {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      color: #9ca3af;
    }

    .section-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: #6b7280;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin: 10px 0 4px;
    }

    .status-text-main {
      font-size: 14px;
      font-weight: 500;
    }

    .status-text-sub {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      margin-right: 6px;
    }

    .btn {
      border: none;
      border-radius: 999px;
      padding: 8px 15px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.12s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: white;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.55);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 30px rgba(59, 130, 246, 0.7);
    }

    .btn-ghost {
      background: transparent;
      color: #9ca3af;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.6);
      padding-inline: 10px;
    }

    .btn-ghost:hover {
      background: rgba(15, 23, 42, 0.9);
    }

    .btn-icon {
      font-size: 14px;
    }

    .toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #9ca3af;
      cursor: pointer;
    }

    .toggle-switch {
      width: 32px;
      height: 18px;
      border-radius: 999px;
      background: rgba(55, 65, 81, 0.9);
      position: relative;
      transition: background 0.15s ease;
    }

    .toggle-switch::after {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: #111827;
      top: 2px;
      left: 2px;
      transition: transform 0.15s ease, background 0.15s ease;
    }

    .toggle.on .toggle-switch {
      background: #22c55e;
    }

    .toggle.on .toggle-switch::after {
      transform: translateX(14px);
      background: white;
    }

    .list {
      margin-top: 6px;
      border-radius: 12px;
      border: 1px solid rgba(31, 41, 55, 0.9);
      background: radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), rgba(15, 23, 42, 0.95));
      overflow: hidden;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      font-size: 12px;
      border-top: 1px solid rgba(31, 41, 55, 0.9);
    }

    .list-item:first-child {
      border-top: none;
    }

    .list-item-main {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .list-item-label {
      color: #9ca3af;
      font-size: 11px;
    }

    .list-item-value {
      color: #e5e7eb;
      white-space: nowrap;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .qr-box {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .qr {
      width: 90px;
      height: 90px;
      border-radius: 12px;
      background: repeating-linear-gradient(
        45deg,
        #020617,
        #020617 4px,
        #111827 4px,
        #111827 8px
      );
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      font-size: 10px;
      text-align: center;
      padding: 4px;
      border: 1px solid rgba(55, 65, 81, 0.9);
    }

    .qr-text {
      font-size: 12px;
      color: #9ca3af;
    }

    .qr-code-text {
      font-family: "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      color: #e5e7eb;
      background: rgba(15, 23, 42, 0.9);
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px dashed rgba(75, 85, 99, 0.8);
      display: inline-block;
      margin-top: 4px;
    }

    .hint {
      margin-top: 8px;
      font-size: 11px;
      color: #6b7280;
    }

    .phone-frame {
      margin-top: 6px;
      border-radius: 26px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      padding: 10px 8px;
      background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), rgba(15, 23, 42, 1));
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 1);
    }

    .phone-inner {
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.96);
      border: 1px solid rgba(31, 41, 55, 0.95);
      padding: 10px 12px 12px;
      font-size: 12px;
    }

    .phone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 11px;
      color: #9ca3af;
    }

    .phone-title {
      font-weight: 600;
      color: #e5e7eb;
    }

    .phone-main-btn {
      width: 100%;
      margin-top: 6px;
      margin-bottom: 4px;
      justify-content: center;
      font-size: 13px;
      padding-block: 9px;
    }

    .phone-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      gap: 6px;
    }

    .phone-label {
      font-size: 11px;
      color: #9ca3af;
    }

    .phone-value {
      font-size: 12px;
      color: #e5e7eb;
    }

    .chip {
      border-radius: 999px;
      padding: 3px 8px;
      border: 1px solid rgba(148, 163, 184, 0.6);
      font-size: 11px;
      color: #9ca3af;
    }

    .footer-note {
      margin-top: 18px;
      font-size: 11px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .footer-note strong {
      color: #e5e7eb;
      font-weight: 500;
    }
  </style>
</head>
<body>
<div class="app">
  <div class="app-header">
    <div>
      <div class="app-title">
        <span class="logo">E</span>
        Emu-Sync
      </div>
      <div class="app-subtitle">
        Keep emulator save data in sync between your PC and Android. No accounts, just your devices.
      </div>
    </div>
    <span class="badge">Concept UI Mockup</span>
  </div>

  <div class="columns">
    <!-- PC APP -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>PC App</span>
          <span class="pill">Host</span>
        </div>
        <button class="btn btn-ghost">
          <span class="btn-icon">⚙️</span> Settings
        </button>
      </div>

      <div class="section-label">Status</div>
      <div class="status-row">
        <div>
          <div class="status-text-main">
            <span class="status-dot"></span>
            Paired with <strong>Pixel 10 Pro</strong>
          </div>
          <div class="status-text-sub">
            Last sync 5 minutes ago · Auto Sync is enabled
          </div>
        </div>
        <button class="btn btn-primary">
          <span class="btn-icon">⟳</span> Sync now
        </button>
      </div>

      <label class="toggle on" style="margin-top: 2px;">
        <div class="toggle-switch"></div>
        <span>Auto Sync after saves finish writing</span>
      </label>

      <div class="section-label">Save folders</div>
      <div class="list">
        <div class="list-item">
          <div class="list-item-main">
            <span class="list-item-label">Citra save folder</span>
            <span class="list-item-value">C:\Users\You\AppData\Roaming\Citra\sdmc</span>
          </div>
          <button class="btn btn-ghost">
            Change
          </button>
        </div>
        <div class="list-item">
          <div class="list-item-main">
            <span class="list-item-label">Add another emulator</span>
            <span class="list-item-value">Optional · RetroArch, Dolphin and more</span>
          </div>
          <button class="btn btn-ghost">
            + Add folder
          </button>
        </div>
      </div>

      <div class="section-label">Pairing</div>
      <div class="qr-box">
        <div class="qr">
          <div>QR<br>placeholder</div>
        </div>
        <div class="qr-text">
          On your Android device, open Emu-Sync and scan this code to pair.
          <div class="qr-code-text">Pair code: 6F2J-QW9A</div>
        </div>
      </div>

      <div class="hint">
        Remote use from outside your home network requires either port forwarding
        or a VPN (Tailscale, ZeroTier). Emu-Sync can guide users through that in an
        “Advanced” section.
      </div>
    </div>

    <!-- ANDROID APP -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Android App</span>
          <span class="pill">Client</span>
        </div>
        <button class="btn btn-ghost">
          <span class="btn-icon">📷</span> Scan QR
        </button>
      </div>

      <div class="section-label">Phone preview</div>
      <div class="phone-frame">
        <div class="phone-inner">
          <div class="phone-header">
            <div class="phone-title">Emu-Sync</div>
            <span>Online</span>
          </div>

          <div class="status-text-main" style="font-size: 13px;">
            PC: <strong>Gaming-PC</strong>
          </div>
          <div class="status-text-sub">
            On Wi-Fi: 192.168.1.23 · Ready to sync
          </div>

          <button class="btn btn-primary phone-main-btn">
            <span class="btn-icon">⟳</span> Sync now
          </button>

          <label class="toggle on" style="margin-top: 4px;">
            <div class="toggle-switch"></div>
            <span style="font-size: 11px;">Auto Sync on this device</span>
          </label>

          <div class="phone-row">
            <div>
              <div class="phone-label">Save folder</div>
              <div class="phone-value">
                /storage/emulated/0/Azahar/UserFolder/sdmc
              </div>
            </div>
            <button class="btn btn-ghost" style="padding-inline: 8px;">
              Change
            </button>
          </div>

          <div class="phone-row" style="margin-top: 10px;">
            <div>
              <div class="phone-label">Mode</div>
              <div class="phone-value">Bidirectional · Newest file wins</div>
            </div>
            <span class="chip">Backups enabled</span>
          </div>

          <div class="hint" style="margin-top: 10px;">
            When you finish playing on this device, Emu-Sync waits a few seconds
            for saves to settle, then syncs to your PC automatically.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    <div>
      <strong>At home:</strong> Android connects to the PC over local Wi-Fi. No router setup needed.
    </div>
    <div>
      <strong>Away from home:</strong> Either forward a port on the router and use your home IP, or connect both devices
      through a VPN like Tailscale so Emu-Sync still feels like a local connection.
    </div>
  </div>
</div>
</body>
</html>
This does nothing functional yet, but it gives you:

A clean “PC app” card that matches the mental model you described.

A “phone preview” that shows what the Android UI could feel like.

Copy you can reuse in the real UI later.

If you want, next step I can:

Strip this down into the actual Electron layout plus

A minimal Node server skeleton you can start wiring behind this UI.






No file chosenNo file chosen
ChatGPT can make mistakes. Check important info.
