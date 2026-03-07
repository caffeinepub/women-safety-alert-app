import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveLocalProfile } from "@/utils/localAuth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface SetupScreenProps {
  onComplete: () => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const handleStep1 = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only numbers.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setError("");
    saveLocalProfile(name.trim(), phone.trim(), pin);
    onComplete();
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.12 0.06 275) 0%, oklch(0.08 0.04 280) 100%)",
      }}
    >
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, oklch(0.62 0.24 22), oklch(0.42 0.22 22))",
            boxShadow: "0 8px 32px oklch(0.52 0.24 22 / 0.45)",
          }}
        >
          <img
            src="/assets/generated/safealert-logo-transparent.dim_120x120.png"
            alt="SafeAlert"
            className="w-12 h-12 object-contain"
          />
        </div>
        <h1
          className="font-display font-black text-3xl tracking-wide"
          style={{ color: "white" }}
        >
          SafeAlert
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.65 0.08 270)" }}>
          Women Safety App
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: "oklch(1 0 0)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.35)",
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
            style={{
              background:
                step >= 1 ? "oklch(0.52 0.24 22)" : "oklch(0.88 0.02 270)",
              color: step >= 1 ? "white" : "oklch(0.55 0.04 260)",
            }}
          >
            1
          </div>
          <div
            className="flex-1 h-0.5 rounded-full"
            style={{
              background:
                step === 2 ? "oklch(0.52 0.24 22)" : "oklch(0.88 0.02 270)",
            }}
          />
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
            style={{
              background:
                step === 2 ? "oklch(0.52 0.24 22)" : "oklch(0.88 0.02 270)",
              color: step === 2 ? "white" : "oklch(0.55 0.04 260)",
            }}
          >
            2
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2
              className="font-display font-bold text-xl mb-1"
              style={{ color: "oklch(0.14 0.03 260)" }}
            >
              Create Your Profile
            </h2>
            <p
              className="text-sm mb-5"
              style={{ color: "oklch(0.52 0.04 260)" }}
            >
              Your details are stored only on this device.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="setup-name"
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.25 0.04 260)" }}
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                  />
                  <Input
                    id="setup-name"
                    data-ocid="setup.name_input"
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl pl-10 text-base"
                    autoComplete="name"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="setup-phone"
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.25 0.04 260)" }}
                >
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                  />
                  <Input
                    id="setup-phone"
                    data-ocid="setup.phone_input"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-xl pl-10 text-base"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  />
                </div>
              </div>

              {error && (
                <div
                  data-ocid="setup.error_state"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
                  style={{
                    background: "oklch(0.52 0.24 22 / 0.08)",
                    color: "oklch(0.42 0.2 22)",
                  }}
                >
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <Button
                data-ocid="setup.next_button"
                onClick={handleStep1}
                className="w-full h-12 rounded-xl font-bold text-base"
                style={{ background: "oklch(0.52 0.24 22)", color: "white" }}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2
              className="font-display font-bold text-xl mb-1"
              style={{ color: "oklch(0.14 0.03 260)" }}
            >
              Set Your PIN
            </h2>
            <p
              className="text-sm mb-5"
              style={{ color: "oklch(0.52 0.04 260)" }}
            >
              You'll use this PIN to unlock the app on return visits.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="setup-pin"
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.25 0.04 260)" }}
                >
                  PIN (4–6 digits)
                </Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                  />
                  <Input
                    id="setup-pin"
                    data-ocid="setup.pin_input"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="h-12 rounded-xl pl-10 pr-10 text-base tracking-[0.3em] font-bold"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="setup-confirm-pin"
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.25 0.04 260)" }}
                >
                  Confirm PIN
                </Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                  />
                  <Input
                    id="setup-confirm-pin"
                    data-ocid="setup.confirm_pin_input"
                    placeholder="Re-enter PIN"
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="h-12 rounded-xl pl-10 pr-10 text-base tracking-[0.3em] font-bold"
                    type={showConfirm ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.55 0.04 260)" }}
                    aria-label={showConfirm ? "Hide PIN" : "Show PIN"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  data-ocid="setup.error_state"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
                  style={{
                    background: "oklch(0.52 0.24 22 / 0.08)",
                    color: "oklch(0.42 0.2 22)",
                  }}
                >
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <Button
                data-ocid="setup.submit_button"
                onClick={handleSubmit}
                className="w-full h-12 rounded-xl font-bold text-base"
                style={{ background: "oklch(0.52 0.24 22)", color: "white" }}
              >
                <Shield size={16} className="mr-2" />
                Create Account
              </Button>

              <button
                type="button"
                data-ocid="setup.back_button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="w-full text-sm font-medium text-center py-1"
                style={{ color: "oklch(0.45 0.06 270)" }}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>

      <p
        className="text-xs mt-6 text-center"
        style={{ color: "oklch(0.45 0.06 270)" }}
      >
        All data stays on your device. Nothing is sent to any server.
      </p>
    </div>
  );
}
