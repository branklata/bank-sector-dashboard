import { fetchFredSeries, fetchFredHistory, calculateYoY } from "./fred";
import {
  fetchQuotes,
  fetchHistory,
  calculateMAs,
  calculateReturns,
  calculateCorrelation,
  type QuoteData,
  type HistoricalData,
} from "./yahoo";
import type {
  DashboardData,
  Indicator,
  MarketTicker,
  RSRanking,
  FearGreedData,
  CorrelationData,
  EarningsEvent,
} from "./types";

// ── FRED Series Config ──

interface FredConfig {
  id: string;
  name: string;
  multiply: number;
  lookback: number;
  bullishTest: (v: number) => boolean;
  bearishTest: (v: number) => boolean;
  bullishLabel: string;
  bearishLabel: string;
  source: string;
}

const CREDIT_SPREADS: FredConfig[] = [
  { id: "BAMLH0A0HYM2", name: "HY OAS (bps)", multiply: 100, lookback: 30, bullishTest: (v) => v < 350, bearishTest: (v) => v > 500, bullishLabel: "< 350 bps", bearishLabel: "> 500 bps", source: "FRED: BAMLH0A0HYM2" },
  { id: "BAMLC0A0CM", name: "IG OAS (bps)", multiply: 100, lookback: 30, bullishTest: (v) => v < 100, bearishTest: (v) => v > 175, bullishLabel: "< 100 bps", bearishLabel: "> 175 bps", source: "FRED: BAMLC0A0CM" },
  { id: "BAMLH0A0HYM2EY", name: "HY Effective Yield (%)", multiply: 1, lookback: 30, bullishTest: (v) => v < 7, bearishTest: (v) => v > 10, bullishLabel: "< 7%", bearishLabel: "> 10%", source: "FRED: BAMLH0A0HYM2EY" },
];

