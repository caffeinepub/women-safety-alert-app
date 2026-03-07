import { Skeleton } from "@/components/ui/skeleton";
import { useAlertLogs } from "@/hooks/useQueries";
import { Clock, ExternalLink, MapPin, ShieldAlert } from "lucide-react";

function formatTimestamp(ts: bigint): string {
  // Timestamp is in nanoseconds; convert to milliseconds
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const now = Date.now();
  const diffMs = now - ms;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

export function HistoryScreen() {
  const { data: logs = [], isLoading } = useAlertLogs();

  // Sort newest first
  const sorted = [...logs].sort((a, b) => {
    const diff = b.timestamp - a.timestamp;
    return diff > 0n ? 1 : diff < 0n ? -1 : 0;
  });

  return (
    <div className="flex flex-col h-full px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2
          className="text-lg font-bold font-display"
          style={{ color: "oklch(0.18 0.03 260)" }}
        >
          Alert History
        </h2>
        <p className="text-xs" style={{ color: "oklch(0.52 0.04 260)" }}>
          {logs.length} alert{logs.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex-1 flex flex-col items-center justify-center text-center py-16"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.52 0.24 22 / 0.08)" }}
          >
            <ShieldAlert size={28} style={{ color: "oklch(0.52 0.24 22)" }} />
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "oklch(0.25 0.05 260)" }}
          >
            No alerts yet
          </h3>
          <p
            className="text-sm max-w-xs"
            style={{ color: "oklch(0.52 0.04 260)" }}
          >
            Your SOS alert history will appear here. Stay safe!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((log, i) => {
            const ocidIndex = i + 1;
            const mapsLink = `https://maps.google.com/?q=${log.latitude},${log.longitude}`;
            const hasLocation = log.latitude !== 0 || log.longitude !== 0;

            return (
              <div
                key={`${log.timestamp.toString()}-${i}`}
                data-ocid={`history.item.${ocidIndex}`}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "oklch(1 0 0)",
                  border: "1px solid oklch(0.9 0.02 270)",
                  boxShadow: "0 1px 6px oklch(0.12 0.02 260 / 0.06)",
                }}
              >
                {/* Alert indicator bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.52 0.24 22), oklch(0.62 0.2 22))",
                  }}
                />

                <div className="px-4 py-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(0.52 0.24 22 / 0.1)",
                        }}
                      >
                        <ShieldAlert
                          size={16}
                          style={{ color: "oklch(0.48 0.2 22)" }}
                        />
                      </div>
                      <div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: "oklch(0.42 0.2 22)" }}
                        >
                          Emergency Alert
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock
                            size={10}
                            style={{ color: "oklch(0.62 0.04 260)" }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: "oklch(0.52 0.04 260)" }}
                          >
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: "oklch(0.52 0.24 22 / 0.08)",
                        color: "oklch(0.42 0.2 22)",
                      }}
                    >
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>

                  {/* Location row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        size={12}
                        style={{ color: "oklch(0.52 0.04 260)" }}
                      />
                      <span
                        className="text-xs font-mono"
                        style={{ color: "oklch(0.52 0.04 260)" }}
                      >
                        {hasLocation
                          ? `${log.latitude.toFixed(5)}, ${log.longitude.toFixed(5)}`
                          : "Location unavailable"}
                      </span>
                    </div>
                    {hasLocation && (
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                        style={{
                          background: "oklch(0.32 0.18 280 / 0.1)",
                          color: "oklch(0.32 0.18 280)",
                        }}
                      >
                        <ExternalLink size={11} />
                        View Map
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
