import { fetchHistoricalCandles, isMarketSymbol, isMarketTimeframe } from "@/lib/data/binance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "BTCUSDT";
  const timeframe = url.searchParams.get("timeframe") ?? "1d";
  const requestedLimit = Number(url.searchParams.get("limit") ?? "120");

  if (!isMarketSymbol(symbol) || !isMarketTimeframe(timeframe)) {
    return Response.json({ error: "Unsupported symbol or timeframe" }, { status: 400 });
  }

  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 60), 1000) : 120;

  try {
    const candles = await fetchHistoricalCandles(symbol, limit);
    return Response.json({
      symbol,
      timeframe,
      source: "Binance",
      fetchedAt: Date.now(),
      candles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Market data request failed";
    return Response.json({ error: message }, { status: 502 });
  }
}