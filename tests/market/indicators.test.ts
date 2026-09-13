import { describe, expect, it } from "vitest";
import {
  calculateEma,
  calculateMacd,
  calculateRsi,
  calculateVolumeAverage,
} from "../../lib/market/indicators";

describe("indicator calculations", () => {
  it("returns null during EMA warm-up and seeds with the simple average", () => {
    expect(calculateEma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("returns 100 for a strictly rising RSI series after warm-up", () => {
    expect(calculateRsi([1, 2, 3, 4, 5], 3)).toEqual([null, null, null, 100, 100]);
  });

  it("produces aligned MACD, signal, and histogram arrays", () => {
    const result = calculateMacd([1, 2, 3, 4, 5, 6, 7], 2, 3, 2);

    expect(result.macd).toHaveLength(7);
    expect(result.signal).toHaveLength(7);
    expect(result.histogram).toHaveLength(7);
    expect(result.macd.slice(0, 2)).toEqual([null, null]);
    expect(result.signal.slice(0, 3)).toEqual([null, null, null]);
  });

  it("calculates a rolling volume average", () => {
    expect(calculateVolumeAverage([10, 20, 30, 40], 2)).toEqual([null, 15, 25, 35]);
  });
});