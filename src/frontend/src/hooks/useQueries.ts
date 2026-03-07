import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlertLog, EmergencyContact, UserProfile } from "../backend.d";
import {
  addLocalContact,
  getLocalContacts,
  removeLocalContact,
  updateLocalContact,
} from "../utils/localContacts";
import { useActor } from "./useActor";

// ── User Profile ──────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ── Emergency Contacts — local only ───────────────────────────────────────────

export function useEmergencyContacts() {
  return useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts"],
    queryFn: () => getLocalContacts(),
  });
}

export function useAddEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: EmergencyContact) => {
      addLocalContact(contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      contact,
    }: { index: bigint; contact: EmergencyContact }) => {
      updateLocalContact(Number(index), contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

export function useRemoveEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      removeLocalContact(Number(index));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

// ── Alert Logs ────────────────────────────────────────────────────────────────

export function useAlertLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<AlertLog[]>({
    queryKey: ["alertLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlertLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      latitude,
      longitude,
    }: { latitude: number; longitude: number }) => {
      if (!actor) return; // non-blocking — silently skip if not authenticated
      return actor.logAlert(latitude, longitude);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alertLogs"] });
    },
  });
}
