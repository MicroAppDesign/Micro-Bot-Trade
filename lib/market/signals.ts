import type { AnalysisResult, Candle, IndicatorSnapshot } from "./types";

export function createAnalysisResult(
  candle: Candle,
  indicators: IndicatorSnapshot,
): AnalysisResult {
  const checks = [
    indicators.ema20 !== null && candle.close > indicators.ema20,
    indicators.ema20 !== null && indicators.ema50 !== null && indicators.ema20 > indicators.ema50,
    indicators.rsi !== null && indicators.rsi >= 50 && indicators.macd.histogram !== null && indicators.macd.histogram > 0,
    indicators.volumeAverage !== null && candle.volume >= indicators.volumeAverage,
  ];
  const bullishChecks = checks.filter(Boolean).length;
  const bearishChecks = [
    indicators.ema20 !== null && candle.close < indicators.ema20,
    indicators.ema20 !== null && indicators.ema50 !== null && indicators.ema20 < indicators.ema50,
    indicators.rsi !== null && indicators.rsi < 50 && indicators.macd.histogram !== null && indicators.macd.histogram < 0,
    indicators.volumeAverage !== null && candle.volume < indicators.volumeAverage,
  ].filter(Boolean).length;
  const state = bullishChecks >= 3 ? "bullish" : bearishChecks >= 3 ? "bearish" : "neutral";
  const reasons = [
    `Bullish checks: ${bullishChecks}/4`,
    `Bearish checks: ${bearishChecks}/4`,
    candle.isClosed ? "Based on a closed Daily candle" : "Live candle is not confirmed",
  ];

  return {
    state,
    timestamp: candle.time,
    timeframe: "1d",
    inputs: indicators,
    reasons,
    isBasedOnClosedCandle: candle.isClosed,
  };
}