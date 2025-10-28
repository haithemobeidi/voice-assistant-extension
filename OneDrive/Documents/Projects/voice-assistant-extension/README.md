# Voice Assistant Browser Automation

A voice-controlled browser automation tool for hands-free web browsing.

## Overview

Control your browser with voice commands while your hands are busy (holding a child, cooking, etc.).

**Example commands:**
- "Click on the conversation with Mary Sue"
- "Scroll down"
- "Read the article title"
- "Reply with my standard response"

## Architecture

**Hybrid Architecture:**
- **Desktop App**: System-level microphone access and voice processing
- **Chrome Extension**: Browser automation and DOM manipulation
- **Native Messaging**: Communication bridge between components

## Development Status

🚧 **In Development** - Building incrementally with testing at each phase

See `/handoff/MASTER_HANDOFF_INDEX.md` for development progress.

## Technology Stack

**Desktop App:**
- Tauri (Rust) or Electron (JavaScript) - TBD
- Speech-to-Text: Vosk (offline) or Web Speech API
- Text-to-Speech: OS-level TTS
- Natural Language Processing: Compromise.js

**Chrome Extension:**
- Manifest V3
- TypeScript
- Content scripts for DOM access
- Native messaging for app communication

## Getting Started

Development setup instructions coming soon as components are built.
