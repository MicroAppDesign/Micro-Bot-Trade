import type { Candle, MarketSymbol } from "./types";

export function createFixtureCandles(symbol: MarketSymbol, count = 120): Candle[] {
  const seed = symbol.length * 17;
  const start = Date.UTC(2025, 0, 1);
  let close = 90 + seed;

  return Array.from({ length: count }, (_, index) => {
    const drift = Math.sin(index / 8) * 2 + (index % 9 === 0 ? 3 : -0.4);
    const open = close;
    close = Math.max(10, close + drift);
    const high = Math.max(open, close) + 1.8;
    const low = Math.min(open, close) - 1.4;

    return {
      time: start + index * 86_400_000,
      open,
      high,
      low,
      close,
      volume: 900 + Math.abs(drift) * 180 + (index % 7) * 55,
      isClosed: true,
    };
  });
}