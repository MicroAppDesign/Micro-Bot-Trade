/*
 * CDC ActionZone V3 2020 logic adapted from the user-provided Pine Script.
 * Original source attribution: piriya33
 * License: Mozilla Public License 2.0
 * https://mozilla.org/MPL/2.0/
 */

import { calculateEma } from "./indicators";
import type { Candle, CdcActionZonePoint } from "./types";

export type CdcActionZoneParameters = {
  fastPeriod: number;
  slowPeriod: number;
  smoothingPeriod: number;
  rsiPeriod: number;
  stochPeriod: number;
  smoothK: number;
  smoothD: number;
};

export const DEFAULT_CDC_ACTION_ZONE_PARAMETERS: CdcActionZoneParameters = {
  fastPeriod: 12,
  slowPeriod: 26,
  smoothingPeriod: 1,
  rsiPeriod: 14,
  stochPeriod: 14,
  smoothK: 3,
  smoothD: 3,
};

export function calculateCdcActionZone(
  candles: readonly Candle[],
  parameters: CdcActionZoneParameters = DEFAULT_CDC_ACTION_ZONE_PARAMETERS,
): CdcActionZonePoint[] {
  const closes = candles.map((candle) => candle.close);
  const smoothedPrice = calculateEma(closes, parameters.smoothingPeriod);
  const priceValues = smoothedPrice.map((value) => value ?? Number.NaN);
  const fast = calculateEma(priceValues, parameters.fastPeriod);
  const slow = calculateEma(priceValues, parameters.slowPeriod);
  const rsi = calculateRsiValues(closes, parameters.rsiPeriod);
  const rawStochRsi = rsi.map((value, index) => {
    if (value === null || index + 1 < parameters.stochPeriod) return null;
    const window = rsi.slice(index + 1 - parameters.stochPeriod, index + 1).filter((item): item is number => item !== null);
    if (window.length < parameters.stochPeriod) return null;
    const lowest = Math.min(...window);
    const highest = Math.max(...window);
    return highest === lowest ? 0 : ((value - lowest) / (highest - lowest)) * 100;
  });
  const k = calculateSma(rawStochRsi, parameters.smoothK);
  const d = calculateSma(k, parameters.smoothD);
  const green: boolean[] = [];
  const blue: boolean[] = [];
  const lightBlue: boolean[] = [];
  const red: boolean[] = [];
  const orange: boolean[] = [];
  const yellow: boolean[] = [];
  const bullish: boolean[] = [];
  const bearish: boolean[] = [];

  return candles.map((candle, index) => {
    const price = smoothedPrice[index];
    const fastMa = fast[index];
    const slowMa = slow[index];
    const hasMovingAverages = price !== null && fastMa !== null && slowMa !== null;
    const isBull = hasMovingAverages && fastMa! > slowMa!;
    const isBear = hasMovingAverages && fastMa! < slowMa!;
    const currentGreen = isBull && price! > fastMa!;
    const currentBlue = isBear && price! > fastMa! && price! > slowMa!;
    const currentLightBlue = isBear && price! > fastMa! && price! < slowMa!;
    const currentRed = isBear && price! < fastMa!;
    const currentOrange = isBull && price! < fastMa! && price! < slowMa!;
    const currentYellow = isBull && price! < fastMa! && price! > slowMa!;
    const currentBuyCondition = currentGreen && green[index - 1] !== true;
    const currentSellCondition = currentRed && red[index - 1] !== true;
    const wasBullish = bullish[index - 1] === true;
    const wasBearish = bearish[index - 1] === true;
    const buy = wasBearish && currentBuyCondition;
    const sell = wasBullish && currentSellCondition;
    const currentBullish = bullish[index - 1] === true ? !currentSellCondition : buy || currentGreen;
    const currentBearish = bearish[index - 1] === true ? !currentBuyCondition : sell || currentRed;
    const stochRsiBuy = calculateMomentumSignal(k, d, index, currentBullish, 30, true);
    const stochRsiSell = calculateMomentumSignal(k, d, index, currentBearish, 70, false);

    green.push(currentGreen);
    blue.push(currentBlue);
    lightBlue.push(currentLightBlue);
    red.push(currentRed);
    orange.push(currentOrange);
    yellow.push(currentYellow);
    bullish.push(currentBullish);
    bearish.push(currentBearish);

    return {
      time: candle.time,
      fastMa,
      slowMa,
      zone: currentGreen ? "green" : currentBlue ? "blue" : currentLightBlue ? "light-blue" : currentRed ? "red" : currentOrange ? "orange" : currentYellow ? "yellow" : "neutral",
      trend: currentBullish ? "bullish" : currentBearish ? "bearish" : "sideways",
      buy,
      sell,
      stochRsiK: k[index],
      stochRsiD: d[index],
      stochRsiBuy,
      stochRsiSell,
    };
  });
}

function calculateRsiValues(values: readonly number[], period: number): Array<number | null> {
  const result: Array<number | null> = Array(values.length).fill(null);
  if (values.length <= period) return result;
  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const change = values[index] - values[index - 1];
    gains += Math.max(change, 0);
    losses += Math.max(-change, 0);
  }
  let averageGain = gains / period;
  let averageLoss = losses / period;
  result[period] = toRsi(averageGain, averageLoss);
  for (let index = period + 1; index < values.length; index += 1) {
    const change = values[index] - values[index - 1];
    averageGain = (averageGain * (period - 1) + Math.max(change, 0)) / period;
    averageLoss = (averageLoss * (period - 1) + Math.max(-change, 0)) / period;
    result[index] = toRsi(averageGain, averageLoss);
  }
  return result;
}

function toRsi(gain: number, loss: number): number {
  if (loss === 0) return gain === 0 ? 50 : 100;
  return 100 - 100 / (1 + gain / loss);
}

function calculateSma(values: readonly (number | null)[], period: number): Array<number | null> {
  return values.map((_, index) => {
    if (index + 1 < period) return null;
    const window = values.slice(index + 1 - period, index + 1);
    if (window.some((value) => value === null)) return null;
    const numericWindow = window as number[];
    return numericWindow.reduce((sum, value) => sum + value, 0) / period;
  });
}

function calculateMomentumSignal(
  k: readonly (number | null)[],
  d: readonly (number | null)[],
  index: number,
  trend: boolean,
  threshold: number,
  isBuy: boolean,
): 0 | 1 | 2 {
  if (!trend || index === 0 || k[index] === null || d[index] === null || k[index - 1] === null || d[index - 1] === null) return 0;
  const crossed = isBuy ? k[index]! > d[index]! && k[index - 1]! <= d[index - 1]! : k[index]! < d[index]! && k[index - 1]! >= d[index - 1]!;
  if (!crossed) return 0;
  const isExtreme = isBuy ? d[index]! < threshold : d[index]! > threshold;
  return isExtreme ? 2 : 1;
}