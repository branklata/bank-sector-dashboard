"use client";

import { useState } from "react";
import type { Indicator } from "@/lib/types";
import { SignalBadge } from "./SignalBadge";
import { SparklineChart } from "./SparklineChart";
import { HistoryModal } from "./HistoryModal";

interface Props {
  title: string;
  icon: string;
  indicators: Indicator[];
  onStar?: (name: string) => void;
  starred?: Set<string>;
}

export function IndicatorTable({ title, icon, indicators, onStar, starred }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [historyItem, setHistoryItem] = useState<Indicator | null>(null);

  return (
    <div className="card mb-4">
      <button
        className="flex items-center gap-2 w-full text-left mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">{title}</h2>
        <span className="ml-auto text-xs text-gray-500">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-700/50">
                <th className="text-left py-2 pr-4 w-6"></th>
                <th className="text-left py-2 pr-4">Indicator</th>
                <th className="text-right py-2 px-3">Current</th>
                <th className="text-right py-2 px-3">Prior</th>
                <th className="text-right py-2 px-3">Change</th>
                <th className="text-center py-2 px-3">Signal</th>
                <th className="text-center py-2 px-3">12M Trend</th>
                <th className="text-left py-2 px-3 text-xs">Thresholds</th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => {
                const isStarred = starred?.has(ind.name);
                return (
                  <tr key={ind.name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-2 pr-1">
                      {onStar && (
                        <button
                          onClick={() => onStar(ind.name)}
                          className={`text-sm ${isStarred ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
                        >
                          {isStarred ? "★" : "☆"}
                        </button>
                      )}
                    </td>
                    <td className="py-2 pr-4 font-medium text-gray-200 whitespace-nowrap">{ind.name}</td>
                    <td className="text-right py-2 px-3 font-mono font-semibold text-white">
                      {ind.value !== null ? formatValue(ind.value) : "--"}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-gray-400">
                      {ind.prior !== null ? formatValue(ind.prior) : "--"}
                    </td>
                    <td className="text-right py-2 px-3 font-mono">
                      {ind.change !== null ? (
                        <span className={ind.change > 0 ? "text-green-400" : ind.change < 0 ? "text-red-400" : "text-gray-400"}>
                          {ind.change > 0 ? "+" : ""}{formatValue(ind.change)}
                        </span>
                      ) : "--"}
                    </td>
                    <td className="text-center py-2 px-3">
                      <SignalBadge signal={ind.signal} />
                    </td>
                    <td className="py-2 px-3">
                      <button onClick={() => setHistoryItem(ind)} className="hover:opacity-80">
                        <SparklineChart data={ind.history || []} color="auto" />
                      </button>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-500">
                      <span className="text-green-600">{ind.bullishThreshold}</span>
                      {" / "}
                      <span className="text-red-600">{ind.bearishThreshold}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {historyItem && (
        <HistoryModal
          title={historyItem.name}
          data={historyItem.history || []}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}

function formatValue(v: number | string): string {
  if (typeof v === "string") return v;
  if (Math.abs(v) >= 1000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (Math.abs(v) >= 100) return v.toFixed(1);
  return v.toFixed(2);
}
