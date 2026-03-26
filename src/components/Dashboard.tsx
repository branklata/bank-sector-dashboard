"use client";

import { useState, useCallback } from "react";
import type { DashboardData } from "@/lib/types";
import { IndicatorTable } from "./IndicatorTable";
import { MarketTable } from "./MarketTable";
import { FearGreedGauge } from "./FearGreedGauge";
import { RSRankingsTable } from "./RSRankings";
import { CorrelationMatrixView } from "./CorrelationMatrix";
import { EarningsTrackerView } from "./EarningsTracker";
import { Watchlist } from "./Watchlist";

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "bank", label: "Bank Sector", icon: "🏦" },
  { id: "market", label: "Market & Sectors", icon: "📈" },
  { id: "watchlist", label: "Watchlist", icon: "⭐" },
];

export function Dashboard({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState("overview");
  const [starred, setStarred] = useState<Set<string>>(new Set());

  const toggleStar = useCallback((item: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);

  const updated = new Date(data.lastUpdated);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0e1a]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Bank Sector & Market Monitor</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="live-dot"></span>
                <span className="text-xs text-gray-400">
                  Updated {updated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                  {updated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <QuickStat label="S&P 500" ticker={data.market.indices.find((i) => i.symbol === "^GSPC")} />
              <QuickStat label="VIX" ticker={data.market.indices.find((i) => i.symbol === "^VIX")} />
              <QuickStat label="DXY" ticker={data.market.indices.find((i) => i.symbol === "DX-Y.NYB")} />
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Fear/Greed</span>
                <span className={`text-lg font-bold ${
                  data.fearGreed.score >= 60 ? "text-green-400" :
                  data.fearGreed.score <= 40 ? "text-red-400" : "text-yellow-400"
                }`}>{data.fearGreed.score}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3 -mb-px">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                  tab === t.id
                    ? "bg-[#111827] text-blue-400 border border-gray-700 border-b-[#111827]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {tab === "overview" && (
          <div>
            <FearGreedGauge data={data.fearGreed} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <MarketTable title="Major Indices" icon="📊" tickers={data.market.indices} onStar={toggleStar} starred={starred} />
              <MarketTable title="Commodities" icon="🛢️" tickers={data.market.commodities} onStar={toggleStar} starred={starred} />
            </div>

            <IndicatorTable title="Credit Spreads" icon="💳" indicators={data.bankSector.creditSpreads} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Interest Rates & Yield Curve" icon="📉" indicators={data.bankSector.rates} onStar={toggleStar} starred={starred} />

            <RSRankingsTable rankings={data.rsRankings} />
          </div>
        )}

        {tab === "bank" && (
          <div>
            <IndicatorTable title="Credit Spreads" icon="💳" indicators={data.bankSector.creditSpreads} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Interest Rates & Yield Curve" icon="📉" indicators={data.bankSector.rates} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Fed Watch Indicators" icon="🎯" indicators={data.bankSector.fedWatch} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Macroeconomic" icon="🌐" indicators={data.bankSector.macro} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Housing Market" icon="🏠" indicators={data.bankSector.housing} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Consumer Credit & Delinquencies" icon="💰" indicators={data.bankSector.consumerCredit} onStar={toggleStar} starred={starred} />
            <IndicatorTable title="Bank Sector Metrics" icon="🏦" indicators={data.bankSector.bankMetrics} onStar={toggleStar} starred={starred} />
            <EarningsTrackerView events={data.earnings} />
          </div>
        )}

        {tab === "market" && (
          <div>
            <MarketTable title="Major Indices" icon="📊" tickers={data.market.indices} onStar={toggleStar} starred={starred} />
            <MarketTable title="Sector ETFs" icon="🏗️" tickers={data.market.sectorETFs} onStar={toggleStar} starred={starred} />
            <MarketTable title="Currency Pairs" icon="💱" tickers={data.market.currencies} showMAs={false} onStar={toggleStar} starred={starred} />
            <MarketTable title="Commodities" icon="🛢️" tickers={data.market.commodities} onStar={toggleStar} starred={starred} />
            <MarketTable title="Factor ETFs" icon="🧮" tickers={data.market.factors} onStar={toggleStar} starred={starred} />
            <RSRankingsTable rankings={data.rsRankings} />
            <CorrelationMatrixView data={data.correlation} />
          </div>
        )}

        {tab === "watchlist" && (
          <Watchlist starredItems={Array.from(starred)} />
        )}
      </main>

      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        Data sources: FRED (Federal Reserve) &middot; Yahoo Finance &middot; Auto-refreshes every 5 minutes
      </footer>
    </div>
  );
}

function QuickStat({ label, ticker }: { label: string; ticker?: { price: number | null; changePct: number | null } }) {
  if (!ticker) return null;
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-mono font-bold text-white">{ticker.price?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "--"}</span>
      <span className={`text-xs font-mono ${(ticker.changePct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
        {ticker.changePct !== null ? `${ticker.changePct >= 0 ? "+" : ""}${ticker.changePct.toFixed(2)}%` : ""}
      </span>
    </div>
  );
}
