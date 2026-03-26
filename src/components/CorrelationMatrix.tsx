"use client";

import type { CorrelationData } from "@/lib/types";

export function CorrelationMatrixView({ data }: { data: CorrelationData }) {
  const getColor = (v: number): string => {
    if (v >= 0.8) return "bg-green-600/80";
    if (v >= 0.5) return "bg-green-600/40";
    if (v >= 0.2) return "bg-green-600/20";
    if (v >= -0.2) return "bg-gray-700/30";
    if (v >= -0.5) return "bg-red-600/20";
    if (v >= -0.8) return "bg-red-600/40";
    return "bg-red-600/80";
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔗</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Sector Correlation Matrix</h2>
        <span className="text-xs text-gray-500">(3-month daily returns)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="p-1"></th>
              {data.symbols.map((s) => (
                <th key={s} className="p-1 text-center text-blue-300 font-mono" style={{ writingMode: "vertical-rl", height: 60 }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.symbols.map((row, i) => (
              <tr key={row}>
                <td className="p-1 font-mono text-blue-300 font-bold pr-2">{row}</td>
                {data.matrix[i].map((val, j) => (
                  <td key={j} className={`correlation-cell ${getColor(val)} ${i === j ? "font-bold" : ""}`}>
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span>Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600/80"></span> Strong negative</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700/30"></span> Low correlation</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600/80"></span> Strong positive</span>
      </div>
    </div>
  );
}
