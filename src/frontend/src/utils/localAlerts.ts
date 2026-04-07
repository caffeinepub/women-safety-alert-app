const STORAGE_KEY = "wsa_alert_logs";

export interface LocalAlert {
  id: string;
  timestamp: string; // ISO string
  latitude: number;
  longitude: number;
}

export function getLocalAlerts(): LocalAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalAlert[];
  } catch {
    return [];
  }
}

export function addLocalAlert(latitude: number, longitude: number): void {
  const alerts = getLocalAlerts();
  const entry: LocalAlert = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    latitude,
    longitude,
  };
  alerts.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // localStorage full or unavailable — silently skip
  }
}

export function clearLocalAlerts(): void {
  localStorage.removeItem(STORAGE_KEY);
}
