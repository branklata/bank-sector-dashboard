export interface Indicator {
  name: string;
  category: string;
  value: number | string | null;
  prior: number | string | null;
  change: number | null;
  signal: "bullish" | "bearish" | "neutral" | "watch";
  bullishThreshold: string;
  bearishThreshold: string;
  source: string;
  history?: { date: string; value: number }[];
}

export interface MarketTicker {
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
  maSignal: "bullish" | "bearish" | "neutral";
  history?: { date: string; value: number }[];
}

export interface RSRanking {
  symbol: string;
  name: string;
  price: number;
  return1m: number;
  return3m: number;
  return6m: number;
  return1y: number;
  compositeRS: number;
}

export interface CorrelationData {
  symbols: string[];
  matrix: number[][];
}

export interface EarningsEvent {
  symbol: string;
  name: string;
  date: string;
  estimate: number | null;
  actual: number | null;
}

export interface FearGreedData {
  score: number;
  label: string;
  components: {
    name: string;
    value: number;
    signal: string;
  }[];
}

export interface DashboardData {
  lastUpdated: string;
  bankSector: {
    creditSpreads: Indicator[];
    rates: Indicator[];
    macro: Indicator[];
    housing: Indicator[];
    fedWatch: Indicator[];
    consumerCredit: Indicator[];
    bankMetrics: Indicator[];
  };
  market: {
    indices: MarketTicker[];
    sectorETFs: MarketTicker[];
    currencies: MarketTicker[];
    commodities: MarketTicker[];
    factors: MarketTicker[];
  };
  rsRankings: RSRanking[];
  fearGreed: FearGreedData;
  correlation: CorrelationData;
  earnings: EarningsEvent[];
}
