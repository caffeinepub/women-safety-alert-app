import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlertLog, EmergencyContact, UserProfile } from "../backend.d";
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

// ── Emergency Contacts ────────────────────────────────────────────────────────

export function useEmergencyContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmergencyContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmergencyContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: EmergencyContact) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addEmergencyContact(contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

export function useUpdateEmergencyContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      contact,
    }: { index: bigint; contact: EmergencyContact }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateEmergencyContact(index, contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

export function useRemoveEmergencyContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeEmergencyContact(index);
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
      if (!actor) throw new Error("Not authenticated");
      return actor.logAlert(latitude, longitude);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alertLogs"] });
    },
  });
}
