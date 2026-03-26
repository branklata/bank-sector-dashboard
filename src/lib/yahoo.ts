// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface QuoteData {
  symbol: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  name: string;
}

export interface HistoricalData {
  date: string;
  close: number;
}

export async function fetchQuote(symbol: string): Promise<QuoteData> {
  try {
    const q: Record<string, unknown> = await yahooFinance.quote(symbol) as Record<string, unknown>;
    return {
      symbol,
      price: (q.regularMarketPrice as number) ?? null,
      change: (q.regularMarketChange as number) ?? null,
      changePct: (q.regularMarketChangePercent as number) ?? null,
      name: (q.shortName as string) || (q.longName as string) || symbol,
    };
  } catch {
    return { symbol, price: null, change: null, changePct: null, name: symbol };
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Map<string, QuoteData>> {
  const map = new Map<string, QuoteData>();
  const batchSize = 10;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map((s) => fetchQuote(s)));
    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        map.set(batch[idx], r.value);
      } else {
        map.set(batch[idx], {
          symbol: batch[idx],
          price: null,
          change: null,
          changePct: null,
          name: batch[idx],
        });
      }
    });
  }
  return map;
}

export async function fetchHistory(
  symbol: string,
  months = 12
): Promise<HistoricalData[]> {
  try {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);

    const result: Record<string, unknown> = await yahooFinance.chart(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    }) as Record<string, unknown>;

    const quotes = (result.quotes || []) as Array<Record<string, unknown>>;
    return quotes
      .filter((q) => q.close != null)
      .map((q) => ({
        date: new Date(q.date as string).toISOString().split("T")[0],
        close: q.close as number,
      }));
  } catch {
    return [];
  }
}

export function calculateMAs(history: HistoricalData[]): {
  ma50: number | null;
  ma100: number | null;
  ma200: number | null;
} {
  const closes = history.map((h) => h.close);
  return {
    ma50: closes.length >= 50 ? avg(closes.slice(-50)) : null,
    ma100: closes.length >= 100 ? avg(closes.slice(-100)) : null,
    ma200: closes.length >= 200 ? avg(closes.slice(-200)) : null,
  };
}

function avg(arr: number[]): number {
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

export function calculateReturns(history: HistoricalData[]): {
  return1m: number;
  return3m: number;
  return6m: number;
  return1y: number;
} {
  if (history.length < 2) return { return1m: 0, return3m: 0, return6m: 0, return1y: 0 };
  const current = history[history.length - 1].close;
  const getReturn = (daysAgo: number) => {
    const idx = Math.max(0, history.length - 1 - daysAgo);
    const prior = history[idx].close;
    return prior > 0 ? Math.round(((current - prior) / prior) * 1000) / 10 : 0;
  };
  return {
    return1m: getReturn(21),
    return3m: getReturn(63),
    return6m: getReturn(126),
    return1y: getReturn(252),
  };
}

export function calculateCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 10) return 0;
  const aa = a.slice(-n);
  const bb = b.slice(-n);
  const meanA = aa.reduce((s, v) => s + v, 0) / n;
  const meanB = bb.reduce((s, v) => s + v, 0) / n;
  let cov = 0,
    varA = 0,
    varB = 0;
  for (let i = 0; i < n; i++) {
    const da = aa[i] - meanA;
    const db = bb[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : Math.round((cov / denom) * 100) / 100;
}
