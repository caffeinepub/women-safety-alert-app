import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AlertLog {
    latitude: number;
    longitude: number;
    timestamp: Time;
}
export type Time = bigint;
export interface EmergencyContact {
    relationship: string;
    name: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    addEmergencyContact(contact: EmergencyContact): Promise<void>;
    getAlertLogs(): Promise<Array<AlertLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getEmergencyContacts(): Promise<Array<EmergencyContact>>;
    logAlert(latitude: number, longitude: number): Promise<void>;
    removeEmergencyContact(index: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEmergencyContact(index: bigint, contact: EmergencyContact): Promise<void>;
}
