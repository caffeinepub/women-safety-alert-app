import type { EmergencyContact } from "../backend.d";

const LOCAL_CONTACTS_KEY = "wsa_local_contacts";

export function getLocalContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(LOCAL_CONTACTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EmergencyContact[];
  } catch {
    return [];
  }
}

export function saveLocalContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(contacts));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function addLocalContact(contact: EmergencyContact): EmergencyContact[] {
  const contacts = getLocalContacts();
  contacts.push(contact);
  saveLocalContacts(contacts);
  return contacts;
}

export function updateLocalContact(
  index: number,
  contact: EmergencyContact,
): EmergencyContact[] {
  const contacts = getLocalContacts();
  if (index >= 0 && index < contacts.length) {
    contacts[index] = contact;
    saveLocalContacts(contacts);
  }
  return contacts;
}

export function removeLocalContact(index: number): EmergencyContact[] {
  const contacts = getLocalContacts();
  if (index >= 0 && index < contacts.length) {
    contacts.splice(index, 1);
    saveLocalContacts(contacts);
  }
  return contacts;
}

export function clearLocalContacts(): void {
  try {
    localStorage.removeItem(LOCAL_CONTACTS_KEY);
  } catch {
    // ignore
  }
}
