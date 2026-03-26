"use client";

import type { CorrelationData } from "@/lib/types";

export function CorrelationMatrixView({ data }: { data: CorrelationData }) {
  const getColor = (v: number): string => {
    if (v >= 0.8) return "#166534cc";
    if (v >= 0.5) return "#16653466";
    if (v >= 0.2) return "#16653433";
    if (v >= -0.2) return "#37415180";
    if (v >= -0.5) return "#991b1b33";
    if (v >= -0.8) return "#991b1b66";
    return "#991b1bcc";
  };

  const getTextColor = (v: number): string => {
    if (Math.abs(v) >= 0.8) return "#fff";
    if (Math.abs(v) >= 0.5) return "#e2e8f0";
    return "#94a3b8";
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔗</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Sector Correlation Matrix</h2>
        <span className="text-xs text-gray-500">(3-month daily returns)</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div style={{ display: "inline-grid", gridTemplateColumns: `60px repeat(${data.symbols.length}, 52px)`, gap: 2 }}>
          {/* Header row */}
          <div />
          {data.symbols.map((s) => (
            <div key={`h-${s}`} style={{ fontSize: 10, fontFamily: "monospace", color: "#93c5fd", textAlign: "center", padding: "4px 0", fontWeight: 700 }}>
              {s}
            </div>
          ))}

          {/* Data rows */}
          {data.symbols.map((row, i) => (
            <>
              <div key={`label-${row}`} style={{ fontSize: 10, fontFamily: "monospace", color: "#93c5fd", fontWeight: 700, display: "flex", alignItems: "center", paddingRight: 4 }}>
                {row}
              </div>
              {data.matrix[i].map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  style={{
                    width: 50,
                    height: 32,
                    backgroundColor: getColor(val),
                    color: getTextColor(val),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: i === j ? 800 : 600,
                    fontFamily: "monospace",
                    borderRadius: 4,
                    border: i === j ? "1px solid #3b82f6" : "none",
                  }}
                  title={`${row} vs ${data.symbols[j]}: ${val.toFixed(2)}`}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#991b1bcc" }} /> Strong negative</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#37415180" }} /> Low correlation</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#166534cc" }} /> Strong positive</span>
      </div>
    </div>
  );
}
