# Women Safety Alert App

## Current State
The app uses Internet Identity (ICP cryptographic login) for authentication. There is a Login/Logout button in the header. Contacts are stored locally (localStorage) when not logged in and synced to backend on login. The app has no onboarding flow — users land directly on the home screen.

## Requested Changes (Diff)

### Add
- `src/utils/localAuth.ts` — utility to store/read a local profile (name, phone, PIN hash) in localStorage. PIN is stored as a simple hash (not plain text). Exposes: `getLocalProfile()`, `saveLocalProfile(name, phone, pin)`, `verifyPin(pin)`, `clearLocalProfile()`, `isProfileSetup()`.
- `src/components/SetupScreen.tsx` — first-use onboarding screen shown when no profile exists. Fields: Full Name, Phone Number, PIN (4–6 digits), Confirm PIN. On submit: saves profile locally and marks user as authenticated for the session.
- `src/components/UnlockScreen.tsx` — shown on return visits when profile exists but session is not unlocked. Shows the user's name, a PIN input, and an Unlock button. Wrong PIN shows an error. Option to "Reset / Start Over" (clears all local data).
- Session state in App.tsx: `isUnlocked` (boolean, starts false, set to true after setup or PIN verify). Entire app is gated behind this.

### Modify
- `App.tsx` — on mount, check `isProfileSetup()`. If not set up → show SetupScreen. If set up but not unlocked → show UnlockScreen. If unlocked → show the existing app shell (header + tabs + content). Remove the Internet Identity login/logout button from the header. Replace with a small profile pill showing the user's name.
- `ContactsScreen.tsx` — remove all Internet Identity login prompts, sync banners, and backend login checks. Contacts are always local-only now. Remove `useInternetIdentity`, `useSyncLocalContactsToBackend` dependencies. Keep add/edit/delete using local storage only.
- `useQueries.ts` — `useEmergencyContacts`, `useAddEmergencyContact`, `useUpdateEmergencyContact`, `useRemoveEmergencyContact` should always operate on local storage only (no backend calls, no login checks).

### Remove
- Internet Identity login/logout button from the app header
- "Saved on this device. Login to back up" banner in ContactsScreen
- "Sync to account" banner in ContactsScreen
- Backend sync logic from contact mutations

## Implementation Plan
1. Create `src/utils/localAuth.ts` with profile CRUD and PIN verification
2. Create `src/components/SetupScreen.tsx` (name + phone + PIN + confirm PIN form)
3. Create `src/components/UnlockScreen.tsx` (PIN entry for return visits)
4. Update `App.tsx`: add `isUnlocked` session state, gate rendering on auth screens, replace login button with profile name pill
5. Update `ContactsScreen.tsx`: remove II login prompts and sync banners, use local-only contact hooks
6. Update `useQueries.ts`: make all contact mutations local-only (remove backend/login branching)
