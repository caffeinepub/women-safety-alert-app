import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if previously dismissed
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install app banner"
      style={{
        background: "oklch(0.18 0.08 275)",
        borderBottom: "1px solid oklch(0.26 0.1 275)",
      }}
      className="flex items-center gap-3 px-4 py-2.5"
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: "oklch(0.52 0.24 22 / 0.2)" }}
      >
        <Download
          size={14}
          style={{ color: "oklch(0.75 0.2 22)" }}
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <p
        className="flex-1 text-xs leading-tight font-medium"
        style={{ color: "oklch(0.82 0.07 270)" }}
      >
        Install{" "}
        <span className="font-bold" style={{ color: "white" }}>
          SafeAlert
        </span>{" "}
        on your phone for quick SOS access
      </p>

      {/* Install button */}
      <button
        type="button"
        data-ocid="install.primary_button"
        onClick={handleInstall}
        className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-md transition-opacity hover:opacity-90 active:opacity-75"
        style={{
          background: "oklch(0.52 0.24 22)",
          color: "white",
        }}
        aria-label="Install SafeAlert as an app"
      >
        Install
      </button>

      {/* Dismiss */}
      <button
        type="button"
        data-ocid="install.close_button"
        onClick={handleDismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: "oklch(0.6 0.06 270)" }}
        aria-label="Dismiss install banner"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
