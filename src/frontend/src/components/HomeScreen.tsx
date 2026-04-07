import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { playAlarm, stopAlarm } from "@/utils/alarm";
import { addLocalAlert } from "@/utils/localAlerts";
import { getLocalContacts } from "@/utils/localContacts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { EmergencyContact } from "../types";

interface HomeScreenProps {
  shakeEnabled: boolean;
  voiceEnabled: boolean;
  isListening: boolean;
  onSOSTriggered?: () => void;
}

type SOSStatus = "idle" | "loading" | "success" | "error";

const HELPLINES = [
  {
    type: "police",
    name: "Police Helpline",
    description: "Emergency police assistance",
    phone: "112",
    color: "oklch(0.32 0.18 280)",
    bg: "oklch(0.32 0.18 280 / 0.1)",
  },
  {
    type: "fire",
    name: "Fire Emergency",
    description: "Fire brigade & rescue services",
    phone: "101",
    color: "oklch(0.52 0.24 22)",
    bg: "oklch(0.52 0.24 22 / 0.1)",
  },
  {
    type: "ambulance",
    name: "Ambulance",
    description: "Medical emergency & ambulance",
    phone: "108",
    color: "oklch(0.38 0.2 145)",
    bg: "oklch(0.38 0.2 145 / 0.1)",
  },
];

