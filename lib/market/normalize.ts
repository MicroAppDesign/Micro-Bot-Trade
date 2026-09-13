import type { Candle } from "./types";

export type RawCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed?: boolean;
};

export type CandleQuality = {
  duplicateTimes: number[];
  gaps: Array<{ from: number; to: number }>;
  futureTimes: number[];
  invalidTimes: number[];
};

export type NormalizedCandles = {
  candles: Candle[];
  quality: CandleQuality;
};

export function normalizeCandles(
  rawCandles: readonly RawCandle[],
  now = Date.now(),
  intervalMs = 86_400_000,
): NormalizedCandles {
  const duplicateTimes: number[] = [];
  const invalidTimes: number[] = [];
  const futureTimes: number[] = [];
  const unique = new Map<number, Candle>();

  for (const raw of rawCandles) {
    const values = [raw.open, raw.high, raw.low, raw.close, raw.volume];
    if (!Number.isFinite(raw.time) || values.some((value) => !Number.isFinite(value))) {
      invalidTimes.push(raw.time);
      continue;
    }

    if (raw.time > now) {
      futureTimes.push(raw.time);
      continue;
    }

    if (unique.has(raw.time)) {
      duplicateTimes.push(raw.time);
      continue;
    }

    unique.set(raw.time, {
      time: raw.time,
      open: raw.open,
      high: raw.high,
      low: raw.low,
      close: raw.close,
      volume: raw.volume,
      isClosed: raw.isClosed ?? true,
    });
  }

  const candles = [...unique.values()].sort((left, right) => left.time - right.time);
  const gaps: Array<{ from: number; to: number }> = [];

  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1].time;
    const current = candles[index].time;
    if (current - previous > intervalMs) {
      gaps.push({ from: previous, to: current });
    }
  }

  return {
    candles,
    quality: { duplicateTimes, gaps, futureTimes, invalidTimes },
  };
}