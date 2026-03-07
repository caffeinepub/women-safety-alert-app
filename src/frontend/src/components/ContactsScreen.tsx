import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddEmergencyContact,
  useEmergencyContacts,
  useRemoveEmergencyContact,
  useUpdateEmergencyContact,
} from "@/hooks/useQueries";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Phone,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { EmergencyContact } from "../backend.d";

const RELATIONSHIPS = ["Parent", "Friend", "Guardian", "Sibling", "Partner"];
const MAX_CONTACTS = 5;

const RELATIONSHIP_BADGE_CLASS: Record<string, string> = {
  Parent: "badge-parent",
  Friend: "badge-friend",
  Guardian: "badge-guardian",
  Sibling: "badge-sibling",
  Partner: "badge-partner",
};

type FormData = {
  name: string;
  phone: string;
  relationship: string;
};

const emptyForm: FormData = { name: "", phone: "", relationship: "" };

export function ContactsScreen() {
  const { data: contacts = [], isLoading } = useEmergencyContacts();
  const addContact = useAddEmergencyContact();
  const updateContact = useUpdateEmergencyContact();
  const removeContact = useRemoveEmergencyContact();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState("");

  const isEditing = editIndex !== null;
  const isAtLimit = contacts.length >= MAX_CONTACTS;

  const openAdd = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setFormError("");
    setSheetOpen(true);
  };

  const openEdit = (index: number) => {
    const c = contacts[index];
    setForm({ name: c.name, phone: c.phone, relationship: c.relationship });
    setEditIndex(index);
    setFormError("");
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!form.relationship) {
      setFormError("Please select a relationship.");
      return;
    }
    setFormError("");

    const contact: EmergencyContact = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship,
    };

    if (isEditing) {
      updateContact.mutate(
        { index: BigInt(editIndex!), contact },
        { onSuccess: () => setSheetOpen(false) },
      );
    } else {
      addContact.mutate(contact, { onSuccess: () => setSheetOpen(false) });
    }
  };

  const handleRemove = (index: number) => {
    removeContact.mutate(BigInt(index));
  };

  const isPending = addContact.isPending || updateContact.isPending;

  return (
    <div className="flex flex-col h-full px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-lg font-bold font-display"
            style={{ color: "oklch(0.18 0.03 260)" }}
          >
            Emergency Contacts
          </h2>
          <p className="text-xs" style={{ color: "oklch(0.52 0.04 260)" }}>
            {contacts.length}/{MAX_CONTACTS} contacts saved
          </p>
        </div>
        <Button
          data-ocid="contacts.add_button"
          onClick={openAdd}
          disabled={isAtLimit}
          size="sm"
          className="rounded-full gap-1.5 font-semibold"
          style={{
            background: "oklch(0.32 0.18 280)",
            color: "white",
            opacity: isAtLimit ? 0.5 : 1,
          }}
        >
          <UserPlus size={15} />
          Add
        </Button>
      </div>

      {isAtLimit && (
        <div
          className="rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-sm"
          style={{
            background: "oklch(0.6 0.16 55 / 0.12)",
            color: "oklch(0.42 0.14 55)",
            border: "1px solid oklch(0.6 0.16 55 / 0.3)",
          }}
        >
          <AlertCircle size={14} />
          Maximum of {MAX_CONTACTS} contacts reached.
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div
          data-ocid="contacts.empty_state"
          className="flex-1 flex flex-col items-center justify-center text-center py-16"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.32 0.18 280 / 0.1)" }}
          >
            <Users size={28} style={{ color: "oklch(0.32 0.18 280)" }} />
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "oklch(0.25 0.05 260)" }}
          >
            No contacts yet
          </h3>
          <p
            className="text-sm max-w-xs"
            style={{ color: "oklch(0.52 0.04 260)" }}
          >
            Add trusted contacts who will receive your SOS alert.
          </p>
          <Button
            onClick={openAdd}
            className="mt-5 rounded-full font-semibold gap-2"
            style={{ background: "oklch(0.32 0.18 280)", color: "white" }}
          >
            <UserPlus size={16} />
            Add First Contact
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact, i) => {
            const ocidIndex = i + 1;
            return (
              <div
                key={`${contact.name}-${contact.phone}`}
                data-ocid={`contacts.item.${ocidIndex}`}
                className="rounded-xl px-4 py-3.5 transition-all"
                style={{
                  background: "oklch(1 0 0)",
                  border: "1px solid oklch(0.9 0.02 270)",
                  boxShadow: "0 1px 6px oklch(0.12 0.02 260 / 0.06)",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-black text-base"
                    style={{
                      background: "oklch(0.32 0.18 280 / 0.12)",
                      color: "oklch(0.32 0.18 280)",
                    }}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-sm truncate"
                        style={{ color: "oklch(0.18 0.03 260)" }}
                      >
                        {contact.name}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${RELATIONSHIP_BADGE_CLASS[contact.relationship] ?? "badge-friend"}`}
                      >
                        {contact.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone
                        size={11}
                        style={{ color: "oklch(0.52 0.04 260)" }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.52 0.04 260)" }}
                      >
                        {contact.phone}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      data-ocid={`contacts.edit_button.${ocidIndex}`}
                      onClick={() => openEdit(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        background: "oklch(0.55 0.15 280 / 0.1)",
                        color: "oklch(0.32 0.18 280)",
                      }}
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      data-ocid={`contacts.delete_button.${ocidIndex}`}
                      onClick={() => handleRemove(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{
                        background: "oklch(0.52 0.24 22 / 0.1)",
                        color: "oklch(0.48 0.2 22)",
                      }}
                      aria-label={`Remove ${contact.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl px-6 pb-8 pt-6"
          style={{ maxHeight: "90dvh" }}
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="font-display text-xl">
              {isEditing ? "Edit Contact" : "Add Emergency Contact"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="contact-name"
                className="text-sm font-semibold"
                style={{ color: "oklch(0.25 0.04 260)" }}
              >
                Full Name
              </Label>
              <Input
                id="contact-name"
                data-ocid="contacts.name_input"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="h-12 rounded-xl text-base"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="contact-phone"
                className="text-sm font-semibold"
                style={{ color: "oklch(0.25 0.04 260)" }}
              >
                Phone Number
              </Label>
              <Input
                id="contact-phone"
                data-ocid="contacts.phone_input"
                placeholder="e.g. +91 9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-12 rounded-xl text-base"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                className="text-sm font-semibold"
                style={{ color: "oklch(0.25 0.04 260)" }}
              >
                Relationship
              </Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, relationship: v }))
                }
              >
                <SelectTrigger
                  data-ocid="contacts.relationship_select"
                  className="h-12 rounded-xl text-base"
                >
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <div
                className="rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                style={{
                  background: "oklch(0.52 0.24 22 / 0.08)",
                  color: "oklch(0.42 0.2 22)",
                }}
              >
                <AlertCircle size={14} />
                {formError}
              </div>
            )}
          </div>

          <SheetFooter className="mt-6 flex gap-3">
            <Button
              data-ocid="contacts.cancel_button"
              variant="outline"
              onClick={() => setSheetOpen(false)}
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              data-ocid="contacts.submit_button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl font-semibold"
              style={{ background: "oklch(0.32 0.18 280)", color: "white" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  Saving…
                </>
              ) : isEditing ? (
                "Update Contact"
              ) : (
                "Add Contact"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
