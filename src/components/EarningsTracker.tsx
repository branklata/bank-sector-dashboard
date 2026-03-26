"use client";

import type { EarningsEvent } from "@/lib/types";

export function EarningsTrackerView({ events }: { events: EarningsEvent[] }) {
  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Bank Earnings Tracker</h2>
        <span className="text-xs text-gray-500">(Major bank bellwethers)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {events.map((e) => (
          <div key={e.symbol} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-blue-300">{e.symbol}</span>
              <span className="text-xs text-gray-500">{e.date}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{e.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
