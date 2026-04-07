// Local type definitions for app data models
// These replace types previously expected from backend.d.ts

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface UserProfile {
  name: string;
}

export interface AlertLog {
  timestamp: bigint;
  latitude: number;
  longitude: number;
}
