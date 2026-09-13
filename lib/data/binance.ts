import { normalizeCandles, type RawCandle } from "../market/normalize";
import {
  MARKET_SYMBOLS,
  MARKET_TIMEFRAME,
  type Candle,
  type MarketSymbol,
} from "../market/types";

const BINANCE_BASE_URL = process.env.MARKET_DATA_BASE_URL ?? "https://api.binance.com";
const REQUEST_TIMEOUT_MS = Number(process.env.MARKET_DATA_TIMEOUT_MS ?? 10_000);

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

export function isMarketSymbol(value: string): value is MarketSymbol {
  return MARKET_SYMBOLS.includes(value as MarketSymbol);
}

export function isMarketTimeframe(value: string): value is typeof MARKET_TIMEFRAME {
  return value === MARKET_TIMEFRAME;
}

export async function fetchHistoricalCandles(
  symbol: MarketSymbol,
  limit: number,
): Promise<Candle[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = new URL("/api/v3/klines", BINANCE_BASE_URL);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", MARKET_TIMEFRAME);
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Binance historical request failed with ${response.status}`);
    }

    const raw = (await response.json()) as BinanceKline[];
    const candles = raw.map(toRawCandle);
    return normalizeCandles(candles).candles;
  } finally {
    clearTimeout(timeout);
  }
}

function toRawCandle(kline: BinanceKline): RawCandle {
  return {
    time: kline[0],
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5]),
    isClosed: kline[6] <= Date.now(),
  };
}