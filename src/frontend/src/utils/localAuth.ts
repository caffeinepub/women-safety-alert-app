const AUTH_KEY = "wsa_local_profile";

export interface LocalProfile {
  name: string;
  phone: string;
  pinHash: string;
}

/** Simple deterministic hash — not cryptographic, but good enough for local PIN */
function hashPin(pin: string): string {
  let hash = 5381;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash * 33) ^ pin.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function isProfileSetup(): boolean {
  try {
    return !!localStorage.getItem(AUTH_KEY);
  } catch {
    return false;
  }
}

export function getLocalProfile(): LocalProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

export function saveLocalProfile(
  name: string,
  phone: string,
  pin: string,
): void {
  const profile: LocalProfile = { name, phone, pinHash: hashPin(pin) };
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function verifyPin(pin: string): boolean {
  const profile = getLocalProfile();
  if (!profile) return false;
  return profile.pinHash === hashPin(pin);
}

export function clearLocalProfile(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}
