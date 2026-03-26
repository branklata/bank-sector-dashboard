"use client";

import { useState, useEffect } from "react";

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  ma50: number | null;
  ma100: number | null;
  ma200: number | null;
  aboveMa50: boolean | null;
  aboveMa100: boolean | null;
  aboveMa200: boolean | null;
}

export function Watchlist({ starredItems }: { starredItems: string[] }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [customTickers, setCustomTickers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load custom tickers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("watchlist-tickers");
    if (saved) setCustomTickers(JSON.parse(saved));
  }, []);

  // Fetch data for all watchlist items
  useEffect(() => {
    const allSymbols = [...new Set([...starredItems, ...customTickers])];
    if (allSymbols.length === 0) {
      setItems([]);
      return;
    }

    setLoading(true);
    fetch(`/api/quote?symbol=${allSymbols.join(",")}`)
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [starredItems, customTickers]);

  const addTicker = () => {
    const ticker = input.trim().toUpperCase();
    if (!ticker || customTickers.includes(ticker)) return;
    const updated = [...customTickers, ticker];
    setCustomTickers(updated);
    localStorage.setItem("watchlist-tickers", JSON.stringify(updated));
    setInput("");
  };

  const removeTicker = (symbol: string) => {
    const updated = customTickers.filter((t) => t !== symbol);
    setCustomTickers(updated);
    localStorage.setItem("watchlist-tickers", JSON.stringify(updated));
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⭐</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">Watchlist</h2>
      </div>

      {/* Add ticker input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTicker()}
          placeholder="Add ticker (e.g., AAPL)"
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 flex-1 max-w-xs"
        />
        <button
          onClick={addTicker}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-700/50">
                <th className="text-left py-2 px-2">Symbol</th>
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-right py-2 px-2">Price</th>
                <th className="text-right py-2 px-2">Change</th>
                <th className="text-right py-2 px-2">50 MA</th>
                <th className="text-right py-2 px-2">100 MA</th>
                <th className="text-right py-2 px-2">200 MA</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const bullishCount = [item.aboveMa50, item.aboveMa100, item.aboveMa200].filter(Boolean).length;
                return (
                  <tr key={item.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-2 font-mono font-bold text-blue-300">{item.symbol}</td>
                    <td className="py-2 px-2 text-gray-300">{item.name}</td>
                    <td className="text-right py-2 px-2 font-mono text-white">
                      {item.price?.toFixed(2) || "--"}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${(item.changePct ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {item.changePct !== null ? `${item.changePct >= 0 ? "+" : ""}${item.changePct.toFixed(2)}%` : "--"}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono text-xs ${item.aboveMa50 ? "text-green-400" : "text-red-400"}`}>
                      {item.ma50?.toFixed(2) || "--"}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono text-xs ${item.aboveMa100 ? "text-green-400" : "text-red-400"}`}>
                      {item.ma100?.toFixed(2) || "--"}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono text-xs ${item.aboveMa200 ? "text-green-400" : "text-red-400"}`}>
                      {item.ma200?.toFixed(2) || "--"}
                    </td>
                    <td className="text-center py-2 px-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        bullishCount === 3 ? "bg-green-500/15 text-green-400" :
                        bullishCount === 0 ? "bg-red-500/15 text-red-400" :
                        "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {bullishCount === 3 ? "All Above" : bullishCount === 0 ? "All Below" : `${bullishCount}/3 Above`}
                      </span>
                    </td>
                    <td className="py-2">
                      {customTickers.includes(item.symbol) && (
                        <button
                          onClick={() => removeTicker(item.symbol)}
                          className="text-gray-600 hover:text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 && !loading && (
        <p className="text-sm text-gray-500">Star items from the dashboard or add tickers above to build your watchlist.</p>
      )}
    </div>
  );
}
