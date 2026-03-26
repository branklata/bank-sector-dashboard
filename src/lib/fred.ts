const FRED_API_KEY = process.env.FRED_API_KEY || "";
const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

interface FredObs {
  date: string;
  value: string;
}

export async function fetchFredSeries(
  seriesId: string,
  lookbackDays = 30
): Promise<{ latest: number | null; history: { date: string; value: number }[] }> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - lookbackDays);

  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${fmt(start)}&observation_end=${fmt(end)}&sort_order=asc`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();
    const obs: FredObs[] = json.observations || [];
    const valid = obs
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

    return {
      latest: valid.length > 0 ? valid[valid.length - 1].value : null,
      history: valid,
    };
  } catch {
    return { latest: null, history: [] };
  }
}

export async function fetchFredHistory(
  seriesId: string,
  months = 13
): Promise<{ date: string; value: number }[]> {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);

  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${fmt(start)}&observation_end=${fmt(end)}&sort_order=asc`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();
    const obs: FredObs[] = json.observations || [];
    return obs
      .filter((o) => o.value !== ".")
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
  } catch {
    return [];
  }
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function calculateYoY(seriesId: string): Promise<{
  latest: number | null;
  history: { date: string; value: number }[];
}> {
  const data = await fetchFredHistory(seriesId, 25);
  if (data.length < 13) return { latest: null, history: [] };

  const monthly: { date: string; value: number }[] = [];
  const seen = new Set<string>();
  for (const d of data) {
    const ym = d.date.substring(0, 7);
    if (!seen.has(ym)) {
      seen.add(ym);
      monthly.push(d);
    }
  }

  const yoyHistory: { date: string; value: number }[] = [];
  for (let i = 12; i < monthly.length; i++) {
    const curr = monthly[i].value;
    const prior = monthly[i - 12].value;
    if (prior !== 0) {
      yoyHistory.push({
        date: monthly[i].date,
        value: Math.round(((curr - prior) / prior) * 1000) / 10,
      });
    }
  }

  return {
    latest: yoyHistory.length > 0 ? yoyHistory[yoyHistory.length - 1].value : null,
    history: yoyHistory,
  };
}
