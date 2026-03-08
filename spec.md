# Women Safety Alert App

## Current State

A web-based women's safety app with:
- PIN-based local authentication (first-time setup + return PIN unlock)
- SOS button that gets GPS location and opens SMS/WhatsApp for each saved contact
- Emergency contacts management (saved to localStorage)
- Shake detection for auto-alert
- Voice activation
- Loud alarm sound
- Helpline cards (112 Police, 101 Fire, 108 Ambulance)
- React + TypeScript frontend, Motoko backend

No PWA support currently. No web app manifest. No service worker. No installable experience on Android.

## Requested Changes (Diff)

### Add
- `manifest.webmanifest` in `public/` with app name, icons, theme color, display mode (standalone), orientation (portrait), start URL
- App icons: 192x192 and 512x512 (use generated PNG, also create a 192x192 resized version)
- Service worker (`sw.js`) registered in `index.html` for offline caching of app shell
- Meta tags in `index.html`: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, apple touch icon link
- "Add to Home Screen" install prompt banner in the app UI (shown when `beforeinstallprompt` fires on Android Chrome)

### Modify
- `index.html`: add manifest link, meta tags, service worker registration script, apple touch icon
- `vite.config.js`: ensure public assets are copied correctly (manifest, sw.js)

### Remove
- Nothing removed

## Implementation Plan

1. Create `src/frontend/public/manifest.webmanifest` with full PWA metadata
2. Create `src/frontend/public/sw.js` as a simple cache-first service worker for app shell
3. Update `src/frontend/index.html` to link the manifest, add all meta tags, register the service worker
4. Add an install prompt banner component in the React app that listens for `beforeinstallprompt` and shows a "Install App" button
5. Wire the install banner into the main App layout so it appears at the top on Android Chrome