const RATES: FredConfig[] = [
  { id: "DFEDTARU", name: "Fed Funds Rate (%)", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Cutting cycle", bearishLabel: "Hiking into recession", source: "FRED: DFEDTARU" },
  { id: "DGS2", name: "2-Year Treasury (%)", multiply: 1, lookback: 14, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Falling (pricing cuts)", bearishLabel: "Rising rapidly", source: "FRED: DGS2" },
  { id: "DGS10", name: "10-Year Treasury (%)", multiply: 1, lookback: 14, bullishTest: (v) => v >= 3.5 && v <= 4.5, bearishTest: (v) => v > 5, bullishLabel: "Stable 3.5-4.5%", bearishLabel: "> 5%", source: "FRED: DGS10" },
  { id: "T10Y2Y", name: "10Y-2Y Spread (bps)", multiply: 100, lookback: 14, bullishTest: (v) => v > 50, bearishTest: (v) => v < -25, bullishLabel: "> 50 bps", bearishLabel: "< -25 bps (inverted)", source: "FRED: T10Y2Y" },
  { id: "T10Y3M", name: "10Y-3M Spread (bps)", multiply: 100, lookback: 14, bullishTest: (v) => v > 50, bearishTest: (v) => v < -25, bullishLabel: "> 50 bps", bearishLabel: "< -25 bps (inverted)", source: "FRED: T10Y3M" },
  { id: "MORTGAGE30US", name: "30Y Mortgage Rate (%)", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: (v) => v > 7.5, bullishLabel: "Falling", bearishLabel: "> 7.5%", source: "FRED: MORTGAGE30US" },
];

const MACRO: FredConfig[] = [
  { id: "UNRATE", name: "Unemployment Rate (%)", multiply: 1, lookback: 90, bullishTest: (v) => v < 4.5, bearishTest: (v) => v > 5.0, bullishLabel: "< 4.5%", bearishLabel: "> 5.0%", source: "FRED: UNRATE" },
  { id: "ICSA", name: "Initial Jobless Claims", multiply: 1, lookback: 14, bullishTest: (v) => v < 225000, bearishTest: (v) => v > 300000, bullishLabel: "< 225K", bearishLabel: "> 300K", source: "FRED: ICSA" },
  { id: "PAYEMS", name: "Total Nonfarm Payrolls (M)", multiply: 0.001, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing", bearishLabel: "Declining", source: "FRED: PAYEMS" },
  { id: "RSAFS", name: "Retail Sales ($B)", multiply: 0.001, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing", bearishLabel: "Declining MoM", source: "FRED: RSAFS" },
  { id: "INDPRO", name: "Industrial Production Index", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Expanding", bearishLabel: "Contracting", source: "FRED: INDPRO" },
  { id: "UMCSENT", name: "Consumer Sentiment (UMich)", multiply: 1, lookback: 90, bullishTest: (v) => v > 80, bearishTest: (v) => v < 60, bullishLabel: "> 80", bearishLabel: "< 60", source: "FRED: UMCSENT" },
];

const HOUSING: FredConfig[] = [
  { id: "HOUST", name: "Housing Starts (000s)", multiply: 1, lookback: 90, bullishTest: (v) => v > 1400, bearishTest: (v) => v < 1000, bullishLabel: "> 1,400K", bearishLabel: "< 1,000K", source: "FRED: HOUST" },
  { id: "PERMIT", name: "Building Permits (000s)", multiply: 1, lookback: 90, bullishTest: (v) => v > 1400, bearishTest: (v) => v < 1000, bullishLabel: "> 1,400K", bearishLabel: "< 1,000K", source: "FRED: PERMIT" },
  { id: "CSUSHPINSA", name: "Case-Shiller Home Price Index", multiply: 1, lookback: 120, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Rising", bearishLabel: "Declining", source: "FRED: CSUSHPINSA" },
  { id: "EXHOSLUSM495S", name: "Existing Home Sales (M)", multiply: 1, lookback: 90, bullishTest: (v) => v > 5, bearishTest: (v) => v < 4, bullishLabel: "> 5M", bearishLabel: "< 4M", source: "FRED: EXHOSLUSM495S" },
  { id: "HSN1F", name: "New Home Sales (000s)", multiply: 1, lookback: 90, bullishTest: (v) => v > 700, bearishTest: (v) => v < 500, bullishLabel: "> 700K", bearishLabel: "< 500K", source: "FRED: HSN1F" },
  { id: "MSPUS", name: "Median Home Price ($K)", multiply: 0.001, lookback: 120, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Stable", bearishLabel: "Declining rapidly", source: "FRED: MSPUS" },
];

const FED_WATCH: FredConfig[] = [
  // Core PCE is calculated via YoY below, not here
  { id: "JTSJOL", name: "JOLTS Job Openings (M)", multiply: 0.001, lookback: 120, bullishTest: (v) => v > 8, bearishTest: (v) => v < 6, bullishLabel: "> 8M", bearishLabel: "< 6M", source: "FRED: JTSJOL" },
  { id: "CES0500000003", name: "Avg Hourly Earnings ($)", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Moderate growth", bearishLabel: "Accelerating", source: "FRED: CES0500000003" },
  { id: "T5YIE", name: "5Y Breakeven Inflation (%)", multiply: 1, lookback: 30, bullishTest: (v) => v >= 2 && v <= 2.5, bearishTest: (v) => v > 3, bullishLabel: "2.0-2.5% (anchored)", bearishLabel: "> 3% (unanchored)", source: "FRED: T5YIE" },
  { id: "T10YIE", name: "10Y Breakeven Inflation (%)", multiply: 1, lookback: 30, bullishTest: (v) => v >= 2 && v <= 2.5, bearishTest: (v) => v > 3, bullishLabel: "2.0-2.5%", bearishLabel: "> 3%", source: "FRED: T10YIE" },
  { id: "NFCI", name: "Chicago Fed NFCI", multiply: 1, lookback: 30, bullishTest: (v) => v < -0.5, bearishTest: (v) => v > 0, bullishLabel: "< -0.5 (loose)", bearishLabel: "> 0 (tight)", source: "FRED: NFCI" },
  { id: "PSAVERT", name: "Personal Savings Rate (%)", multiply: 1, lookback: 90, bullishTest: (v) => v > 5, bearishTest: (v) => v < 3, bullishLabel: "> 5%", bearishLabel: "< 3%", source: "FRED: PSAVERT" },
];

const CONSUMER_CREDIT: FredConfig[] = [
  { id: "TOTALSL", name: "Total Consumer Credit ($B)", multiply: 1, lookback: 120, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing moderately", bearishLabel: "Contracting", source: "FRED: TOTALSL" },
  { id: "REVOLSL", name: "Revolving Credit ($B)", multiply: 1, lookback: 120, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Stable", bearishLabel: "Accelerating", source: "FRED: REVOLSL" },
  { id: "DRCCLACBS", name: "Credit Card Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 2.5, bearishTest: (v) => v > 4, bullishLabel: "< 2.5%", bearishLabel: "> 4%", source: "FRED: DRCCLACBS" },
  { id: "DRCLACBS", name: "Consumer Loan Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 2, bearishTest: (v) => v > 3, bullishLabel: "< 2%", bearishLabel: "> 3%", source: "FRED: DRCLACBS" },
  { id: "DRALACBS", name: "All Loans Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 2, bearishTest: (v) => v > 3, bullishLabel: "< 2%", bearishLabel: "> 3%", source: "FRED: DRALACBS" },
  { id: "DRSFRMACBS", name: "Mortgage Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 2.5, bearishTest: (v) => v > 5, bullishLabel: "< 2.5%", bearishLabel: "> 5%", source: "FRED: DRSFRMACBS" },
  { id: "DRCRELEXFACBS", name: "CRE Loan Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 1.5, bearishTest: (v) => v > 3, bullishLabel: "< 1.5%", bearishLabel: "> 3%", source: "FRED: DRCRELEXFACBS" },
  { id: "DRBLACBS", name: "Business Loan Delinquency (%)", multiply: 1, lookback: 180, bullishTest: (v) => v < 1, bearishTest: (v) => v > 2, bullishLabel: "< 1%", bearishLabel: "> 2%", source: "FRED: DRBLACBS" },
  { id: "BUSLOANS", name: "C&I Loans Outstanding ($B)", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing", bearishLabel: "Contracting", source: "FRED: BUSLOANS" },
  { id: "RELACBW027SBOG", name: "Real Estate Loans ($B)", multiply: 1, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing", bearishLabel: "Contracting", source: "FRED: RELACBW027SBOG" },
  { id: "DRTSCILM", name: "Banks Tightening C&I (% net)", multiply: 1, lookback: 180, bullishTest: (v) => v < 0, bearishTest: (v) => v > 30, bullishLabel: "< 0 (easing)", bearishLabel: "> 30% (tightening)", source: "FRED: DRTSCILM (SLOOS)" },
];

const BANK_METRICS: FredConfig[] = [
  { id: "USNIM", name: "Industry NIM (%)", multiply: 1, lookback: 180, bullishTest: (v) => v > 3.2, bearishTest: (v) => v < 2.8, bullishLabel: "> 3.2%", bearishLabel: "< 2.8%", source: "FRED: USNIM" },
  { id: "NFIBOPTM", name: "NFIB Optimism Index", multiply: 1, lookback: 90, bullishTest: (v) => v > 100, bearishTest: (v) => v < 92, bullishLabel: "> 100", bearishLabel: "< 92", source: "FRED: NFIBOPTM" },
  { id: "M2SL", name: "M2 Money Supply ($T)", multiply: 0.001, lookback: 90, bullishTest: () => false, bearishTest: () => false, bullishLabel: "Growing YoY", bearishLabel: "Contracting YoY", source: "FRED: M2SL" },
];

// ── Market Tickers ──

const INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "QQQ", name: "QQQ (Nasdaq 100)" },
  { symbol: "^VIX", name: "VIX" },
  { symbol: "DX-Y.NYB", name: "Dollar Index (DXY)" },
  { symbol: "^BKX", name: "KBW Bank Index" },
  { symbol: "KRE", name: "KRE Regional Banks" },
];

const SECTOR_ETFS = [
  { symbol: "XLF", name: "Financials" },
  { symbol: "XLK", name: "Technology" },
  { symbol: "XLE", name: "Energy" },
  { symbol: "XLV", name: "Healthcare" },
  { symbol: "XLI", name: "Industrials" },
  { symbol: "XLC", name: "Communication" },
  { symbol: "XLY", name: "Consumer Disc." },
  { symbol: "XLP", name: "Consumer Staples" },
  { symbol: "XLU", name: "Utilities" },
  { symbol: "XLRE", name: "Real Estate" },
  { symbol: "XLB", name: "Materials" },
  { symbol: "KRE", name: "Regional Banks" },
  { symbol: "XHB", name: "Homebuilders" },
  { symbol: "SMH", name: "Semiconductors" },
];

const CURRENCIES = [
  { symbol: "EURUSD=X", name: "EUR/USD" },
  { symbol: "GBPUSD=X", name: "GBP/USD" },
  { symbol: "JPY=X", name: "USD/JPY" },
  { symbol: "CHF=X", name: "USD/CHF" },
  { symbol: "AUDUSD=X", name: "AUD/USD" },
  { symbol: "CADUSD=X", name: "USD/CAD" },
  { symbol: "DX-Y.NYB", name: "DXY Index" },
];

const COMMODITIES = [
  { symbol: "CL=F", name: "Crude Oil (WTI)" },
  { symbol: "GC=F", name: "Gold" },
  { symbol: "SI=F", name: "Silver" },
];

const FACTORS = [
  { symbol: "MTUM", name: "Momentum Factor" },
  { symbol: "VLUE", name: "Value Factor" },
  { symbol: "QUAL", name: "Quality Factor" },
  { symbol: "SIZE", name: "Size Factor" },
  { symbol: "USMV", name: "Min Volatility" },
  { symbol: "COWZ", name: "Cash Cows (FCF)" },
];

// ── Helpers ──

async function fetchFredIndicators(configs: FredConfig[]): Promise<Indicator[]> {
  const results = await Promise.allSettled(
    configs.map(async (c) => {
      const [current, history] = await Promise.all([
        fetchFredSeries(c.id, c.lookback),
        fetchFredHistory(c.id, 13),
      ]);
      const val = current.latest !== null ? Math.round(current.latest * c.multiply * 100) / 100 : null;

      // Monthly resample for history
      const monthlyHist = resampleMonthly(history).map((h) => ({
        date: h.date,
        value: Math.round(h.value * c.multiply * 100) / 100,
      }));

      const signal: Indicator["signal"] =
        val === null ? "neutral" : c.bullishTest(val) ? "bullish" : c.bearishTest(val) ? "bearish" : "neutral";

      return {
        name: c.name,
        category: "",
        value: val,
        prior: monthlyHist.length >= 2 ? monthlyHist[monthlyHist.length - 2].value : null,
        change: val !== null && monthlyHist.length >= 2
          ? Math.round((val - monthlyHist[monthlyHist.length - 2].value) * 100) / 100
          : null,
        signal,
        bullishThreshold: c.bullishLabel,
        bearishThreshold: c.bearishLabel,
        source: c.source,
        history: monthlyHist,
      } as Indicator;
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<Indicator>).value);
}

function resampleMonthly(data: { date: string; value: number }[]): { date: string; value: number }[] {
  const byMonth = new Map<string, { date: string; value: number }>();
  for (const d of data) {
    const ym = d.date.substring(0, 7);
    byMonth.set(ym, d);
  }
  return Array.from(byMonth.values()).sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchMarketTickers(
  tickers: { symbol: string; name: string }[]
): Promise<MarketTicker[]> {
  const symbols = [...new Set(tickers.map((t) => t.symbol))];
  const [quotes, histories] = await Promise.all([
    fetchQuotes(symbols),
    Promise.allSettled(symbols.map((s) => fetchHistory(s, 12))),
  ]);

  const histMap = new Map<string, HistoricalData[]>();
  histories.forEach((r, i) => {
    histMap.set(symbols[i], r.status === "fulfilled" ? r.value : []);
  });

  return tickers.map((t) => {
    const q = quotes.get(t.symbol);
    const hist = histMap.get(t.symbol) || [];
    const mas = calculateMAs(hist);
    const price = q?.price ?? null;

    const aboveMa50 = price && mas.ma50 ? price > mas.ma50 : null;
    const aboveMa100 = price && mas.ma100 ? price > mas.ma100 : null;
    const aboveMa200 = price && mas.ma200 ? price > mas.ma200 : null;

    const bullishCount = [aboveMa50, aboveMa100, aboveMa200].filter((v) => v === true).length;
    const maSignal: MarketTicker["maSignal"] =
      bullishCount >= 3 ? "bullish" : bullishCount === 0 && price !== null ? "bearish" : "neutral";

    const monthlyHist = hist.length > 0
      ? resampleMonthly(hist.map((h) => ({ date: h.date, value: h.close })))
      : [];

    return {
      symbol: t.symbol,
      name: t.name,
      price,
      change: q?.change ?? null,
      changePct: q?.changePct ?? null,
      ...mas,
      aboveMa50,
      aboveMa100,
      aboveMa200,
      maSignal,
      history: monthlyHist,
    };
  });
}

// ── Fear & Greed ──

function computeFearGreed(
  vix: number | null,
  sp500: MarketTicker | undefined,
  hyOAS: number | null,
  yieldCurve: number | null
): FearGreedData {
  const components: FearGreedData["components"] = [];
  let total = 0;
  let count = 0;

  // VIX: 10=extreme greed (100), 30=extreme fear (0)
  if (vix !== null) {
    const score = Math.max(0, Math.min(100, 100 - ((vix - 10) / 20) * 100));
    components.push({ name: "VIX Level", value: Math.round(score), signal: score > 60 ? "Greed" : score < 40 ? "Fear" : "Neutral" });
    total += score;
    count++;
  }

  // S&P 500 vs 200 MA
  if (sp500?.price && sp500?.ma200) {
    const pctAbove = ((sp500.price - sp500.ma200) / sp500.ma200) * 100;
    const score = Math.max(0, Math.min(100, 50 + pctAbove * 5));
    components.push({ name: "Market Momentum", value: Math.round(score), signal: score > 60 ? "Greed" : score < 40 ? "Fear" : "Neutral" });
    total += score;
    count++;
  }

  // S&P 500 1-month momentum
  if (sp500?.changePct !== null && sp500?.changePct !== undefined) {
    const score = Math.max(0, Math.min(100, 50 + (sp500.changePct ?? 0) * 5));
    components.push({ name: "Price Momentum", value: Math.round(score), signal: score > 60 ? "Greed" : score < 40 ? "Fear" : "Neutral" });
    total += score;
    count++;
  }

  // Credit spreads: HY OAS 300=greed, 600=fear
  if (hyOAS !== null) {
    const score = Math.max(0, Math.min(100, 100 - ((hyOAS - 300) / 300) * 100));
    components.push({ name: "Credit Spreads", value: Math.round(score), signal: score > 60 ? "Greed" : score < 40 ? "Fear" : "Neutral" });
    total += score;
    count++;
  }

  // Yield curve: positive = greed, inverted = fear
  if (yieldCurve !== null) {
    const score = Math.max(0, Math.min(100, 50 + yieldCurve * 0.3));
    components.push({ name: "Yield Curve", value: Math.round(score), signal: score > 60 ? "Greed" : score < 40 ? "Fear" : "Neutral" });
    total += score;
    count++;
  }

  const finalScore = count > 0 ? Math.round(total / count) : 50;
  const label =
    finalScore >= 80 ? "Extreme Greed" :
    finalScore >= 60 ? "Greed" :
    finalScore >= 40 ? "Neutral" :
    finalScore >= 20 ? "Fear" : "Extreme Fear";

  return { score: finalScore, label, components };
}

// ── Main Data Fetch ──

export async function fetchDashboardData(): Promise<DashboardData> {
  // Fetch all FRED data in parallel
  const [creditSpreads, rates, macro, housing, fedWatch, consumerCredit, bankMetrics, cpiYoY, corePceYoY] =
    await Promise.all([
      fetchFredIndicators(CREDIT_SPREADS),
      fetchFredIndicators(RATES),
      fetchFredIndicators(MACRO),
      fetchFredIndicators(HOUSING),
      fetchFredIndicators(FED_WATCH),
      fetchFredIndicators(CONSUMER_CREDIT),
      fetchFredIndicators(BANK_METRICS),
      calculateYoY("CPIAUCSL"),
      calculateYoY("PCEPILFE"),
    ]);

  // Add Core PCE YoY to Fed Watch (the Fed's preferred inflation measure)
  if (corePceYoY.latest !== null) {
    fedWatch.unshift({
      name: "Core PCE YoY (%)",
      category: "",
      value: corePceYoY.latest,
      prior: corePceYoY.history.length >= 2 ? corePceYoY.history[corePceYoY.history.length - 2].value : null,
      change: null,
      signal: corePceYoY.latest < 2.5 ? "bullish" : corePceYoY.latest > 3.5 ? "bearish" : "neutral",
      bullishThreshold: "< 2.5%",
      bearishThreshold: "> 3.5%",
      source: "FRED: PCEPILFE (calculated YoY)",
      history: corePceYoY.history,
    });
  }

  // Add CPI YoY to macro
  if (cpiYoY.latest !== null) {
    macro.push({
      name: "CPI YoY (%)",
      category: "",
      value: cpiYoY.latest,
      prior: cpiYoY.history.length >= 2 ? cpiYoY.history[cpiYoY.history.length - 2].value : null,
      change: null,
      signal: cpiYoY.latest < 3 ? "bullish" : cpiYoY.latest > 4 ? "bearish" : "neutral",
      bullishThreshold: "< 3.0%",
      bearishThreshold: "> 4.0%",
      source: "FRED: CPIAUCSL (calculated)",
      history: cpiYoY.history,
    });
  }

  // Fetch all market data in parallel
  const [indices, sectorETFs, currencies, commodities, factors] = await Promise.all([
    fetchMarketTickers(INDICES),
    fetchMarketTickers(SECTOR_ETFS),
    fetchMarketTickers(CURRENCIES),
    fetchMarketTickers(COMMODITIES),
    fetchMarketTickers(FACTORS),
  ]);

  // RS Rankings from sector ETFs
  const rsRankings: RSRanking[] = [];
  for (const etf of sectorETFs) {
    const hist = await fetchHistory(etf.symbol, 12);
    const returns = calculateReturns(hist);
    const compositeRS = Math.round(
      (returns.return1m * 0.4 + returns.return3m * 0.3 + returns.return6m * 0.2 + returns.return1y * 0.1) * 10
    ) / 10;
    rsRankings.push({
      symbol: etf.symbol,
      name: etf.name,
      price: etf.price || 0,
      ...returns,
      compositeRS,
    });
  }
  rsRankings.sort((a, b) => b.compositeRS - a.compositeRS);

  // Fear & Greed
  const sp500 = indices.find((i) => i.symbol === "^GSPC");
  const vixTicker = indices.find((i) => i.symbol === "^VIX");
  const hyOAS = creditSpreads.find((c) => c.name.includes("HY OAS (bps)"));
  const yc = rates.find((r) => r.name.includes("10Y-2Y"));
  const fearGreed = computeFearGreed(
    vixTicker?.price ?? null,
    sp500,
    typeof hyOAS?.value === "number" ? hyOAS.value : null,
    typeof yc?.value === "number" ? yc.value : null
  );

  // Correlation matrix for sector ETFs
  const corrSymbols = SECTOR_ETFS.map((e) => e.symbol).filter((s, i, a) => a.indexOf(s) === i);
  const corrHistories = await Promise.allSettled(
    corrSymbols.map((s) => fetchHistory(s, 3))
  );
  const corrReturns = corrHistories.map((r) => {
    if (r.status !== "fulfilled" || r.value.length < 2) return [];
    const closes = r.value.map((h) => h.close);
    const rets: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    return rets;
  });

  const corrMatrix: number[][] = [];
  for (let i = 0; i < corrSymbols.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < corrSymbols.length; j++) {
      row.push(i === j ? 1 : calculateCorrelation(corrReturns[i], corrReturns[j]));
    }
    corrMatrix.push(row);
  }

  const correlation: CorrelationData = { symbols: corrSymbols, matrix: corrMatrix };

  // Earnings (upcoming for key bellwethers)
  const earnings = await fetchUpcomingEarnings();

  return {
    lastUpdated: new Date().toISOString(),
    bankSector: { creditSpreads, rates, macro, housing, fedWatch, consumerCredit, bankMetrics },
    market: { indices, sectorETFs, currencies, commodities, factors },
    rsRankings,
    fearGreed,
    correlation,
    earnings,
  };
}

async function fetchUpcomingEarnings(): Promise<EarningsEvent[]> {
  const bellwethers = ["JPM", "BAC", "WFC", "C", "GS", "MS", "USB", "PNC", "TFC", "SCHW", "COF", "AXP"];
  const events: EarningsEvent[] = [];

  const results = await Promise.allSettled(
    bellwethers.map(async (symbol) => {
      try {
        const q = await fetchQuotes([symbol]);
        const quote = q.get(symbol);
        return {
          symbol,
          name: quote?.name || symbol,
          date: "TBD",
          estimate: null,
          actual: null,
        };
      } catch {
        return { symbol, name: symbol, date: "TBD", estimate: null, actual: null };
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") events.push(r.value);
  }

  return events;
}
