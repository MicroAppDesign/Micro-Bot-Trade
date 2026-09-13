import type { Candle, IndicatorParameters, IndicatorPoint, IndicatorSnapshot } from "./types";

export const DEFAULT_INDICATOR_PARAMETERS: IndicatorParameters = {
  emaPeriods: [20, 50],
  rsiPeriod: 14,
  macd: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  volumeAveragePeriod: 20,
};

function assertPeriod(period: number): void {
  if (!Number.isInteger(period) || period < 1) {
    throw new Error("Indicator periods must be positive integers");
  }
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateEma(values: readonly number[], period: number): Array<number | null> {
  assertPeriod(period);
  const result: Array<number | null> = Array(values.length).fill(null);

  if (values.length < period) {
    return result;
  }

  let previous = average(values.slice(0, period));
  result[period - 1] = previous;
  const multiplier = 2 / (period + 1);

  for (let index = period; index < values.length; index += 1) {
    previous = (values[index] - previous) * multiplier + previous;
    result[index] = previous;
  }

  return result;
}

export function calculateRsi(values: readonly number[], period: number): Array<number | null> {
  assertPeriod(period);
  const result: Array<number | null> = Array(values.length).fill(null);

  if (values.length <= period) {
    return result;
  }

  let gainSum = 0;
  let lossSum = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    gainSum += Math.max(change, 0);
    lossSum += Math.max(-change, 0);
  }

  let averageGain = gainSum / period;
  let averageLoss = lossSum / period;
  result[period] = toRsi(averageGain, averageLoss);

  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    result[index] = toRsi(averageGain, averageLoss);
  }

  return result;
}

function toRsi(averageGain: number, averageLoss: number): number {
  if (averageLoss === 0) {
    return averageGain === 0 ? 50 : 100;
  }

  return 100 - 100 / (1 + averageGain / averageLoss);
}

export function calculateMacd(
  values: readonly number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number,
): {
  macd: Array<number | null>;
  signal: Array<number | null>;
  histogram: Array<number | null>;
} {
  assertPeriod(fastPeriod);
  assertPeriod(slowPeriod);
  assertPeriod(signalPeriod);

  if (fastPeriod >= slowPeriod) {
    throw new Error("MACD fast period must be smaller than slow period");
  }

  const fast = calculateEma(values, fastPeriod);
  const slow = calculateEma(values, slowPeriod);
  const macd = slow.map((slowValue, index) =>
    slowValue === null || fast[index] === null ? null : fast[index]! - slowValue,
  );
  const signalValues = macd.filter((value): value is number => value !== null);
  const signalEma = calculateEma(signalValues, signalPeriod);
  const signal: Array<number | null> = Array(values.length).fill(null);
  let signalIndex = 0;

  for (let index = 0; index < macd.length; index += 1) {
    if (macd[index] !== null) {
      signal[index] = signalEma[signalIndex];
      signalIndex += 1;
    }
  }

  const histogram = macd.map((value, index) =>
    value === null || signal[index] === null ? null : value - signal[index]!,
  );

  return { macd, signal, histogram };
}

export function calculateVolumeAverage(
  volumes: readonly number[],
  period: number,
): Array<number | null> {
  assertPeriod(period);
  return volumes.map((_, index) =>
    index + 1 < period ? null : average(volumes.slice(index + 1 - period, index + 1)),
  );
}

export function calculateIndicatorSnapshot(
  candles: readonly Candle[],
  parameters: IndicatorParameters = DEFAULT_INDICATOR_PARAMETERS,
): IndicatorSnapshot[] {
  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);
  const ema20 = calculateEma(closes, parameters.emaPeriods[0]);
  const ema50 = calculateEma(closes, parameters.emaPeriods[1]);
  const rsi = calculateRsi(closes, parameters.rsiPeriod);
  const macd = calculateMacd(
    closes,
    parameters.macd.fastPeriod,
    parameters.macd.slowPeriod,
    parameters.macd.signalPeriod,
  );
  const volumeAverage = calculateVolumeAverage(volumes, parameters.volumeAveragePeriod);

  return candles.map((_, index) => ({
    ema20: ema20[index],
    ema50: ema50[index],
    rsi: rsi[index],
    macd: {
      value: macd.macd[index],
      signal: macd.signal[index],
      histogram: macd.histogram[index],
    },
    volumeAverage: volumeAverage[index],
  }));
}

export function toIndicatorPoints(
  candles: readonly Candle[],
  values: readonly (number | null)[],
): IndicatorPoint[] {
  return candles.flatMap((candle, index) => {
    const value = values[index];
    return value === null || value === undefined ? [] : [{ time: candle.time, value }];
  });
}