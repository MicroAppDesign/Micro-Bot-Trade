export const MARKET_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;
export const MARKET_TIMEFRAME = "1d" as const;

export type MarketSymbol = (typeof MARKET_SYMBOLS)[number];
export type MarketTimeframe = typeof MARKET_TIMEFRAME;

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
};

export type IndicatorParameters = {
  emaPeriods: readonly [number, number];
  rsiPeriod: number;
  macd: {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  volumeAveragePeriod: number;
};

export type IndicatorPoint = {
  time: number;
  value: number | null;
};

export type IndicatorSnapshot = {
  ema20: number | null;
  ema50: number | null;
  rsi: number | null;
  macd: {
    value: number | null;
    signal: number | null;
    histogram: number | null;
  };
  volumeAverage: number | null;
};

export type ActionZone = "green" | "blue" | "light-blue" | "red" | "orange" | "yellow" | "neutral";
export type ActionTrend = "bullish" | "bearish" | "sideways";

export type CdcActionZonePoint = {
  time: number;
  fastMa: number | null;
  slowMa: number | null;
  zone: ActionZone;
  trend: ActionTrend;
  buy: boolean;
  sell: boolean;
  stochRsiK: number | null;
  stochRsiD: number | null;
  stochRsiBuy: 0 | 1 | 2;
  stochRsiSell: 0 | 1 | 2;
};

export type AnalysisState = "bullish" | "bearish" | "neutral";

export type AnalysisResult = {
  state: AnalysisState;
  timestamp: number;
  timeframe: MarketTimeframe;
  inputs: IndicatorSnapshot;
  reasons: string[];
  isBasedOnClosedCandle: boolean;
};

export type MarketQuery = {
  symbol: MarketSymbol;
  timeframe: MarketTimeframe;
  limit: number;
};

export type MarketDataStatus =
  | "idle"
  | "loading"
  | "connected"
  | "stale"
  | "reconnecting"
  | "error";