import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearLocalProfile,
  getLocalProfile,
  verifyPin,
} from "@/utils/localAuth";
import { clearLocalContacts } from "@/utils/localContacts";
import { Eye, EyeOff, Lock, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";

interface UnlockScreenProps {
  onUnlock: () => void;
  onReset: () => void;
}

export function UnlockScreen({ onUnlock, onReset }: UnlockScreenProps) {
  const profile = getLocalProfile();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleUnlock = () => {
    if (!pin) {
      setError("Please enter your PIN.");
      return;
    }
    if (verifyPin(pin)) {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleReset = () => {
    clearLocalProfile();
    clearLocalContacts();
    onReset();
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.12 0.06 275) 0%, oklch(0.08 0.04 280) 100%)",
      }}
    >
      {/* Logo */}
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
        className={`w-full max-w-sm rounded-3xl p-6 transition-transform ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
        style={{
          background: "oklch(1 0 0)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.35)",
        }}
      >
        {/* Welcome back */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3 font-display font-black text-2xl"
            style={{
              background: "oklch(0.32 0.18 280 / 0.12)",
              color: "oklch(0.32 0.18 280)",
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <h2
            className="font-display font-bold text-xl"
            style={{ color: "oklch(0.14 0.03 260)" }}
          >
            Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
            !
          </h2>
          <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.04 260)" }}>
            Enter your PIN to unlock the app
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "oklch(0.55 0.04 260)" }}
            />
            <Input
              data-ocid="unlock.pin_input"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              className="h-14 rounded-xl pl-10 pr-10 text-xl tracking-[0.4em] font-bold text-center"
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
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

          {error && (
            <p
              data-ocid="unlock.error_state"
              className="text-sm text-center font-medium"
              style={{ color: "oklch(0.52 0.24 22)" }}
            >
              {error}
            </p>
          )}

          <Button
            data-ocid="unlock.submit_button"
            onClick={handleUnlock}
            className="w-full h-12 rounded-xl font-bold text-base"
            style={{ background: "oklch(0.52 0.24 22)", color: "white" }}
          >
            <Shield size={16} className="mr-2" />
            Unlock
          </Button>
        </div>
      </div>

      {/* Reset option */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            data-ocid="unlock.reset_button"
            className="mt-6 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "oklch(0.50 0.08 270)" }}
          >
            <RefreshCw size={12} />
            Forgot PIN? Reset app
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent data-ocid="unlock.reset_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the app?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your profile and all saved contacts from this
              device. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="unlock.reset_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="unlock.reset_confirm_button"
              onClick={handleReset}
              style={{ background: "oklch(0.52 0.24 22)", color: "white" }}
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
