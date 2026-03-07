import { ContactsScreen } from "@/components/ContactsScreen";
import { HistoryScreen } from "@/components/HistoryScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { SettingsScreen } from "@/components/SettingsScreen";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useShakeDetection } from "@/hooks/useShakeDetection";
import { useVoiceActivation } from "@/hooks/useVoiceActivation";
import {
  Clock,
  Home,
  Loader2,
  LogIn,
  LogOut,
  Mic,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

type Tab = "home" | "contacts" | "history" | "settings";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home size={20} /> },
  { id: "contacts", label: "Contacts", icon: <Users size={20} /> },
  { id: "history", label: "History", icon: <Clock size={20} /> },
  { id: "settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sosTriggerCount, setSOSTriggerCount] = useState(0);

  const { login, clear, isLoggingIn, isInitializing, identity } =
    useInternetIdentity();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  // SOS trigger — shared so shake/voice can trigger it too
  const handleSOSTrigger = useCallback(() => {
    setActiveTab("home");
    setSOSTriggerCount((c) => c + 1);
  }, []);

  useShakeDetection(handleSOSTrigger, shakeEnabled);
  const { isListening } = useVoiceActivation(handleSOSTrigger, voiceEnabled);

  return (
    <div className="app-shell">
      {/* App Header */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "oklch(0.14 0.07 275)",
          borderBottom: "1px solid oklch(0.22 0.1 275)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/generated/safealert-logo-transparent.dim_120x120.png"
            alt="SafeAlert logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <span
              className="font-display font-black text-lg leading-none tracking-wide"
              style={{ color: "white" }}
            >
              SafeAlert
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield size={9} style={{ color: "oklch(0.52 0.24 22)" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.7 0.1 270)" }}
              >
                Women Safety App
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice listening indicator */}
          {voiceEnabled && isListening && (
            <div
              className="listening-pulse flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: "oklch(0.52 0.24 22 / 0.2)",
                border: "1px solid oklch(0.52 0.24 22 / 0.4)",
              }}
            >
              <Mic size={11} style={{ color: "oklch(0.75 0.18 22)" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.85 0.12 22)" }}
              >
                Listening
              </span>
            </div>
          )}

          {/* Auth Button */}
          {isInitializing ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-white/60" />
            </div>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: "oklch(1 0 0 / 0.08)",
                color: "oklch(0.85 0.08 270)",
                border: "1px solid oklch(1 0 0 / 0.15)",
              }}
              title="Logout"
              aria-label="Log out"
            >
              <LogOut size={13} />
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                background: "oklch(0.52 0.24 22)",
                color: "white",
              }}
              aria-label="Log in with Internet Identity"
            >
              {isLoggingIn ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <LogIn size={13} />
              )}
              {isLoggingIn ? "Logging in…" : "Login"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="content-area flex-1">
        {activeTab === "home" && (
          <HomeScreen
            key={sosTriggerCount}
            shakeEnabled={shakeEnabled}
            voiceEnabled={voiceEnabled}
            isListening={isListening}
          />
        )}
        {activeTab === "contacts" && <ContactsScreen />}
        {activeTab === "history" && <HistoryScreen />}
        {activeTab === "settings" && (
          <SettingsScreen
            shakeEnabled={shakeEnabled}
            voiceEnabled={voiceEnabled}
            onShakeToggle={setShakeEnabled}
            onVoiceToggle={setVoiceEnabled}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="bottom-nav flex-shrink-0 grid grid-cols-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}_tab`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-3 transition-all relative"
              aria-label={`Go to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute top-0 inset-x-0 h-0.5 rounded-b-full"
                  style={{ background: "oklch(0.52 0.24 22)" }}
                />
              )}

              <span
                className="transition-all"
                style={{
                  color: isActive
                    ? "oklch(0.52 0.24 22)"
                    : "oklch(0.65 0.06 270)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              >
                {item.icon}
              </span>
              <span
                className="text-xs font-semibold transition-colors"
                style={{
                  color: isActive
                    ? "oklch(0.52 0.24 22)"
                    : "oklch(0.58 0.06 270)",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}
