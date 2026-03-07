import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmergencyContacts, useLogAlert } from "@/hooks/useQueries";
import { playAlarm, stopAlarm } from "@/utils/alarm";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Share2,
  Shield,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

interface HomeScreenProps {
  shakeEnabled: boolean;
  voiceEnabled: boolean;
  isListening: boolean;
  onSOSTriggered?: () => void;
}

type SOSStatus = "idle" | "loading" | "success" | "error";

const NEARBY_PLACES = [
  {
    type: "police",
    name: "Central Police Station",
    address: "14 Precinct Road, Downtown",
    distance: "0.3 km",
    phone: "100",
  },
  {
    type: "police",
    name: "North District Police Post",
    address: "88 Safety Avenue, North Ward",
    distance: "0.8 km",
    phone: "100",
  },
  {
    type: "police",
    name: "Eastside Police Outpost",
    address: "221 Vigilance Street, East",
    distance: "1.4 km",
    phone: "100",
  },
  {
    type: "hospital",
    name: "City General Hospital",
    address: "5 Healthcare Blvd, Midtown",
    distance: "0.6 km",
    phone: "108",
  },
  {
    type: "hospital",
    name: "St. Mary Medical Centre",
    address: "77 Wellness Road, South",
    distance: "1.1 km",
    phone: "108",
  },
];

