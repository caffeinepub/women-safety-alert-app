import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { playAlarm } from "@/utils/alarm";
import { getLocalProfile, saveLocalProfile } from "@/utils/localAuth";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Mic,
  Shield,
  User,
  Volume2,
} from "lucide-react";
import { useState } from "react";

interface SettingsScreenProps {
  shakeEnabled: boolean;
  voiceEnabled: boolean;
  onShakeToggle: (enabled: boolean) => void;
  onVoiceToggle: (enabled: boolean) => void;
}

const SAFETY_TIPS = [
  "Share your live location with trusted contacts when traveling alone at night.",
  "Trust your instincts — if something feels wrong, leave immediately and call for help.",
  "Keep emergency contacts updated and test your SOS alert periodically.",
];

export function SettingsScreen({
  shakeEnabled,
  voiceEnabled,
  onShakeToggle,
  onVoiceToggle,
}: SettingsScreenProps) {
  const profile = getLocalProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [saveFeedback, setSaveFeedback] = useState<"idle" | "saved">("idle");

  const handleSave = () => {
    if (!name.trim() || !profile) return;
    saveLocalProfile(name.trim(), profile.phone, "");
    setSaveFeedback("saved");
    setTimeout(() => setSaveFeedback("idle"), 2000);
  };

  const handleTestAlarm = () => {
    playAlarm(3000);
  };

  return (
    <div className="flex flex-col h-full px-4 py-4 space-y-5">
      {/* Header */}
      <div>
        <h2
          className="text-lg font-bold font-display"
          style={{ color: "oklch(0.18 0.03 260)" }}
        >
          Settings
        </h2>
        <p className="text-xs" style={{ color: "oklch(0.52 0.04 260)" }}>
          Customize your safety preferences
        </p>
      </div>

      {/* Profile Section */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background: "oklch(1 0 0)",
          border: "1px solid oklch(0.9 0.02 270)",
          boxShadow: "0 1px 6px oklch(0.12 0.02 260 / 0.06)",
        }}
      >
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.32 0.18 280 / 0.1)" }}
            >
              <User size={15} style={{ color: "oklch(0.32 0.18 280)" }} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.25 0.05 260)" }}
            >
              Your Profile
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="user-name"
              className="text-xs font-semibold"
              style={{ color: "oklch(0.45 0.04 260)" }}
            >
              Display Name
            </Label>
            {
              <Input
                id="user-name"
                data-ocid="settings.name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 rounded-xl text-sm"
                autoComplete="name"
              />
            }
          </div>
        </div>

        <Separator />

        <div className="px-4 py-3">
          <Button
            data-ocid="settings.save_button"
            onClick={handleSave}
            disabled={!name.trim()}
            size="sm"
            className="w-full h-10 rounded-xl font-semibold text-sm"
            style={{
              background:
                saveFeedback === "saved"
                  ? "oklch(0.42 0.18 145)"
                  : "oklch(0.32 0.18 280)",
              color: "white",
            }}
          >
            {saveFeedback === "saved" ? (
              <>
                <CheckCircle2 size={14} className="mr-2" />
                Saved!
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </section>

      {/* Safety Features */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background: "oklch(1 0 0)",
          border: "1px solid oklch(0.9 0.02 270)",
          boxShadow: "0 1px 6px oklch(0.12 0.02 260 / 0.06)",
        }}
      >
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.52 0.24 22 / 0.1)" }}
            >
              <Shield size={15} style={{ color: "oklch(0.48 0.2 22)" }} />
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.25 0.05 260)" }}
            >
              Auto-Alert Features
            </span>
          </div>
        </div>

        {/* Shake Detection */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: shakeEnabled
                    ? "oklch(0.32 0.18 280 / 0.12)"
                    : "oklch(0.95 0.01 260)",
                }}
              >
                <Activity
                  size={18}
                  style={{
                    color: shakeEnabled
                      ? "oklch(0.32 0.18 280)"
                      : "oklch(0.62 0.02 260)",
                  }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.2 0.04 260)" }}
                >
                  Shake to SOS
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.04 260)" }}
                >
                  Shake phone sharply to trigger alert
                </p>
              </div>
            </div>
            <Switch
              data-ocid="settings.shake_toggle"
              checked={shakeEnabled}
              onCheckedChange={onShakeToggle}
              aria-label="Toggle shake detection"
            />
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Voice Activation */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: voiceEnabled
                    ? "oklch(0.32 0.18 280 / 0.12)"
                    : "oklch(0.95 0.01 260)",
                }}
              >
                <Mic
                  size={18}
                  style={{
                    color: voiceEnabled
                      ? "oklch(0.32 0.18 280)"
                      : "oklch(0.62 0.02 260)",
                  }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.2 0.04 260)" }}
                >
                  Voice Activation
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.04 260)" }}
                >
                  Say "Help me" or "Emergency"
                </p>
              </div>
            </div>
            <Switch
              data-ocid="settings.voice_toggle"
              checked={voiceEnabled}
              onCheckedChange={onVoiceToggle}
              aria-label="Toggle voice activation"
            />
          </div>
        </div>
      </section>

      {/* Alarm Test */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background: "oklch(1 0 0)",
          border: "1px solid oklch(0.9 0.02 270)",
          boxShadow: "0 1px 6px oklch(0.12 0.02 260 / 0.06)",
        }}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.62 0.19 145 / 0.12)" }}
              >
                <Volume2 size={18} style={{ color: "oklch(0.38 0.17 145)" }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.2 0.04 260)" }}
                >
                  Test Alarm
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.04 260)" }}
                >
                  Plays a 3-second alarm sound
                </p>
              </div>
            </div>
            <Button
              data-ocid="settings.test_alarm_button"
              onClick={handleTestAlarm}
              size="sm"
              className="rounded-xl font-semibold gap-1.5"
              style={{
                background: "oklch(0.38 0.17 145)",
                color: "white",
              }}
            >
              <Volume2 size={13} />
              Test
            </Button>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.32 0.18 280 / 0.04)",
          border: "1px solid oklch(0.32 0.18 280 / 0.15)",
        }}
      >
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} style={{ color: "oklch(0.32 0.18 280)" }} />
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.32 0.18 280)" }}
            >
              Safety Tips
            </span>
          </div>
        </div>
        <ul className="px-4 pb-4 space-y-2">
          {SAFETY_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5">
              <ChevronRight
                size={14}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "oklch(0.52 0.12 280)" }}
              />
              <span
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.3 0.08 270)" }}
              >
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Footer branding */}
      <div className="pb-2 text-center">
        <p className="text-xs" style={{ color: "oklch(0.65 0.03 260)" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "oklch(0.32 0.18 280)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
