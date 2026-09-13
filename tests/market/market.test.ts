import { describe, expect, it } from "vitest";
import { normalizeCandles } from "../../lib/market/normalize";
import { createAnalysisResult } from "../../lib/market/signals";
import { calculateCdcActionZone, DEFAULT_CDC_ACTION_ZONE_PARAMETERS } from "../../lib/market/cdc-action-zone";
import type { Candle, IndicatorSnapshot } from "../../lib/market/types";

const candle = (time: number): Candle => ({
  time,
  open: 100,
  high: 110,
  low: 90,
  close: 105,
  volume: 200,
  isClosed: true,
});

describe("market data boundaries", () => {
  it("sorts candles, removes duplicates, and reports gaps", () => {
    const result = normalizeCandles(
      [
        { ...candle(172800000), isClosed: true },
        { ...candle(0), isClosed: true },
        { ...candle(0), isClosed: true },
      ],
      200000000,
    );

    expect(result.candles.map((item) => item.time)).toEqual([0, 172800000]);
    expect(result.quality.duplicateTimes).toEqual([0]);
    expect(result.quality.gaps).toEqual([{ from: 0, to: 172800000 }]);
  });

  it("creates a bullish result only when at least three checks pass", () => {
    const indicators: IndicatorSnapshot = {
      ema20: 100,
      ema50: 90,
      rsi: 60,
      macd: { value: 3, signal: 2, histogram: 1 },
      volumeAverage: 100,
    };

    expect(createAnalysisResult(candle(0), indicators).state).toBe("bullish");
  });

  it("keeps incomplete indicator data neutral", () => {
    const indicators: IndicatorSnapshot = {
      ema20: null,
      ema50: null,
      rsi: null,
      macd: { value: null, signal: null, histogram: null },
      volumeAverage: null,
    };

    expect(createAnalysisResult(candle(0), indicators).state).toBe("neutral");
  });
});

describe("CDC ActionZone", () => {
  it("uses the Pine defaults and keeps moving averages unavailable during warm-up", () => {
    const candles = Array.from({ length: 25 }, (_, index) => candle(index * 86_400_000));
    const points = calculateCdcActionZone(candles);

    expect(DEFAULT_CDC_ACTION_ZONE_PARAMETERS.fastPeriod).toBe(12);
    expect(DEFAULT_CDC_ACTION_ZONE_PARAMETERS.slowPeriod).toBe(26);
    expect(points[0].fastMa).toBeNull();
    expect(points[24].slowMa).toBeNull();
  });

  it("classifies a sustained rising series as a bullish ActionZone trend after warm-up", () => {
    const candles = Array.from({ length: 80 }, (_, index) => ({
      ...candle(index * 86_400_000),
      open: 100 + index,
      high: 102 + index,
      low: 99 + index,
      close: 101 + index,
    }));
    const latest = calculateCdcActionZone(candles).at(-1);

    expect(latest?.trend).toBe("bullish");
    expect(["green", "yellow", "neutral"]).toContain(latest?.zone);
  });
});