"use client";

import { useEffect, useMemo, useState } from "react";
import { CandlestickChart } from "@/components/market/candlestick-chart";
import { createFixtureCandles } from "@/lib/market/fixtures";
import { calculateCdcActionZone } from "@/lib/market/cdc-action-zone";
import { calculateIndicatorSnapshot } from "@/lib/market/indicators";
import { createAnalysisResult } from "@/lib/market/signals";
import { MARKET_SYMBOLS, type Candle, type MarketDataStatus, type MarketSymbol } from "@/lib/market/types";

const symbolLabels: Record<MarketSymbol, string> = {
  BTCUSDT: "BTC / USDT",
  ETHUSDT: "ETH / USDT",
  SOLUSDT: "SOL / USDT",
};

export default function Dashboard() {
  const [symbol, setSymbol] = useState<MarketSymbol>("BTCUSDT");
  const [candles, setCandles] = useState<Candle[]>(() => createFixtureCandles("BTCUSDT"));
  const [status, setStatus] = useState<MarketDataStatus>("loading");
  const [source, setSource] = useState("Fixture data");

  useEffect(() => {
    let active = true;

    fetch(`/api/market?symbol=${symbol}&timeframe=1d&limit=120`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Market data request failed");
        }
        return (await response.json()) as { candles: Candle[]; source: string };
      })
      .then((data) => {
        if (!active) return;
        setCandles(data.candles);
        setSource(data.source);
        setStatus("connected");
      })
      .catch(() => {
        if (!active) return;
        setCandles(createFixtureCandles(symbol));
        setSource("Fixture data (offline fallback)");
        setStatus("stale");
      });

    return () => {
      active = false;
    };
  }, [symbol]);

  useEffect(() => {
    if (typeof WebSocket === "undefined") return;

    const socketUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1d`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => setStatus("connected");
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        k: { t: number; o: string; h: string; l: string; c: string; v: string; x: boolean };
      };
      const kline = payload.k;
      const nextCandle: Candle = {
        time: kline.t,
        open: Number(kline.o),
        high: Number(kline.h),
        low: Number(kline.l),
        close: Number(kline.c),
        volume: Number(kline.v),
        isClosed: kline.x,
      };
      setCandles((current) => {
        const withoutCurrent = current.filter((candle) => candle.time !== nextCandle.time);
        return [...withoutCurrent, nextCandle].sort((left, right) => left.time - right.time).slice(-120);
      });
    };
    socket.onerror = () => setStatus("stale");
    socket.onclose = () => setStatus((current) => (current === "connected" ? "reconnecting" : current));

    return () => socket.close();
  }, [symbol]);

  const snapshots = useMemo(() => calculateIndicatorSnapshot(candles), [candles]);
  const actionZone = useMemo(() => calculateCdcActionZone(candles), [candles]);
  const latestCandle = candles.at(-1);
  const latestSnapshot = snapshots.at(-1);
  const analysis = latestCandle && latestSnapshot ? createAnalysisResult(latestCandle, latestSnapshot) : null;
  const latestActionZone = actionZone.at(-1);
  const priceChange = latestCandle && candles.at(-2) ? latestCandle.close - candles.at(-2)!.close : 0;

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MARKET INTELLIGENCE / LOCAL</p>
          <h1>Signal Desk</h1>
        </div>
        <div className="connection-pill">
          <span className={`status-dot status-${status}`} />
          <span>{status}</span>
        </div>
      </header>

      <section className="control-row" aria-label="Market controls">
        <div className="symbol-tabs">
          {MARKET_SYMBOLS.map((marketSymbol) => (
            <button
              key={marketSymbol}
              className={marketSymbol === symbol ? "symbol-tab active" : "symbol-tab"}
              onClick={() => {
                setStatus("loading");
                setSymbol(marketSymbol);
              }}
              type="button"
            >
              {symbolLabels[marketSymbol]}
            </button>
          ))}
        </div>
        <div className="timeframe-badge">1D / Daily</div>
      </section>

      <section className="market-heading">
        <div>
          <p className="market-symbol">{symbolLabels[symbol]}</p>
          <div className="price-line">
            <strong>{latestCandle ? latestCandle.close.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--"}</strong>
            <span className={priceChange >= 0 ? "positive" : "negative"}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="data-source">
          <span>{source}</span>
          <span>UTC candles / Bangkok display</span>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="chart-panel panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">PRICE ACTION</p>
              <h2>Daily candles</h2>
            </div>
            <span className="live-label">{latestCandle?.isClosed ? "CLOSED CANDLE" : "LIVE CANDLE"}</span>
          </div>
          <CandlestickChart candles={candles} actionZone={actionZone} />
        </div>

        <aside className="signal-panel panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">RULE-BASED READ</p>
              <h2>Current state</h2>
            </div>
            <span className={`signal-state state-${analysis?.state ?? "neutral"}`}>{analysis?.state ?? "neutral"}</span>
          </div>
          <div className="action-zone-readout">
            <span className="panel-kicker">CDC ACTIONZONE</span>
            <strong className={`zone-${latestActionZone?.zone ?? "neutral"}`}>{latestActionZone?.zone ?? "warming up"}</strong>
            <span>{latestActionZone?.buy ? "Buy transition" : latestActionZone?.sell ? "Sell transition" : `${latestActionZone?.trend ?? "sideways"} trend`}</span>
          </div>
          <div className="signal-score">
            <strong>{analysis ? analysis.reasons[0].split(": ")[1] : "--"}</strong>
            <span>bullish checks</span>
          </div>
          <ul className="reason-list">
            {analysis?.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          <p className="disclaimer">Analysis only. This dashboard is not investment advice.</p>
        </aside>
      </section>

      <section className="metrics-grid" aria-label="Indicator metrics">
        {[
          ["EMA 20", latestSnapshot?.ema20],
          ["EMA 50", latestSnapshot?.ema50],
          ["RSI 14", latestSnapshot?.rsi],
          ["MACD histogram", latestSnapshot?.macd.histogram],
          ["Volume average", latestSnapshot?.volumeAverage],
        ].map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "Warming up"}</strong>
          </div>
        ))}
      </section>

      <footer className="footer-note">Market data provided by Binance. Source values are normalized before analysis.</footer>
    </main>
  );
}