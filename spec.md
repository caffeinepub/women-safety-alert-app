# Women Safety Alert App

## Current State
- HomeScreen has an SOS button that: gets GPS location, plays alarm, logs alert to backend, and shows a dialog with a Google Maps link message.
- The alert dialog shows a static text message saying "Emergency contacts have been notified" — but contacts are NOT actually notified automatically.
- Emergency contacts are stored in the backend (name, phone, relationship).
- ContactsScreen lets users add/edit/remove up to 5 contacts.

## Requested Changes (Diff)

### Add
- When the SOS button is pressed, automatically fetch all saved emergency contacts and open the native device share sheet (Web Share API) for each contact's phone number with a pre-filled WhatsApp/SMS deep link.
- In the SOS alert dialog, show a list of all emergency contacts with individual "Share" buttons that open `sms:` or `https://wa.me/` deep links pre-filled with the emergency message + Google Maps location link.
- A single "Share with All Contacts" button in the SOS dialog that triggers `navigator.share()` (Web Share API) with the full emergency message so the user can forward it via any app.
- Display contact names in the SOS alert dialog so the user can see who was notified.

### Modify
- `HomeScreen.tsx`: fetch emergency contacts via `useEmergencyContacts` hook; after SOS triggers and location is obtained, build per-contact share links; update the SOS dialog to show contacts list with share actions.
- SOS dialog message updated to show the location link alongside each contact.

### Remove
- Nothing removed.

## Implementation Plan
1. In `HomeScreen.tsx`, import `useEmergencyContists` from `useQueries`.
2. After getting GPS coords, build the Google Maps link and compose the emergency message.
3. In the SOS alert dialog, add a "Share with All" button using `navigator.share()` API (falls back gracefully if not supported).
4. Add a contacts list in the dialog showing each saved contact with:
   - SMS deep link: `sms:<phone>?body=<encoded message>`
   - WhatsApp deep link: `https://wa.me/<phone>?text=<encoded message>`
5. If no contacts are saved, show a prompt to add contacts.
6. Auto-trigger `navigator.share()` immediately when SOS fires (if supported by the browser).
