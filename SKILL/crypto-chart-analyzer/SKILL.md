---
name: crypto-chart-analyzer
description: "Project-specific workflow for the Binance Spot crypto chart analyzer. Use when implementing chart UI, Binance historical/realtime market data, Daily candles, technical indicators, Bullish/Bearish/Neutral analysis, or related tests."
---

# Crypto Chart Analyzer Project Skill

## Mission

Build an online-capable application for analyzing Binance Spot market data. Local development comes first, but the product direction includes authenticated persistence and background notifications. The product shows Daily (`1d`) charts for BTCUSDT, ETHUSDT, and SOLUSDT with historical and realtime data, technical indicators, Fibonacci confluence, and explainable analysis states.

## Locked Product Decisions

- Provider: Binance public market-data API
- Market: Binance Spot
- Symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`
- Primary timeframe: `1d`
- Data mode: historical + realtime in the MVP
- Realtime scope: live Daily candle only; no ticker stream in the MVP
- UI language: English
- Display timezone: `Asia/Bangkok`
- Internal timestamp: UTC
- Analysis states: `Bullish`, `Bearish`, `Neutral`
- Additional indicator: CDC ActionZone V3 2020 adapted from the user-provided MPL 2.0 Pine source
- Planned AI role: three-model consensus explains deterministic facts and identifies `consider-entry`, `consider-exit`, or `wait`; not execute trades or invent market facts
- Planned alerts: deterministic triggers with in-app/browser notification first
- Fibonacci: confluence tool with confirmed swing points; never a standalone trigger
- AI learning: context-first explanation and evaluation dataset before any training/fine-tuning
- Catalog-verified consensus models: `google/gemini-2.5-flash`, `meta/llama-3.1-8b`, and `openai/gpt-4o-mini`
- Execution: analysis only; never add order placement, trading keys, auto-trading, or investment-return claims without explicit approval
- Deployment target: local development first

## Implementation Rules

1. Read the repository `AGENTS.md` and the installed Next.js documentation under `node_modules/next/dist/docs/` before editing source code.
2. Keep provider access behind an adapter. UI components must not depend directly on Binance response shapes.
3. Normalize all candles before indicators or chart rendering.
4. Use closed Daily candles for primary signals. Treat the currently forming candle as live/unconfirmed and label it clearly.
5. Store timestamps as UTC epoch milliseconds in the domain layer. Convert only at provider/chart/display boundaries.
6. Validate symbol, timeframe, limit, numeric values, timestamp ordering, duplicates, gaps, and future timestamps.
7. Prevent stale requests and realtime events from overwriting the currently selected symbol/timeframe.
8. Keep Binance credentials out of the client bundle. Public market-data endpoints do not require API keys for this MVP.
9. Do not silently interpolate missing candles. Show a data-quality warning when a gap can affect indicators.
10. Every analysis result must include state, timestamp, timeframe, source inputs, reasons, and whether it uses a closed candle.
11. Keep source changes scoped. Do not add authentication, database, paper trading, AI price prediction, external notifications, or production deployment unless the plan is explicitly revised. Local deterministic alerts and structured AI analysis require the separate planning gate.
12. Add focused tests for every indicator and data-boundary behavior before expanding to adjacent features.
13. Preserve the CDC ActionZone source attribution and MPL 2.0 notice when modifying its adapted implementation.
14. Keep AI calls server-only and pass compact, validated facts rather than raw unbounded market history.
15. Treat AI output as untrusted: validate schema, source timestamp, risks, and invalidation; fallback to `wait` on failure.
16. Keep alert triggering deterministic. AI may explain or prioritize a triggered event but cannot be the sole trigger.
17. Do not add Telegram/email/push or background scheduling until persistence, delivery retry, and opt-out rules are approved.
18. Treat Fibonacci levels as zones with source swing range, timestamp, calculation version, and provisional/confirmed status.
19. Never select Fibonacci swings using future candles; use time-based walk-forward evaluation for any historical performance claim.
20. For online notifications, require auth, persistence, Web Push subscription ownership, deduplication, retry, revoke/opt-out, and audit metadata.
21. Use Vercel AI Gateway through the AI SDK for the planned multi-model path. Do not assume Gateway inference is free.
22. Use `google/gemini-2.5-flash`, `meta/llama-3.1-8b`, and `openai/gpt-4o-mini` as the initial model set after account access and billing verification.
23. Send the same validated context independently to three models. Accept only 2-of-3 or 3-of-3 agreement after the deterministic gate passes; otherwise return `wait`.
24. Record model IDs, provider routes, latency, usage/cost, prompt version, dissenting actions, and consensus outcome.
25. Never describe a model as free from its name alone. Verify current pricing, credits, account access, and provider terms.
26. Use exact `provider/model` IDs from the live catalog. If native structured output is unavailable, parse and validate JSON server-side.

## Default Indicator Parameters

- EMA: 20 and 50
- RSI: 14 with Wilder smoothing; thresholds 30 and 70
- MACD: 12 / 26 / 9
- Volume average: 20 candles

CDC ActionZone:

- Fast EMA: 12
- Slow EMA: 26
- Price smoothing: 1
- StochRSI: RSI 14, stochastic 14, K 3, D 3
- Zones: green, blue, light-blue, red, orange, yellow

Fibonacci:

- Retracement: 0.236, 0.382, 0.5, 0.618, 0.786
- Extension: 1.272 and 1.618 only after swing confirmation
- Use as confluence with EMA, RSI, MACD, volume, and CDC ActionZone

These defaults can be changed only after updating the plan and test fixtures.

Consensus is not proof of correctness. Never label `2-of-3` or `3-of-3` as a guaranteed Buy/Sell decision.

## Default Signal Rules

- Bullish check 1: `close > EMA20`
- Bullish check 2: `EMA20 > EMA50`
- Bullish check 3: `RSI >= 50` and `MACD histogram > 0`
- Bullish check 4: `volume >= volume average`
- Bearish checks are the inverse where meaningful
- Bullish/Bearish requires at least 3 of 4 defined checks
- Otherwise state is Neutral
- Never label these states as Buy or Sell recommendations

## Delivery Order

1. Confirm unresolved choices in `plan/REQUEST-FROM-USER.md`.
2. Read Next.js local documentation before code changes.
3. Create domain types, fixtures, normalization, and indicator tests.
4. Build the dashboard with a provider-neutral chart adapter.
5. Add Binance historical integration through a server boundary.
6. Compare chart libraries, then install the selected library; Lightweight Charts is the default candidate.
7. Add realtime Daily candle integration with reconnect and stale-event handling.
8. Validate local acceptance flow, lint, build, and focused tests.
9. Before AI work, approve the AI and Alert Planning Decisions in `plan/REQUEST-FROM-USER.md` and configure secure AI Gateway credentials.
10. Add AI structured analysis only after deterministic signal and alert tests pass.

## Required Local Environment

```env
MARKET_DATA_PROVIDER=binance
MARKET_DATA_BASE_URL=https://api.binance.com
MARKET_DATA_WS_URL=wss://stream.binance.com:9443/ws
MARKET_DATA_TIMEOUT_MS=10000
MARKET_DATA_CACHE_TTL_SECONDS=15
MARKET_DATA_MAX_CANDLES=1000
NEXT_PUBLIC_DEFAULT_SYMBOL=BTCUSDT
NEXT_PUBLIC_DEFAULT_TIMEFRAME=1d
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Bangkok
NEXT_PUBLIC_ENABLE_REALTIME=true
```

Do not request or commit `BINANCE_API_SECRET` for this analysis-only MVP.

AI environment is not required for the current chart MVP. When Phase 6 is approved, use `AI_GATEWAY_API_KEY` server-side and never `NEXT_PUBLIC_`. Do not claim the model has learned from market data until an evaluation dataset and walk-forward report exist. Gateway usage may incur model inference costs.

## Completion Gate

Do not claim the MVP is complete until:

- historical candles render for all three configured symbols;
- realtime updates do not overwrite data after a symbol switch;
- indicators match known fixtures;
- insufficient, stale, empty, error, and reconnecting states are visible;
- API secrets are absent from the browser bundle;
- `pnpm lint` and `pnpm build` pass;
- the local README documents setup, data source, attribution, and limitations.
- AI output is schema-validated, source-linked, risk-aware, and falls back to `wait`.
- alerts are deduplicated, cooldown-limited, and do not depend solely on AI output.
- Fibonacci calculations are auditable and have no look-ahead leakage.
- online notifications have auth, persistence, subscription ownership, retry, revoke, and audit metadata.
