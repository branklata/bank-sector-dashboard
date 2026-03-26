"use client";

import type { FearGreedData } from "@/lib/types";

export function FearGreedGauge({ data }: { data: FearGreedData }) {
  const rotation = -90 + (data.score / 100) * 180;
  const color =
    data.score >= 75 ? "#22c55e" :
    data.score >= 55 ? "#86efac" :
    data.score >= 45 ? "#eab308" :
    data.score >= 25 ? "#f97316" : "#ef4444";

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">😱</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Fear & Greed Index</h2>
      </div>

      <div className="flex items-start gap-8">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
            {/* Colored segments */}
            <path d="M 20 100 A 80 80 0 0 1 56 36" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" />
            <path d="M 56 36 A 80 80 0 0 1 100 20" fill="none" stroke="#f97316" strokeWidth="16" />
            <path d="M 100 20 A 80 80 0 0 1 144 36" fill="none" stroke="#eab308" strokeWidth="16" />
            <path d="M 144 36 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
            {/* Needle */}
            <line
              x1="100" y1="100"
              x2={100 + 60 * Math.cos((rotation * Math.PI) / 180)}
              y2={100 + 60 * Math.sin((rotation * Math.PI) / 180)}
              stroke={color} strokeWidth="3" strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill={color} />
            {/* Labels */}
            <text x="15" y="115" fontSize="9" fill="#ef4444" fontWeight="bold">FEAR</text>
            <text x="160" y="115" fontSize="9" fill="#22c55e" fontWeight="bold">GREED</text>
          </svg>
          <div className="text-center -mt-2">
            <div className="text-3xl font-bold" style={{ color }}>{data.score}</div>
            <div className="text-sm font-semibold" style={{ color }}>{data.label}</div>
          </div>
        </div>

        {/* Components */}
        <div className="flex-1 space-y-2">
          <h3 className="text-xs text-gray-500 uppercase font-semibold mb-2">Components</h3>
          {data.components.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-32">{c.name}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${c.value}%`,
                    background: c.value >= 60 ? "#22c55e" : c.value >= 40 ? "#eab308" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-xs font-mono w-8 text-right text-gray-300">{c.value}</span>
              <span className={`text-xs w-16 ${
                c.signal === "Greed" ? "text-green-400" : c.signal === "Fear" ? "text-red-400" : "text-yellow-400"
              }`}>{c.signal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