export function HomeScreen({
  shakeEnabled,
  voiceEnabled,
  isListening,
}: HomeScreenProps) {
  const [sosStatus, setSOSStatus] = useState<SOSStatus>("idle");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [gpsActive] = useState(true);
  const logAlert = useLogAlert();
  const { data: contacts = [] } = useEmergencyContacts();

  const triggerSOS = useCallback(async () => {
    if (sosStatus === "loading") return;
    setSOSStatus("loading");

    try {
      // Get GPS location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not available"));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 0,
          });
        },
      ).catch(() => null);

      const lat = position?.coords.latitude ?? 0;
      const lon = position?.coords.longitude ?? 0;

      // Play alarm
      playAlarm(10000);

      // Log to backend (non-blocking)
      logAlert.mutate({ latitude: lat, longitude: lon });

      const link = `https://maps.google.com/?q=${lat},${lon}`;
      const msg = `🚨 I am in danger. Please help! My location: ${link}`;
      const displayMsg = `🚨 ALERT SENT!\n\n"I am in danger. Please help!\nMy location: ${link}"`;

      setEmergencyMessage(msg);
      setAlertMessage(displayMsg);
      setSOSStatus("success");
      setAlertOpen(true);

      // Auto-trigger Web Share API immediately if supported
      if (navigator.share) {
        navigator.share({ title: "Emergency SOS", text: msg }).catch(() => {});
      }

      // Countdown to auto-dismiss
      let count = 5;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setAlertOpen(false);
          setSOSStatus("idle");
        }
      }, 1000);
    } catch {
      setSOSStatus("error");
      setTimeout(() => setSOSStatus("idle"), 2000);
    }
  }, [sosStatus, logAlert]);

  const dismissAlert = () => {
    stopAlarm();
    setAlertOpen(false);
    setSOSStatus("idle");
  };

  const isActive = sosStatus === "success";

  return (
    <div className="flex flex-col h-full">
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
                  Press & Hold
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
            Getting your location & sending alert…
          </div>
        )}
        {sosStatus === "success" && (
          <div
            data-ocid="sos.success_state"
            className="flex items-center gap-2 text-sm font-medium slide-up"
            style={{ color: "oklch(0.38 0.2 145)" }}
          >
            <CheckCircle2 size={14} />
            Alert sent! Alarm is active.
          </div>
        )}
        {sosStatus === "error" && (
          <div
            data-ocid="sos.error_state"
            className="flex items-center gap-2 text-sm font-medium slide-up"
            style={{ color: "oklch(0.52 0.24 22)" }}
          >
            <AlertCircle size={14} />
            Error sending. Try again.
          </div>
        )}
        {sosStatus === "idle" && (
          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.52 0.04 260)" }}
          >
            Tap the button or shake your phone to send an emergency alert
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

      {/* Nearby Help */}
      <div className="flex-1 px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} style={{ color: "oklch(0.52 0.24 22)" }} />
          <h2
            className="text-sm font-bold tracking-wide uppercase"
            style={{ color: "oklch(0.32 0.18 280)" }}
          >
            Nearby Help
          </h2>
        </div>

        <div className="space-y-2">
          {NEARBY_PLACES.map((place) => (
            <div
              key={place.name}
              className="rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
              style={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.9 0.02 270)",
                boxShadow: "0 1px 4px oklch(0.12 0.02 260 / 0.06)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    place.type === "police"
                      ? "oklch(0.32 0.18 280 / 0.12)"
                      : "oklch(0.52 0.24 22 / 0.1)",
                }}
              >
                {place.type === "police" ? (
                  <Shield
                    size={18}
                    style={{
                      color: "oklch(0.32 0.18 280)",
                    }}
                  />
                ) : (
                  <Building2
                    size={18}
                    style={{ color: "oklch(0.42 0.2 22)" }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "oklch(0.18 0.03 260)" }}
                >
                  {place.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "oklch(0.52 0.04 260)" }}
                >
                  {place.address}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.32 0.18 280)" }}
                >
                  {place.distance}
                </span>
                <a
                  href={`tel:${place.phone}`}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.62 0.19 145 / 0.12)",
                    color: "oklch(0.35 0.15 145)",
                  }}
                >
                  <Phone size={10} />
                  {place.phone}
                </a>
              </div>
            </div>
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
              ALERT SENT!
            </DialogTitle>
            <p className="text-sm mt-1" style={{ color: "oklch(1 0 0 / 0.8)" }}>
              Emergency contacts have been notified
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <DialogHeader>
              {/* Message box */}
              <div
                className="rounded-xl p-4 font-mono text-sm whitespace-pre-line"
                style={{
                  background: "oklch(0.97 0.01 260)",
                  color: "oklch(0.18 0.03 260)",
                  border: "1px solid oklch(0.9 0.02 270)",
                }}
              >
                {alertMessage}
              </div>
            </DialogHeader>

            {/* Share with All — only if Web Share is available */}
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                type="button"
                data-ocid="sos.share_all_button"
                onClick={() => {
                  navigator
                    .share({ title: "Emergency SOS", text: emergencyMessage })
                    .catch(() => {});
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wide transition-all active:scale-95"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, oklch(0.58 0.24 22), oklch(0.40 0.22 22))",
                  color: "white",
                  boxShadow: "0 4px 16px oklch(0.52 0.24 22 / 0.35)",
                }}
              >
                <Share2 size={16} />
                Share Location with All Contacts
              </button>
            )}

            {/* Per-contact send buttons */}
            {contacts.length > 0 ? (
              <div className="mt-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: "oklch(0.45 0.04 260)" }}
                >
                  Notify Contacts Directly
                </p>
                <ScrollArea className="max-h-44">
                  <div className="space-y-2 pr-1">
                    {contacts.map((contact, idx) => (
                      <div
                        key={`${contact.name}-${idx}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{
                          background: "oklch(0.97 0.01 260)",
                          border: "1px solid oklch(0.91 0.02 270)",
                        }}
                      >
                        {/* Name + relationship */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: "oklch(0.18 0.03 260)" }}
                          >
                            {contact.name}
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-0.5 text-xs font-medium px-1.5 py-0 h-4"
                            style={{
                              background: "oklch(0.32 0.18 280 / 0.1)",
                              color: "oklch(0.32 0.18 280)",
                              border: "none",
                            }}
                          >
                            {contact.relationship}
                          </Badge>
                        </div>

                        {/* SMS button */}
                        <a
                          data-ocid={`sos.contact_sms_button.${idx + 1}`}
                          href={`sms:${contact.phone}?body=${encodeURIComponent(emergencyMessage)}`}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                          style={{
                            background: "oklch(0.38 0.2 145 / 0.12)",
                            color: "oklch(0.32 0.16 145)",
                          }}
                          aria-label={`Send SMS to ${contact.name}`}
                        >
                          <Phone size={12} />
                          SMS
                        </a>

                        {/* WhatsApp button */}
                        <a
                          data-ocid={`sos.contact_wa_button.${idx + 1}`}
                          href={`https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(emergencyMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                          style={{
                            background: "oklch(0.52 0.18 145 / 0.12)",
                            color: "oklch(0.38 0.16 145)",
                          }}
                          aria-label={`Send WhatsApp to ${contact.name}`}
                        >
                          <MessageCircle size={12} />
                          WA
                        </a>
                      </div>
                    ))}
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
                  No emergency contacts saved. Add contacts to notify them.
                </p>
              </div>
            )}

            {/* Countdown + Stop Alarm */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs" style={{ color: "oklch(0.52 0.04 260)" }}>
                Auto-dismissing in{" "}
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
