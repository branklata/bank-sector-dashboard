"use client";

import type { RSRanking } from "@/lib/types";

export function RSRankingsTable({ rankings }: { rankings: RSRanking[] }) {
  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Relative Strength Rankings</h2>
        <span className="text-xs text-gray-500">(Sector ETFs ranked by weighted momentum)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-700/50">
              <th className="text-center py-2 w-8">#</th>
              <th className="text-left py-2 px-2">Symbol</th>
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-right py-2 px-2">Price</th>
              <th className="text-right py-2 px-2">1M</th>
              <th className="text-right py-2 px-2">3M</th>
              <th className="text-right py-2 px-2">6M</th>
              <th className="text-right py-2 px-2">1Y</th>
              <th className="text-right py-2 px-2">RS Score</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((r, i) => (
              <tr key={r.symbol} className={`border-b border-gray-800/50 ${i < 3 ? "bg-green-500/5" : i >= rankings.length - 3 ? "bg-red-500/5" : ""}`}>
                <td className="text-center py-2 text-gray-500 font-mono">{i + 1}</td>
                <td className="py-2 px-2 font-mono font-bold text-blue-300">{r.symbol}</td>
                <td className="py-2 px-2 text-gray-300">{r.name}</td>
                <td className="text-right py-2 px-2 font-mono text-white">{r.price.toFixed(2)}</td>
                <td className={`text-right py-2 px-2 font-mono ${r.return1m >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {r.return1m >= 0 ? "+" : ""}{r.return1m.toFixed(1)}%
                </td>
                <td className={`text-right py-2 px-2 font-mono ${r.return3m >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {r.return3m >= 0 ? "+" : ""}{r.return3m.toFixed(1)}%
                </td>
                <td className={`text-right py-2 px-2 font-mono ${r.return6m >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {r.return6m >= 0 ? "+" : ""}{r.return6m.toFixed(1)}%
                </td>
                <td className={`text-right py-2 px-2 font-mono ${r.return1y >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {r.return1y >= 0 ? "+" : ""}{r.return1y.toFixed(1)}%
                </td>
                <td className="text-right py-2 px-2">
                  <span className={`font-mono font-bold ${r.compositeRS >= 5 ? "text-green-400" : r.compositeRS <= -5 ? "text-red-400" : "text-yellow-400"}`}>
                    {r.compositeRS >= 0 ? "+" : ""}{r.compositeRS.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-2">RS Score = 40% × 1M + 30% × 3M + 20% × 6M + 10% × 1Y returns</p>
    </div>
  );
}
