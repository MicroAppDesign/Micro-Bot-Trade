# Micro-Bot Trade - AI Handoff

**Date**: 2026-09-13
**Purpose**: ส่งต่องานให้ AI ตัวถัดไปทำต่อ
**Current instruction**: ยังไม่เริ่ม Phase AI จนกว่า AI ตัวถัดไปจะอ่าน feasibility plan, ตรวจ environment และได้รับอนุมัติให้เริ่ม Phase 6

## Project

Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4

Application: online-capable Binance Spot crypto chart analysis

Current market scope:

- Provider: Binance public market data
- Symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`
- Timeframe: Daily (`1d`)
- Display timezone: `Asia/Bangkok`
- Internal timestamps: UTC
- UI language: English
- Execution: analysis only; never add trading/order execution

## Existing Implementation

Already implemented and verified:

- Candlestick + volume dashboard
- Historical Binance API route: `app/api/market/route.ts`
- Binance Daily WebSocket stream
- Lightweight Charts
- EMA, RSI, MACD, volume average
- CDC ActionZone V3 2020 adaptation with MPL 2.0 attribution
- Fibonacci is planned but not implemented yet
- Unit tests using Vitest
- Fixture fallback when Binance data is unavailable

Relevant files:

- `app/dashboard.tsx`
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/api/market/route.ts`
- `components/market/candlestick-chart.tsx`
- `lib/data/binance.ts`
- `lib/market/types.ts`
- `lib/market/indicators.ts`
- `lib/market/normalize.ts`
- `lib/market/signals.ts`
- `lib/market/cdc-action-zone.ts`
- `lib/market/fixtures.ts`
- `tests/market/indicators.test.ts`
- `tests/market/market.test.ts`

Verified commands before handoff:

- `pnpm test`: 9 tests passed
- `pnpm lint`: passed
- `pnpm build`: passed

## Locked AI/Product Decisions

- Use Vercel AI Gateway through Vercel AI SDK
- Keep `AI_GATEWAY_API_KEY` server-side only
- Do not use direct `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in the main plan
- Use three independent model calls with identical validated context
- Models must not see one another's answers before responding
- Consensus:
  - 3/3 same action: high `consensus-supported`
  - 2/3 same action: medium `consensus-supported`, show dissent
  - 1/3 or invalid output: `wait`
- Deterministic gate always overrides AI:
  - stale data -> `wait`
  - unclosed candle for primary signal -> `wait`
  - insufficient indicators -> `wait`
  - provisional Fibonacci swing -> `wait`
  - deterministic conditions not met -> `wait`
- Allowed AI action vocabulary:
  - `consider-entry`
  - `consider-exit`
  - `wait`
- Never show Buy/Sell guarantee or claim consensus proves correctness
- AI receives structured facts from indicators, CDC ActionZone, Fibonacci and deterministic signals
- Start context-first; do not fine-tune/train until historical evaluation data exists
- Alerts: in-app + browser notification
- Product direction: online; background notification requires auth, database, Web Push/service worker, scheduler/queue and delivery audit

## Model Catalog Findings

Live catalog was checked on 2026-09-13:

- Found: `google/gemini-2.5-flash`
- Found: `meta/llama-3.1-8b`
- Not found: Microsoft Phi-3 Medium 128K Instruct
- Groq Console and Mistral AI Console are candidate providers for the third model
- Selected third model: `openai/gpt-4o-mini`
- Do not assume any model or Gateway usage is free; inspect current pricing, credits and account access
- Do not invent model slugs; use exact `provider/model` IDs from live catalog

## Remaining Work Before Coding AI

1. Confirm all three selected models support the required JSON/schema validation path. If native structured output is unavailable, parse JSON and validate server-side.
2. Define model budget, e.g. `AI_ANALYSIS_MAX_COST_PER_RUN`, based on current pricing and account credits.
3. Add Fibonacci calculation plan/implementation with confirmed swing policy and no look-ahead bias.
4. Define deterministic alert rules, cooldown, deduplication and audit schema.
5. Choose online auth, database, scheduler/queue and Web Push architecture.
6. Read current AI SDK and AI Gateway docs matching installed versions before implementation.
7. Add AI analysis route only after deterministic rules and schema tests exist.
8. Follow the feasibility gates in `plan/FEASIBILITY.md`.

## Proposed Environment

Do not create or populate secrets until approved:

```env
AI_GATEWAY_API_KEY=do-not-commit
AI_ANALYSIS_ENABLED=false
AI_ANALYSIS_MODELS=google/gemini-2.5-flash,meta/llama-3.1-8b,openai/gpt-4o-mini
AI_ANALYSIS_TIMEOUT_MS=15000
AI_ANALYSIS_MAX_OUTPUT_TOKENS=700
AI_ANALYSIS_MAX_COST_PER_RUN=0.05
AI_ANALYSIS_MIN_CONSENSUS=2
ALERTS_ENABLED=true
ALERT_COOLDOWN_SECONDS=3600
NEXT_PUBLIC_ENABLE_BROWSER_NOTIFICATIONS=false
```

Never request secrets through chat. Never use `NEXT_PUBLIC_` for AI keys.

## Guardrails

- Do not implement auto-trading
- Do not add user exchange trading keys
- Do not call AI from client components
- Do not let AI invent market facts
- Do not use future candles to choose Fibonacci pivots
- Do not label 2/3 or 3/3 agreement as a guaranteed trade decision
- Do not add Telegram/email/mobile push before persistence and delivery controls are designed
- Preserve the CDC ActionZone MPL 2.0 attribution

## First Action For Next AI

Read these files first:

1. `AGENTS.md`
2. `plan/README.md`
3. `plan/REQUEST-FROM-USER.md`
4. `SKILL/crypto-chart-analyzer/SKILL.md`
5. `plan/HANDOFF.md`
6. `plan/FEASIBILITY.md`

Then report feasibility blockers and the first focused implementation slice. Do not create secrets, call AI models, or edit source code until the user explicitly approves Phase 6 start.