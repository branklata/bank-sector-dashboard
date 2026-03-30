"use client";

import { useState } from "react";
import type { MarketTicker } from "@/lib/types";
import { SignalBadge } from "./SignalBadge";
import { SparklineChart } from "./SparklineChart";
import { HistoryModal } from "./HistoryModal";

interface Props {
  title: string;
  icon: string;
  tickers: MarketTicker[];
  showMAs?: boolean;
  onStar?: (symbol: string) => void;
  starred?: Set<string>;
}

function ChangePctCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span className="text-gray-600">--</span>;
  const color = value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-gray-400";
  return <span className={color}>{value > 0 ? "+" : ""}{value.toFixed(1)}%</span>;
}

export function MarketTable({ title, icon, tickers, showMAs = true, onStar, starred }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [historyItem, setHistoryItem] = useState<MarketTicker | null>(null);

  return (
    <div className="card mb-4">
      <button
        className="flex items-center gap-2 w-full text-left mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">{title}</h2>
        <span className="text-xs text-gray-500 ml-2">({tickers.length})</span>
        <span className="ml-auto text-xs text-gray-500">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-700/50">
                <th className="text-left py-2 w-6"></th>
                <th className="text-left py-2 pr-3">Symbol</th>
                <th className="text-left py-2 pr-3">Name</th>
                <th className="text-right py-2 px-2">Price</th>
                <th className="text-right py-2 px-2">1D %</th>
                <th className="text-right py-2 px-2">1W %</th>
                <th className="text-right py-2 px-2">1M %</th>
                {showMAs && (
                  <>
                    <th className="text-right py-2 px-2">50 MA</th>
                    <th className="text-right py-2 px-2">100 MA</th>
                    <th className="text-right py-2 px-2">200 MA</th>
                    <th className="text-center py-2 px-2">MA Signal</th>
                  </>
                )}
                <th className="text-center py-2 px-2">12M</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((t) => {
                const isStarred = starred?.has(t.symbol);
                return (
                  <tr key={t.symbol + t.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2">
                      {onStar && (
                        <button
                          onClick={() => onStar(t.symbol)}
                          className={`text-sm ${isStarred ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
                        >
                          {isStarred ? "★" : "☆"}
                        </button>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono font-bold text-blue-300">{t.symbol.replace("=X", "").replace("=F", "")}</td>
                    <td className="py-2 pr-3 text-gray-300">{t.name}</td>
                    <td className="text-right py-2 px-2 font-mono font-semibold text-white">
                      {t.price ? t.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--"}
                    </td>
                    <td className="text-right py-2 px-2 font-mono text-xs">
                      <ChangePctCell value={t.change1dPct} />
                    </td>
                    <td className="text-right py-2 px-2 font-mono text-xs">
                      <ChangePctCell value={t.change1wPct} />
                    </td>
                    <td className="text-right py-2 px-2 font-mono text-xs">
                      <ChangePctCell value={t.change1mPct} />
                    </td>
                    {showMAs && (
                      <>
                        <td className="text-right py-2 px-2 font-mono text-xs">
                          {t.ma50 ? (
                            <span className={t.aboveMa50 ? "text-green-400" : "text-red-400"}>
                              {t.ma50.toFixed(2)}
                            </span>
                          ) : "--"}
                        </td>
                        <td className="text-right py-2 px-2 font-mono text-xs">
                          {t.ma100 ? (
                            <span className={t.aboveMa100 ? "text-green-400" : "text-red-400"}>
                              {t.ma100.toFixed(2)}
                            </span>
                          ) : "--"}
                        </td>
                        <td className="text-right py-2 px-2 font-mono text-xs">
                          {t.ma200 ? (
                            <span className={t.aboveMa200 ? "text-green-400" : "text-red-400"}>
                              {t.ma200.toFixed(2)}
                            </span>
                          ) : "--"}
                        </td>
                        <td className="text-center py-2 px-2">
                          <SignalBadge signal={t.maSignal} />
                        </td>
                      </>
                    )}
                    <td className="py-2 px-2">
                      <button onClick={() => setHistoryItem(t)} className="hover:opacity-80">
                        <SparklineChart data={t.history || []} color="auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {historyItem && historyItem.history && (
        <HistoryModal
          title={`${historyItem.symbol} — ${historyItem.name}`}
          data={historyItem.history}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
