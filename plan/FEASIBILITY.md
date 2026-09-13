# Feasibility Plan

**Date**: 2026-09-13
**Status**: Approved for handoff; no implementation in this document
**Scope**: AI-assisted analysis, Fibonacci confluence, consensus, and online alerts

## Executive Decision

โครงการทำต่อได้จริง แต่ต้องแยกเป็น 4 ระดับ:

1. **Deterministic analysis**: ทำได้ทันทีและเป็น source of truth
2. **AI context-first analysis**: ทำได้หลังเพิ่ม server route, schema validation และ Gateway credentials
3. **Online alerting**: ทำได้หลังเพิ่ม auth, persistence, scheduler/queue และ Web Push
4. **AI training/fine-tuning**: ยังไม่ควรเริ่มจนกว่าจะมี historical dataset, labels และ walk-forward evaluation

ห้ามรวมทั้ง 4 ระดับเป็นงานเดียว เพราะจะเพิ่ม cost, latency, security risk และ validation complexity พร้อมกัน

## Locked Decisions

- Market: Binance Spot
- Symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`
- Timeframe: Daily (`1d`)
- Provider: Binance public market data
- AI Gateway: Vercel AI Gateway via Vercel AI SDK
- Model set:
  - `google/gemini-2.5-flash`
  - `meta/llama-3.1-8b`
  - `openai/gpt-4o-mini`
- AI actions: `consider-entry`, `consider-exit`, `wait`
- Consensus: 2/3 or 3/3 only after deterministic gate passes
- Notification: in-app + browser notification first
- Fibonacci: confluence tool, never standalone trigger
- Product direction: online

## Feasibility Matrix

| Capability | Feasibility | Main dependency | Decision |
|---|---|---|---|
| AI explanation from indicators | High | AI SDK + Gateway + schema | Build first |
| Three-model consensus | High | Cost budget, timeout, output validation | Build after single-model contract |
| Fibonacci confluence | High | Confirmed swing policy, no look-ahead | Build before AI context |
| In-app alerts | High | Deterministic event engine | Build with alert rules |
| Browser notification while page open | High | Permission and client event handling | First notification mode |
| Browser notification after browser closes | Medium | HTTPS, service worker, Web Push backend, persistence | Online phase |
| Telegram/email/mobile push | Medium | Provider accounts, queues, retry, opt-out | Later phase |
| AI fine-tuning/training | Low for now | Dataset, labels, evaluation, data pipeline | Defer |
| Guaranteed buy/sell correctness | Not acceptable | Impossible to guarantee | Never claim |

## Recommended Delivery Order

### Gate A: Foundation audit

Before AI code:

- Read `AGENTS.md`, installed Next.js docs, `plan/README.md`, `plan/REQUEST-FROM-USER.md`, and `plan/HANDOFF.md`
- Confirm current `pnpm test`, `pnpm lint`, and `pnpm build`
- Verify current source has no uncommitted user changes that would be overwritten
- Confirm Node/pnpm versions and AI SDK compatibility

**Exit**: existing chart MVP remains green and the next AI can explain the current architecture.

### Gate B: Fibonacci domain

Implement and test:

- confirmed swing high/low policy
- retracement levels `0.236`, `0.382`, `0.5`, `0.618`, `0.786`
- extension levels `1.272`, `1.618`
- zone tolerance
- provisional vs confirmed swing
- source candle range, timestamp and calculation version
- no look-ahead test

**Exit**: historical replay never uses candles that were unavailable at the decision timestamp.

### Gate C: Deterministic alert engine

Implement and test:

- CDC green/red transitions
- deterministic Bullish/Bearish state changes
- Fibonacci confluence/rejection events after swing confirmation
- deduplication key: symbol + timeframe + rule + candle timestamp + rule version
- cooldown and quiet hours
- stale/insufficient/unclosed data suppression

**Exit**: the same candle cannot emit the same alert twice, and invalid data emits no actionable alert.

### Gate D: AI single-model contract

Implement server-only route with:

- compact structured context
- exact model ID from catalog
- timeout and token budget
- JSON/schema validation
- source timestamp, risks and invalidation required
- fallback to `wait`
- prompt version, model ID, usage, latency and error metadata

**Exit**: malformed, invented, stale or incomplete AI output never reaches the actionable UI.

### Gate E: Three-model consensus

Implement:

- three independent calls with identical context
- no cross-model answer visibility
- per-model timeout and partial failure handling
- 3/3 high agreement, 2/3 medium agreement, otherwise `wait`
- deterministic gate overrides consensus
- dissenting action/reason displayed
- max cost per run and cooldown

**Exit**: consensus is reproducible, auditable and bounded by cost/latency controls.

### Gate F: Online notification infrastructure

Implement only after auth/persistence decision:

- user identity and alert preferences
- database records for alert rules, event history and delivery history
- Web Push subscription ownership and revoke
- HTTPS/service worker
- background ingestion/scheduler/queue
- idempotency, retry and delivery status
- audit metadata for rule/indicator/Fibonacci/prompt/model versions

**Exit**: alert delivery can happen when the browser tab is closed without leaking secrets or sending to the wrong user.

## AI Context Contract

AI should receive facts like:

- symbol, timeframe and candle timestamp
- closed/live/stale/data-quality status
- latest OHLCV summary and recent candle context
- EMA20/EMA50, RSI14, MACD12/26/9, volume average
- CDC zone/trend/transition
- Fibonacci levels, source swing range, confirmation status and version
- deterministic signal state and passed/failed checks
- risk flags and invalidation conditions

AI should not receive authority to change these facts.

## Consensus Contract

```text
if deterministicGate != passed:
  action = wait
else:
  ask model A, B, C independently
  validate every output
  if 3 valid outputs agree:
    consensus = 3-of-3
  else if 2 valid outputs agree:
    consensus = 2-of-3
  else:
    action = wait
```

A consensus result is decision support, not a trade confirmation.

## Cost and Reliability Controls

- Do not call 3 models on every WebSocket update
- Trigger on closed Daily candle, deterministic transition, or explicit user refresh
- Use cooldown and deduplication
- Set per-model timeout
- Set maximum output tokens
- Set maximum cost per run and daily budget
- Record usage and latency
- Use `wait` fallback on partial failure
- Never retry indefinitely

## Blockers Before Phase 6

- Secure `AI_GATEWAY_API_KEY` provisioned outside chat and source files
- Account access verified for all three model IDs
- Current AI SDK version and Node runtime compatibility verified
- Exact billing/credit limits confirmed
- Fibonacci swing policy approved
- Deterministic alert schema approved
- Online auth/database/scheduler choice approved if background alerts are required

## Handoff Acceptance

The next AI may begin implementation only after reading:

1. `AGENTS.md`
2. `plan/README.md`
3. `plan/REQUEST-FROM-USER.md`
4. `plan/HANDOFF.md`
5. `plan/FEASIBILITY.md`
6. `SKILL/crypto-chart-analyzer/SKILL.md`

The next AI must begin with a read-only audit and a focused test plan. It must not start with AI calls, secret creation, trading functionality, or broad UI refactoring.
