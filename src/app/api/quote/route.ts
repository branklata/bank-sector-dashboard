import { NextRequest, NextResponse } from "next/server";
import { fetchQuotes, fetchHistory, calculateMAs } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  const symbols = symbol.split(",").map((s) => s.trim().toUpperCase());
  const quotes = await fetchQuotes(symbols);
  const results = [];

  for (const s of symbols) {
    const q = quotes.get(s);
    const hist = await fetchHistory(s, 12);
    const mas = calculateMAs(hist);
    results.push({
      symbol: s,
      name: q?.name || s,
      price: q?.price,
      change: q?.change,
      changePct: q?.changePct,
      ...mas,
      aboveMa50: q?.price && mas.ma50 ? q.price > mas.ma50 : null,
      aboveMa100: q?.price && mas.ma100 ? q.price > mas.ma100 : null,
      aboveMa200: q?.price && mas.ma200 ? q.price > mas.ma200 : null,
    });
  }

  return NextResponse.json(results);
}
