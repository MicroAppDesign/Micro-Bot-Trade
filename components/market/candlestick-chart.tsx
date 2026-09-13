"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import type { Candle } from "@/lib/market/types";

type CandlestickChartProps = {
  candles: readonly Candle[];
  actionZone: readonly { time: number; fastMa: number | null; slowMa: number | null }[];
};

export function CandlestickChart({ candles, actionZone }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const fastSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const slowSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#10151f" },
        textColor: "#9ba8bc",
      },
      grid: {
        vertLines: { color: "#1d2634" },
        horzLines: { color: "#1d2634" },
      },
      rightPriceScale: { borderColor: "#2b3748" },
      timeScale: { borderColor: "#2b3748", timeVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#46d39a",
      downColor: "#f06f82",
      borderVisible: false,
      wickUpColor: "#46d39a",
      wickDownColor: "#f06f82",
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "#53647d",
    });
    const fastSeries = chart.addSeries(LineSeries, { color: "#f4c95d", lineWidth: 2 });
    const slowSeries = chart.addSeries(LineSeries, { color: "#6e9bd2", lineWidth: 2 });

    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } });
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    fastSeriesRef.current = fastSeries;
    slowSeriesRef.current = slowSeries;

    const resizeObserver = new ResizeObserver(() => chart.timeScale().fitContent());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      fastSeriesRef.current = null;
      slowSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const fastSeries = fastSeriesRef.current;
    const slowSeries = slowSeriesRef.current;
    if (!candleSeries || !volumeSeries || !fastSeries || !slowSeries) {
      return;
    }

    candleSeries.setData(
      candles.map((candle) => ({
        time: Math.floor(candle.time / 1000) as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );
    volumeSeries.setData(
      candles.map((candle) => ({
        time: Math.floor(candle.time / 1000) as Time,
        value: candle.volume,
        color: candle.close >= candle.open ? "#2f9b76" : "#a84e65",
      })),
    );
    fastSeries.setData(
      actionZone.flatMap((point) => point.fastMa === null ? [] : [{ time: Math.floor(point.time / 1000) as Time, value: point.fastMa }]),
    );
    slowSeries.setData(
      actionZone.flatMap((point) => point.slowMa === null ? [] : [{ time: Math.floor(point.time / 1000) as Time, value: point.slowMa }]),
    );
    chartRef.current?.timeScale().fitContent();
  }, [actionZone, candles]);

  return <div ref={containerRef} className="chart-canvas" aria-label="Daily candlestick chart" />;
}