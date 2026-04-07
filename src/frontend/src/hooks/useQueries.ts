import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EmergencyContact } from "../types";
import {
  addLocalContact,
  getLocalContacts,
  removeLocalContact,
  updateLocalContact,
} from "../utils/localContacts";

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