export function HomeScreen({
  shakeEnabled,
  voiceEnabled,
  isListening,
}: HomeScreenProps) {
  const [sosStatus, setSOSStatus] = useState<SOSStatus>("idle");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertLocationLine, setAlertLocationLine] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [gpsActive] = useState(true);
  const [activeContacts, setActiveContacts] = useState<EmergencyContact[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerSOS = useCallback(async () => {
    if (sosStatus === "loading") return;
    setSOSStatus("loading");

    try {
      // Read contacts fresh from localStorage at trigger time
      const contacts = getLocalContacts();

      // Get GPS location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not available"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            maximumAge: 0,
          });
        },
      ).catch(() => null);

      const lat = position?.coords.latitude ?? 0;
      const lon = position?.coords.longitude ?? 0;

      // Play alarm
      playAlarm(30000);

      // Save alert to localStorage for history
      addLocalAlert(lat, lon);

      const hasRealLocation = lat !== 0 || lon !== 0;
      const mapsLink = hasRealLocation
        ? `https://maps.google.com/?q=${lat},${lon}`
        : null;

      const msg = mapsLink
        ? `🚨 EMERGENCY ALERT! I am in danger. Please help me immediately!\nMy current location: ${mapsLink}`
        : "🚨 EMERGENCY ALERT! I am in danger. Please help me immediately!\n(Location unavailable — please call me)";

      const locationLine = mapsLink
        ? mapsLink
        : "(Location unavailable — GPS off)";

      setEmergencyMessage(msg);
      setAlertLocationLine(locationLine);
      setActiveContacts(contacts);
      setSOSStatus("success");
      setAlertOpen(true);

      // Immediately open SMS for the first contact (no extra tap needed)
      if (contacts.length > 0) {
        const firstPhone = contacts[0].phone.replace(/\s/g, "");
        const encodedMsg = encodeURIComponent(msg);
        window.location.href = `sms:${firstPhone}?body=${encodedMsg}`;
      }

      // Countdown to auto-dismiss (30 seconds gives time to tap contacts)
      let count = 30;
      setCountdown(count);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setAlertOpen(false);
          setSOSStatus("idle");
        }
      }, 1000);
    } catch {
      setSOSStatus("error");
      setTimeout(() => setSOSStatus("idle"), 2000);
    }
  }, [sosStatus]);

  const dismissAlert = () => {
    stopAlarm();
    if (countdownRef.current) clearInterval(countdownRef.current);
    setAlertOpen(false);
    setSOSStatus("idle");
    setActiveContacts([]);
  };

  // Read contacts for the idle-state label (from localStorage directly)
  const contactCount = getLocalContacts().length;
  const isActive = sosStatus === "success";

  return (
    <div className="flex flex-col">
      {/* Hero SOS Area */}
      <div
        className="flex flex-col items-center justify-center pt-6 pb-4 px-6"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 22 / 0.08) 0%, transparent 70%)",
        }}
      >
        {/* SOS Button Container */}
        <div className="relative flex items-center justify-center my-6">
          {/* Pulse rings — only shown when active */}
          {isActive && (
            <>
              <span
                className="sos-button-ring-1 absolute inset-0 rounded-full"
                style={{
                  background: "oklch(0.52 0.24 22 / 0.3)",
                  borderRadius: "50%",
                }}
              />
              <span
                className="sos-button-ring-2 absolute inset-0 rounded-full"
                style={{
                  background: "oklch(0.52 0.24 22 / 0.2)",
                  borderRadius: "50%",
                }}
              />
            </>
          )}

          {/* The SOS Button */}
          <button
            type="button"
            data-ocid="sos.primary_button"
            onClick={() => void triggerSOS()}
            disabled={sosStatus === "loading"}
            aria-label="Trigger emergency SOS alert"
            className={[
              "relative z-10 rounded-full flex items-center justify-center select-none",
              "transition-all duration-200 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4",
              isActive ? "sos-active-glow" : "",
            ].join(" ")}
            style={{
              width: 200,
              height: 200,
              background:
                sosStatus === "error"
                  ? "oklch(0.38 0.12 22)"
                  : "radial-gradient(circle at 35% 35%, oklch(0.62 0.24 22), oklch(0.42 0.22 22))",
              boxShadow: isActive
                ? "0 12px 48px oklch(0.52 0.24 22 / 0.6), 0 4px 16px oklch(0.52 0.24 22 / 0.4)"
                : "0 8px 32px oklch(0.52 0.24 22 / 0.4), 0 2px 8px oklch(0.52 0.24 22 / 0.25), inset 0 1px 0 oklch(0.75 0.18 22 / 0.3)",
            }}
          >
            {/* Inner ring decoration */}
            <span
              className="absolute inset-3 rounded-full"
              style={{
                border: "2px solid oklch(1 0 0 / 0.2)",
              }}
            />

            {sosStatus === "loading" ? (
              <div className="flex flex-col items-center gap-1">
                <Loader2
                  className="animate-spin"
                  size={40}
                  color="white"
                  strokeWidth={2.5}
                />
                <span
                  className="text-sm font-bold tracking-widest"
                  style={{ color: "oklch(1 0 0 / 0.9)" }}
                >
                  SENDING
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span
                  className="font-display font-black tracking-[0.15em]"
                  style={{
                    fontSize: 52,
                    lineHeight: 1,
                    color: "white",
                    textShadow: "0 2px 8px oklch(0.3 0.15 22 / 0.5)",
                  }}
                >
                  SOS
                </span>
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "oklch(1 0 0 / 0.75)" }}
                >
                  {contactCount > 0
                    ? `Alerts ${contactCount} contact${contactCount > 1 ? "s" : ""}`
                    : "Tap for Help"}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* SOS Status States */}
        {sosStatus === "loading" && (
          <div
            data-ocid="sos.loading_state"
            className="flex items-center gap-2 text-sm font-medium slide-up"
            style={{ color: "oklch(0.52 0.24 22)" }}
          >
            <Loader2 size={14} className="animate-spin" />
            Getting your location…
          </div>
        )}
        {sosStatus === "success" && (
          <div
            data-ocid="sos.success_state"
            className="flex items-center gap-2 text-sm font-medium slide-up"
            style={{ color: "oklch(0.38 0.2 145)" }}
          >
            <CheckCircle2 size={14} />
            Location ready — tap contacts below to send!
          </div>
        )}
        {sosStatus === "error" && (
          <div
            data-ocid="sos.error_state"
            className="flex items-center gap-2 text-sm font-medium slide-up"
            style={{ color: "oklch(0.52 0.24 22)" }}
          >
            <AlertCircle size={14} />
            Error. Try again.
          </div>
        )}
        {sosStatus === "idle" && (
          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.52 0.04 260)" }}
          >
            {contactCount > 0
              ? `Pressing SOS will show send options for ${contactCount} contact${contactCount > 1 ? "s" : ""}`
              : "Add contacts in the Contacts tab to send alerts"}
          </p>
        )}
      </div>

      {/* Status Indicators */}
      <div className="px-4 py-3">
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-around"
          style={{
            background: "oklch(0.95 0.02 280)",
            border: "1px solid oklch(0.88 0.03 280)",
          }}
        >
          <StatusIndicator
            icon={<MapPin size={16} />}
            label="GPS"
            active={gpsActive}
          />
          <div
            className="h-6 w-px"
            style={{ background: "oklch(0.88 0.03 280)" }}
          />
          <StatusIndicator
            icon={<Volume2 size={16} />}
            label="Alarm"
            active={isActive}
          />
          <div
            className="h-6 w-px"
            style={{ background: "oklch(0.88 0.03 280)" }}
          />
          <StatusIndicator
            icon={<Activity size={16} />}
            label="Shake"
            active={shakeEnabled}
          />
          <div
            className="h-6 w-px"
            style={{ background: "oklch(0.88 0.03 280)" }}
          />
          <StatusIndicator
            icon={
              <Mic size={16} className={isListening ? "listening-pulse" : ""} />
            }
            label="Voice"
            active={voiceEnabled}
            blinking={isListening}
          />
        </div>
      </div>

      {/* Emergency Helplines */}
      <div className="flex-1 px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={16} style={{ color: "oklch(0.52 0.24 22)" }} />
          <h2
            className="text-sm font-bold tracking-wide uppercase"
            style={{ color: "oklch(0.32 0.18 280)" }}
          >
            Emergency Helplines
          </h2>
        </div>

        <div className="space-y-2">
          {HELPLINES.map((helpline, idx) => (
            <a
              key={helpline.phone}
              href={`tel:${helpline.phone}`}
              data-ocid={`helpline.call_button.${idx + 1}`}
              className="rounded-xl px-4 py-4 flex items-center gap-4 transition-all active:scale-[0.98]"
              style={{
                background: "oklch(1 0 0)",
                border: `1px solid ${helpline.color.replace(")", " / 0.2)")}`,
                boxShadow: "0 1px 4px oklch(0.12 0.02 260 / 0.06)",
                display: "flex",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: helpline.bg }}
              >
                <Phone size={22} style={{ color: helpline.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-base font-bold"
                  style={{ color: "oklch(0.18 0.03 260)" }}
                >
                  {helpline.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.52 0.04 260)" }}
                >
                  {helpline.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{ color: helpline.color }}
                >
                  {helpline.phone}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: helpline.bg,
                    color: helpline.color,
                  }}
                >
                  Tap to Call
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* SOS Alert Modal */}
      <Dialog open={alertOpen} onOpenChange={(open) => !open && dismissAlert()}>
        <DialogContent
          data-ocid="sos.dialog"
          className="mx-4 max-w-sm rounded-2xl p-0 overflow-hidden border-0"
          style={{
            boxShadow: "0 24px 80px oklch(0.52 0.24 22 / 0.4)",
          }}
        >
          {/* Red header */}
          <div
            className="px-6 pt-6 pb-4 text-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.24 22), oklch(0.38 0.2 22))",
            }}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                data-ocid="sos.close_button"
                onClick={dismissAlert}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "oklch(1 0 0 / 0.15)" }}
                aria-label="Dismiss alert"
              >
                <X size={16} color="white" />
              </button>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "oklch(1 0 0 / 0.15)" }}
            >
              <AlertCircle size={32} color="white" />
            </div>
            <DialogTitle className="text-2xl font-black text-white tracking-wide">
              SOS ACTIVATED!
            </DialogTitle>
            <p className="text-sm mt-1" style={{ color: "oklch(1 0 0 / 0.9)" }}>
              {activeContacts.length > 0
                ? "SMS opened for your first contact. Tap below for others:"
                : "Location captured — add contacts to send alerts"}
            </p>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <DialogHeader>
              {/* Location box */}
              <div
                className="rounded-xl p-3 text-xs font-mono break-all"
                style={{
                  background: "oklch(0.97 0.01 260)",
                  color: "oklch(0.28 0.04 260)",
                  border: "1px solid oklch(0.9 0.02 270)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.52 0.24 22)" }}
                >
                  📍 Your location:{" "}
                </span>
                {alertLocationLine}
              </div>
            </DialogHeader>

            {/* Per-contact send buttons */}
            {activeContacts.length > 0 ? (
              <div className="mt-4">
                {/* Instruction banner */}
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
                  style={{
                    background: "oklch(0.38 0.2 145 / 0.1)",
                    border: "1px solid oklch(0.38 0.2 145 / 0.25)",
                  }}
                >
                  <Phone
                    size={14}
                    style={{ color: "oklch(0.38 0.2 145)" }}
                    className="flex-shrink-0"
                  />
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.28 0.14 145)" }}
                  >
                    Tap SMS to send your location to each contact
                  </p>
                </div>
                <ScrollArea className="max-h-56">
                  <div className="space-y-3 pr-1">
                    {activeContacts.map((contact, idx) => {
                      const cleanPhone = contact.phone.replace(/\s/g, "");
                      const waPhone = cleanPhone.replace(/\D/g, "");
                      const encoded = encodeURIComponent(emergencyMessage);
                      return (
                        <div
                          key={`${contact.name}-${idx}`}
                          data-ocid={`sos.contact.item.${idx + 1}`}
                          className="rounded-xl p-3"
                          style={{
                            background: "oklch(0.97 0.01 260)",
                            border:
                              idx === 0
                                ? "2px solid oklch(0.38 0.2 145 / 0.5)"
                                : "1px solid oklch(0.91 0.02 270)",
                          }}
                        >
                          {/* Name + relationship row */}
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                              style={{
                                background: "oklch(0.32 0.18 280 / 0.15)",
                                color: "oklch(0.32 0.18 280)",
                              }}
                            >
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-bold truncate"
                                style={{ color: "oklch(0.18 0.03 260)" }}
                              >
                                {contact.name}
                                {idx === 0 && (
                                  <span
                                    className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{
                                      background: "oklch(0.38 0.2 145 / 0.15)",
                                      color: "oklch(0.28 0.14 145)",
                                    }}
                                  >
                                    SMS sent ✓
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium px-1.5 py-0 h-4"
                                  style={{
                                    background: "oklch(0.32 0.18 280 / 0.1)",
                                    color: "oklch(0.32 0.18 280)",
                                    border: "none",
                                  }}
                                >
                                  {contact.relationship}
                                </Badge>
                                <span
                                  className="text-xs"
                                  style={{ color: "oklch(0.52 0.04 260)" }}
                                >
                                  {cleanPhone}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* PRIMARY: Full-width SMS button */}
                          <a
                            data-ocid={`sos.contact_sms_button.${idx + 1}`}
                            href={`sms:${cleanPhone}?body=${encoded}`}
                            className="w-full flex items-center justify-center gap-2 rounded-xl text-base font-black transition-all active:scale-[0.97] mb-2"
                            style={{
                              background:
                                "radial-gradient(ellipse at 40% 30%, oklch(0.48 0.22 145), oklch(0.34 0.18 145))",
                              color: "white",
                              padding: "13px 16px",
                              boxShadow:
                                "0 4px 16px oklch(0.38 0.2 145 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.15)",
                              letterSpacing: "0.03em",
                            }}
                            aria-label={`Send SMS to ${contact.name}`}
                          >
                            <Phone size={18} strokeWidth={2.5} />
                            Send SMS to {contact.name.split(" ")[0]}
                          </a>

                          {/* SECONDARY: WhatsApp — smaller, below SMS */}
                          <a
                            data-ocid={`sos.contact_wa_button.${idx + 1}`}
                            href={`https://wa.me/${waPhone}?text=${encoded}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
                            style={{
                              background: "oklch(0.94 0.04 155)",
                              color: "oklch(0.32 0.14 155)",
                              padding: "8px 12px",
                              border: "1px solid oklch(0.38 0.2 145 / 0.2)",
                            }}
                            aria-label={`Send WhatsApp to ${contact.name}`}
                          >
                            <MessageCircle size={13} />
                            Also send on WhatsApp
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div
                data-ocid="sos.no_contacts_warning"
                className="mt-4 flex items-start gap-2 rounded-xl p-3"
                style={{
                  background: "oklch(0.92 0.06 55 / 0.25)",
                  border: "1px solid oklch(0.80 0.10 55 / 0.4)",
                }}
              >
                <AlertTriangle
                  size={15}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.52 0.18 55)" }}
                />
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.38 0.12 55)" }}
                >
                  No emergency contacts saved. Go to the Contacts tab and add
                  contacts — no login needed.
                </p>
              </div>
            )}

            {/* Countdown + Stop Alarm */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs" style={{ color: "oklch(0.52 0.04 260)" }}>
                Auto-close in{" "}
                <span
                  className="font-bold"
                  style={{ color: "oklch(0.52 0.24 22)" }}
                >
                  {countdown}s
                </span>
              </p>
              <Button
                onClick={dismissAlert}
                className="rounded-full text-sm font-semibold px-5 h-9"
                style={{
                  background: "oklch(0.32 0.18 280)",
                  color: "white",
                }}
              >
                Stop Alarm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusIndicator({
  icon,
  label,
  active,
  blinking = false,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  blinking?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="transition-colors"
        style={{
          color: active ? "oklch(0.32 0.18 280)" : "oklch(0.65 0.02 260)",
        }}
      >
        {icon}
      </div>
      <div className="flex items-center gap-1">
        <span
          className={[
            "w-1.5 h-1.5 rounded-full",
            active && blinking ? "status-blink" : "",
          ].join(" ")}
          style={{
            background: active
              ? "oklch(0.55 0.19 145)"
              : "oklch(0.72 0.02 260)",
          }}
        />
        <span
          className="text-xs font-medium"
          style={{
            color: active ? "oklch(0.32 0.18 280)" : "oklch(0.55 0.02 260)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
