"use client";

export function SignalBadge({ signal }: { signal: string }) {
  const config = {
    bullish: { label: "BULLISH", icon: "▲", cls: "bg-green-500/15 text-green-400 border-green-500/30" },
    bearish: { label: "BEARISH", icon: "▼", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    neutral: { label: "NEUTRAL", icon: "◆", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    watch: { label: "WATCH", icon: "●", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  }[signal] || { label: signal.toUpperCase(), icon: "●", cls: "bg-gray-500/15 text-gray-400 border-gray-500/30" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.cls}`}>
      {config.icon} {config.label}
    </span>
  );
}

export function MASignal({ above, label }: { above: boolean | null; label: string }) {
  if (above === null) return <span className="text-gray-600 text-xs">{label}: --</span>;
  return (
    <span className={`text-xs font-mono ${above ? "text-green-400" : "text-red-400"}`}>
      {above ? "▲" : "▼"} {label}
    </span>
  );
}
