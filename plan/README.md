# Crypto Chart Analyzer

**Document**: Product and Technical Plan
**Status**: Scope confirmed - implementation preparation
**Created**: 2026-09-13
**Last updated**: 2026-09-13
**Project**: `micro-bot-trade`

## 1. Summary

สร้างเว็บแอพสำหรับวิเคราะห์กราฟคริปโตเพื่อช่วยให้ผู้ใช้ตรวจสอบแนวโน้ม โมเมนตัม ปริมาณการซื้อขาย และสัญญาณจาก technical indicators ได้ในหน้าจอเดียว โดยรองรับ historical data และ realtime data ตั้งแต่ MVP

MVP จะเป็นเครื่องมือวิเคราะห์เท่านั้น ไม่ส่งคำสั่งซื้อขายจริง ไม่รับประกันผลตอบแทน และไม่เริ่มจาก AI ทำนายราคา ใช้ rule-based indicators ที่อธิบายเหตุผลและตรวจสอบย้อนกลับได้

## 2. Current Repository Context

- Framework: Next.js 16 App Router
- Runtime/UI: React 19, TypeScript 5, Tailwind CSS 4
- Current state: create-next-app starter page; ยังไม่มี chart, market API, database, authentication หรือ indicator engine
- Package manager: pnpm
- Development target: local development ก่อน ยังไม่เตรียม production deployment
- Existing entry points:
  - `app/page.tsx` - starter home page
  - `app/layout.tsx` - root layout และ metadata
  - `app/globals.css` - global styles
  - `package.json` - scripts และ dependencies ปัจจุบัน
- Constraint: ต้องอ่านเอกสาร Next.js ที่ติดตั้งใน `node_modules/next/dist/docs/` ก่อนแก้ source code ตามกฎของ repo

## 3. Problem Statement

### User problem

ผู้เทรดต้องเปิดหลายเครื่องมือเพื่อดูกราฟ ราคา indicators และสถานะตลาด ทำให้ใช้เวลารวบรวมข้อมูลมาก และอาจตีความสัญญาณที่มาจากข้อมูลคนละช่วงเวลาไม่ตรงกัน

### Product opportunity

รวมข้อมูลราคา กราฟ indicators และคำอธิบายสัญญาณไว้ใน workflow เดียว พร้อมบอกความสดของข้อมูลและข้อจำกัดของสัญญาณอย่างชัดเจน

### Business/product goal

สร้าง MVP ที่ผู้ใช้สามารถเลือกคู่เหรียญและ timeframe แล้วตรวจสอบข้อมูลตลาดกับเหตุผลของสัญญาณได้ภายในหน้าจอเดียว โดยมี foundation ที่เปลี่ยน market-data provider ได้โดยไม่ต้องรื้อ UI

## 4. Target Users

### Primary user

ผู้เทรดคริปโตระดับเริ่มต้นถึงกลางที่ใช้ technical analysis และต้องการ dashboard ที่อ่านง่าย ตรวจสอบได้ และไม่สร้างคำแนะนำแบบกล่องดำ

### Secondary users

- ผู้พัฒนากลยุทธ์ที่ต้องการตรวจ indicator เบื้องต้น
- ผู้ที่กำลังเรียนรู้การอ่านกราฟและต้องการเห็นเหตุผลประกอบสัญญาณ

### Not a target for MVP

- ผู้ที่ต้องการ high-frequency trading
- ผู้ที่ต้องการส่งคำสั่งซื้อขายอัตโนมัติ
- สถาบันที่ต้องการ market data ระดับ exchange-grade หรือ compliance ครบชุด

## 5. Product Outcomes and Success Metrics

### User outcomes

1. เลือก symbol และ timeframe แล้วเห็น historical candles ได้
2. เปิด/ปิด indicators และเห็นค่าที่คำนวณจากข้อมูลเดียวกับกราฟ
3. อ่าน signal summary พร้อมเหตุผล, timestamp, timeframe และ data status ได้
4. รู้ได้ว่าข้อมูลล่าสุดเมื่อใด และระบบกำลัง connected, stale หรือ reconnecting
5. ใช้งานบน desktop และ mobile ได้โดยไม่เสียข้อมูลสำคัญ

### MVP success criteria

- ผู้ใช้ใหม่สามารถเปิดกราฟ BTC/USDT และเข้าใจสถานะตลาดเบื้องต้นได้โดยไม่ต้องตั้งค่าซับซ้อน
- indicator calculations ให้ผลตรงกับ reference fixtures ที่กำหนด
- เปลี่ยน symbol/timeframe แล้วไม่มีข้อมูลเก่าหรือ realtime event เก่าทับหน้าจอ
- เมื่อ provider ล่ม, timeout หรือข้อมูลไม่พอ ระบบแสดงสถานะที่เข้าใจได้และไม่สร้างสัญญาณปลอม
- ผ่าน `pnpm lint` และ `pnpm build`

### Metrics after release

- Chart load success rate
- Time to first usable chart
- Realtime reconnect rate
- Provider/API error rate
- Percentage of sessions that select an indicator or symbol
- User-reported incorrect/stale signal count

## 6. Scope

### Must Have - MVP

- [ ] Dashboard responsive สำหรับการวิเคราะห์กราฟ
- [ ] Candlestick chart พร้อม volume
- [ ] Symbol selector: เริ่มต้น 1-3 คู่ เช่น BTC/USDT, ETH/USDT
- [x] Timeframe selector: Daily (`1d`) เป็น timeframe หลักของ MVP
- [ ] Historical OHLCV data
- [x] Realtime latest candle/ticker ผ่าน provider adapter
- [ ] EMA, RSI, MACD และ volume average
- [ ] Signal summary แบบ rule-based พร้อมคำอธิบายที่ตรวจสอบได้
- [ ] Loading, empty, error, stale, connected และ reconnecting states
- [ ] ตรวจ duplicate, missing, out-of-order และ insufficient candles
- [ ] API/server boundary สำหรับซ่อน provider credentials
- [ ] Unit tests สำหรับ normalization และ indicator calculations
- [ ] Risk disclaimer และ provider attribution

### Should Have - MVP ถ้าไม่กระทบกำหนดส่ง

- [ ] Watchlist เก็บใน local storage
- [ ] Saved indicator presets เก็บใน local storage
- [ ] Chart crosshair และ tooltip
- [ ] Table summary สำหรับ accessibility และ fallback
- [ ] Data freshness และ last updated timestamp
- [ ] Basic client error boundary

### Could Have - หลัง MVP

- Paper trading
- Price/indicator alerts
- User accounts และ cloud sync
- Multi-exchange comparison
- Backtesting UI
- AI ช่วยวิเคราะห์ entry/exit context โดยต้องแยกจาก source-of-truth calculations
- AI chat สำหรับถามข้อมูลของกราฟที่กำลังดู
- Telegram/email/push notifications

### Won't Have ใน MVP

- ส่งคำสั่งซื้อขายจริง
- เชื่อม API key ของผู้ใช้เพื่อ trade
- Auto-trading หรือ bot execution
- การรับประกันกำไร/อัตราชนะ
- AI ทำนายราคาเป็นแกนหลัก
- Social feed หรือ copy trading
- ระบบ portfolio และ tax reporting

## 7. Confirmed Decisions

- Provider: Binance public market-data API
- ตลาดเริ่มต้น: Binance Spot
- Symbols: BTC, ETH และ SOL โดย adapter ต้องแปลงเป็น Binance symbols เช่น `BTCUSDT`, `ETHUSDT`, `SOLUSDT`
- Timeframe หลัก: Daily (`1d`)
- จุดประสงค์: วิเคราะห์เท่านั้น
- ข้อมูล: historical + realtime พร้อมกัน
- Environment แรก: local development
- UI language: English
- Display timezone: `Asia/Bangkok`; เก็บ timestamp ภายในเป็น UTC
- Signal vocabulary: `Bullish`, `Bearish`, `Neutral`
- วิธีวิเคราะห์: rule-based indicators
- สถาปัตยกรรมต้องเริ่มจาก fixture/mock provider ก่อนต่อ provider จริง
- indicator หลักต้องคำนวณจากข้อมูลแท่งปิด; แท่งที่กำลังก่อตัวต้องแสดงสถานะแยกต่างหาก
- ยังไม่ทำ authentication หรือ database ใน MVP
- watchlist และ presets เริ่มจาก local persistence
- signal ทุกตัวต้องระบุ source values, timestamp, timeframe และ explanation
- CDC ActionZone V3 2020 เป็น indicator เพิ่มเติม โดยคง attribution/license MPL 2.0 จาก source ที่ผู้ใช้ให้มา
- CDC ActionZone default: Fast EMA 12, Slow EMA 26, smoothing 1 และ StochRSI 14/14/3/3
- [x] CDC ActionZone: six zones, trend state, first green/red transition และ StochRSI momentum state
- AI ต้องรับเฉพาะ normalized market facts, indicator snapshots และ deterministic signals; ห้ามให้ AI คำนวณ OHLCV หรือสร้างข้อมูลตลาดเอง
- AI output ต้องเป็น structured result ที่มี action, reasons, risks, invalidation condition และ data timestamp
- Alert trigger ต้องเป็น deterministic rule; AI มีหน้าที่อธิบายและจัดลำดับความสำคัญ ไม่ใช่เป็น trigger เดียว
- ช่องทางแจ้งเตือนระยะแรก: in-app และ browser notification ขณะเปิดเว็บ; background notifications ต้องทำหลังมี persistence/server scheduler
- Product direction: online application; local development เป็นสภาพแวดล้อมพัฒนาเท่านั้น
- Fibonacci เป็น confluence tool สำหรับหา retracement/extension zones ไม่ใช่ trigger เดี่ยว

## 8. Decisions Required Before Coding

ต้องตอบหรืออนุมัติรายการต่อไปนี้ก่อนเริ่มแก้ไข source code:

1. **Chart library evaluation**: เปรียบเทียบตัวเลือกก่อนติดตั้ง โดยใช้ Lightweight Charts เป็นตัวเลือกเริ่มต้น
2. **Indicator parameters**: ยืนยันค่า default ของ EMA, RSI, MACD และ volume average
3. **Signal threshold**: ยืนยันว่าต้องผ่านกี่เงื่อนไขจึงเป็น Bullish/Bearish
4. **Daily candle semantics**: ใช้ Binance UTC daily close เป็น source of truth และแสดงเวลาใน Bangkok หรือไม่
5. **Data attribution**: ยอมรับการแสดง Binance เป็นแหล่งข้อมูลในหน้าเว็บหรือไม่
6. **Local environment**: ต้องการใช้ public Binance API โดยไม่ใช้ API key หรือมี proxy/API key ของตนเอง

### Confirmed values

- Spot market ผ่าน Binance public API
- Symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`
- Timeframe: `1d`
- เก็บ timestamp เป็น UTC และแสดง `Asia/Bangkok`
- Signal state: `Bullish`, `Bearish`, `Neutral`
- Historical และ realtime ทำพร้อมกันใน MVP
- Realtime scope: live Daily candle อย่างเดียว ไม่รวม ticker
- Chart library decision: เปรียบเทียบตัวเลือกก่อนติดตั้ง โดยใช้ Lightweight Charts เป็นตัวเลือกเริ่มต้น
- UI ภาษาอังกฤษ
- รัน local ก่อน

### Recommended defaults for unresolved items

- Realtime: live daily candle อย่างเดียว
- EMA: 20 และ 50
- RSI: 14, Wilder smoothing, thresholds 30/70
- MACD: 12/26/9
- Volume average: 20 candles
- Overall state: ต้องเข้าเงื่อนไขอย่างน้อย 3 จาก 4 checks ที่กำหนดใน Section 10
- Chart library: Lightweight Charts หรือ library ที่มี candlestick/volume/realtime support และ license เหมาะสม
- ไม่ใช้ Binance API key สำหรับ public market data

## 9. User Flows

### Flow A: First visit

1. เปิดหน้า dashboard
2. เห็น symbol/timeframe ค่าเริ่มต้น
3. เห็น chart, volume, market stats และสถานะข้อมูล
4. เห็นคำเตือนว่าเป็นเครื่องมือวิเคราะห์ ไม่ใช่คำแนะนำการลงทุน

### Flow B: Change symbol/timeframe

1. ผู้ใช้เลือก symbol หรือ timeframe
2. ระบบยกเลิก request/subscription เดิม
3. ระบบแสดง loading state
4. โหลด historical candles ชุดใหม่
5. คำนวณ indicators ใหม่
6. subscribe realtime ชุดใหม่
7. แสดง last updated และ connection status ที่ตรงกับชุดข้อมูลใหม่

### Flow C: Inspect a signal

1. ผู้ใช้เปิด indicator ที่ต้องการ
2. ระบบแสดงค่าปัจจุบันและสถานะ warm-up/insufficient data ถ้ามี
3. Signal panel สรุป trend, momentum และ volume
4. ผู้ใช้เปิดรายละเอียดเพื่อดู input values, timestamp, timeframe และ rule ที่ทำให้เกิด signal

### Flow D: Provider failure

1. API หรือ WebSocket ล้มเหลว
2. ระบบแสดง error/reconnecting state
3. ข้อมูลเดิมถูกติดป้าย stale และไม่ถูกนำเสนอว่าเป็น live
4. ระบบ retry ตาม policy ที่กำหนด
5. เมื่อกลับมาเชื่อมต่อ ให้ตรวจ timestamp และ deduplicate ก่อน update UI

## 10. Functional Requirements

### Chart and market data

- รับ normalized OHLCV candles ที่เรียงตามเวลาและไม่ซ้ำกัน
- แสดง open, high, low, close, volume
- แสดงข้อมูลล่าสุดและอายุของข้อมูล
- เปลี่ยน symbol/timeframe ได้โดยไม่เกิด race condition
- แสดง empty state เมื่อไม่มีข้อมูล
- แสดง insufficient-data state เมื่อข้อมูลน้อยกว่าค่า warm-up ของ indicator

### Indicators

รุ่นแรก:

- EMA: กำหนด period ได้อย่างน้อย 20 และ 50
- RSI: period 14 และ overbought/oversold threshold ที่ระบุชัด
- MACD: fast, slow และ signal periods ที่ระบุชัด
- Volume average: period ที่ระบุชัด

ข้อกำหนดร่วม:

- คำนวณแบบ deterministic
- ไม่ใช้แท่งที่ยังไม่ปิดเป็น signal หลัก
- ระบุ warm-up period
- ระบุ input values และ calculation timestamp
- มี test fixture ที่ตรวจค่าขอบเขตและกรณีข้อมูลไม่ครบ

### Signal rules

Signal engine ต้องแยกจาก UI และต้องเป็นกฎที่อ่านได้ เช่น:

- Trend: ราคาปิดเทียบกับ EMA และความสัมพันธ์ EMA ระยะสั้น/ยาว
- Momentum: RSI และ MACD histogram/crossover
- Volume: ปริมาณเทียบกับ volume average
- Overall state: รวมผลเป็น Bullish, Bearish หรือ Neutral ตาม rule set ที่ระบุ

### Initial deterministic checks

Bullish checks:

1. `close > EMA20`
2. `EMA20 > EMA50`
3. `RSI >= 50` และ `MACD histogram > 0`
4. `volume >= volume average`

Bearish checks ใช้ทิศทางตรงข้ามในข้อที่กลับด้านได้ ส่วนข้อที่ไม่ครบเงื่อนไขให้ถือว่าไม่ผ่าน

- Bullish: ผ่านอย่างน้อย 3 จาก 4 checks
- Bearish: ผ่านอย่างน้อย 3 จาก 4 checks
- Neutral: ไม่เข้าเกณฑ์ Bullish หรือ Bearish
- ใช้เฉพาะ Daily candle ที่ปิดแล้วเป็น signal หลัก

ห้ามเรียกผลลัพธ์ว่า “คำแนะนำซื้อ/ขาย” และห้ามแสดง confidence เป็นตัวเลขที่ดูเหมือนความน่าจะเป็น หากไม่มีวิธี calibrate ที่ชัดเจน

## 11. Technical Architecture

### Layering

```text
UI components
  -> application state / orchestration
    -> domain services: normalization, indicators, signal rules
      -> data provider interface
        -> fixture provider | historical provider | realtime provider
```

### Proposed directories

- `app/page.tsx` - dashboard composition
- `app/layout.tsx` - metadata, language และ root shell
- `app/globals.css` - design tokens และ responsive styles
- `components/market/` - chart, controls, stats, indicator panel, signal panel, status
- `lib/market/` - domain types, normalization, indicators, signal rules
- `lib/data/` - provider interfaces, fixtures, historical adapter, realtime adapter
- `lib/validation/` - query/schema validation
- `app/api/market/` - server-side routes สำหรับ market data
- `tests/` - unit, integration และ mock stream tests

### Server/client boundary

- Server: provider credentials, historical fetch, validation, caching และ error translation
- Client: chart interaction, symbol/timeframe selection, indicator visibility, local persistence และ realtime subscription state
- ห้ามนำ secret หรือ provider private key เข้า client bundle

### Data contract

```ts
type Candle = {
  time: number;       // UTC epoch milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
};

type MarketQuery = {
  symbol: string;
  timeframe: string;
  limit?: number;
};

type AnalysisResult = {
  state: "bullish" | "bearish" | "neutral";
  timestamp: number;
  timeframe: string;
  inputs: Record<string, number | null>;
  reasons: string[];
  isBasedOnClosedCandle: boolean;
};
```

ชนิดข้อมูลนี้เป็นแนวทางสำหรับ implementation ภายหลัง ยังไม่ใช่คำสั่งให้แก้ไฟล์ในรอบนี้

## 12. Data Provider Requirements

### Historical provider

- รับ symbol, timeframe และ limit ที่ผ่าน validation
- normalize response ให้เป็น `Candle[]`
- ตรวจ timestamp, gap, duplicate, ordering และ numeric values
- จัดการ timeout, rate limit, provider error และ missing credentials
- ระบุ source และ fetched-at timestamp
- cache ตาม symbol/timeframe/limit ตาม policy ที่กำหนด

### Realtime provider

- connect/disconnect
- subscribe/unsubscribe ตาม symbol/timeframe
- heartbeat และ reconnect with backoff
- ignore stale sequence/timestamp
- update current candle และ emit candle-closed event
- clean up เมื่อ component unmount หรือ query เปลี่ยน

### Data quality policy

- ห้าม interpolate ข้อมูลที่หายโดยไม่ติดป้าย
- ห้ามใช้ candle ที่ timestamp อนาคต
- duplicate ต้องถูก deduplicate ตาม timestamp
- out-of-order ต้อง sort และตรวจผลกระทบ
- gap ที่มีผลต่อ indicator ต้องแสดง warning

## 13. Security, Reliability, and Compliance

- API keys อยู่ใน server environment variables เท่านั้น
- validate และ whitelist symbol/timeframe/limit ทุก request
- rate limit ฝั่ง application ตามความเหมาะสม
- ไม่ log secrets หรือข้อมูล credential
- ใช้ safe error messages ที่ไม่เปิดเผย provider internals
- แยก live, stale และ simulated data อย่างชัดเจน
- แสดง risk disclaimer และ data-source attribution
- ไม่เก็บหรือส่งคำสั่งซื้อขายใน MVP
- หากเพิ่มบัญชีผู้ใช้ภายหลัง ต้องกำหนด retention และ privacy policy ก่อน

## 13A. AI Analysis and Decision Support Plan

### เป้าหมาย

ช่วยผู้ใช้ตอบคำถามว่า “ตอนนี้ควรเฝ้าดูจุดเข้า/จุดออกหรือยัง” โดยอธิบายจากข้อมูลที่ระบบคำนวณได้ ไม่ใช่ให้โมเดลทำนายราคาแบบกล่องดำ

### AI responsibilities

- สรุป market context จาก OHLCV, EMA, RSI, MACD, volume และ CDC ActionZone
- ประเมินสถานะเป็นหนึ่งใน:
  - `consider-entry`: มีเงื่อนไขสนับสนุนการพิจารณาเข้า แต่ไม่ใช่คำสั่งซื้อ
  - `consider-exit`: มีเงื่อนไขสนับสนุนการพิจารณาลด/ออกจากสถานะ แต่ไม่ใช่คำสั่งขาย
  - `wait`: ข้อมูลขัดแย้ง, ไม่ครบ, stale หรือยังไม่มี edge ที่ชัดเจน
- ระบุ supporting factors และ contradicting factors
- ระบุ invalidation condition เช่น “สถานะจะเปลี่ยนเมื่อ daily candle ปิดต่ำกว่า EMA20”
- แสดง timestamp, symbol, timeframe และ candle state ที่ใช้วิเคราะห์
- วิเคราะห์แบบ multi-model consensus โดยส่ง context ชุดเดียวกันให้ 3 โมเดลแยกกัน
- สรุปผลเป็น `consensus-supported` เมื่ออย่างน้อย 2 จาก 3 โมเดลให้ action เดียวกัน และ deterministic gate ผ่าน

### AI non-responsibilities

- ห้ามสร้างราคา, volume, indicator value หรือข่าวที่ไม่มีใน input
- ห้ามใช้ live/unclosed candle เป็นหลักโดยไม่ติดป้าย
- ห้ามส่งคำสั่งซื้อขายหรือถือครอง API trading credentials
- ห้ามแสดงผลตอบแทนที่รับประกันหรือ confidence ที่สื่อว่าเป็น probability หากยังไม่ได้ calibrate
- ห้าม override deterministic risk/data-quality rules
- consensus ไม่ใช่หลักฐานว่าราคา/ทิศทางถูกต้อง และห้ามใช้คำว่า “ยืนยันซื้อ/ขาย” ใน UI

### AI learning strategy

AI ในระยะแรกไม่ควร “เรียนรู้สดจากราคา” หรือปรับกฎเองทุกครั้งที่มีแท่งใหม่ เพราะจะตรวจสอบไม่ได้และเสี่ยงเกิด data leakage โดยแบ่งเป็น 3 ระยะ:

1. **Context-first**: ส่ง structured facts จาก indicators, CDC ActionZone, Fibonacci levels, trend state และ data quality ให้ model อธิบาย
2. **Evaluation dataset**: เก็บ historical snapshots ที่มี timestamp, inputs, signal และผลลัพธ์หลังจาก horizon ที่กำหนด เช่น 1/3/7 Daily candles เพื่อวัด precision, recall, false alert และ calibration
3. **Supervised/retrieval refinement**: เมื่อมีข้อมูลเพียงพอ ค่อยปรับ prompt/rules หรือ train classifier แยกจาก LLM โดยใช้ walk-forward validation และห้ามใช้ข้อมูลอนาคตใน feature

AI ไม่ควรถูกเรียกว่า “เรียนรู้” เพียงเพราะส่งกราฟให้ดู ต้องมี dataset version, label definition, train/validation/test split, baseline และ evaluation report

### Multi-model consensus policy

- โมเดลทั้ง 3 ตัวต้องรับ input facts, indicator snapshot, CDC ActionZone, Fibonacci context และ prompt version เดียวกัน
- โมเดลต้องไม่เห็นคำตอบของโมเดลอื่นก่อนตอบ เพื่อป้องกันการโหวตตามกัน
- ทุกโมเดลต้องตอบ schema เดียวกัน: action, reasons, risks, invalidation และ source metadata
- ถ้า 3/3 เห็นตรงกัน: `consensus-supported` ระดับสูง แต่ยังเป็น analysis ไม่ใช่คำสั่ง
- ถ้า 2/3 เห็นตรงกัน: `consensus-supported` ระดับกลาง และต้องแสดง dissenting view
- ถ้า 1/3 หรือ output validation ไม่ครบ: `wait`
- ถ้า deterministic gate ไม่ผ่าน, data stale, candle ยังไม่ปิด หรือ Fibonacci swing ยัง provisional: บังคับ `wait` ไม่ว่าโมเดลจะโหวตอย่างไร
- การเรียก 3 โมเดลมีต้นทุนและ latency ประมาณหลายเท่าของ single call จึงต้องมี trigger, cooldown, timeout และ budget limit

### Why AI Gateway instead of direct provider keys

- รวมการเรียกหลาย provider/model ภายใต้ authentication และ interface เดียว
- เปลี่ยนหรือ fallback model ได้โดยไม่ผูก application กับ SDK ของ provider รายเดียว
- รองรับ model routing, provider preference, usage/spend observability และ budget controls ตาม capability ที่เปิดใช้
- ลดจำนวน secret ในแอพหลัก: ใช้ `AI_GATEWAY_API_KEY` ฝั่ง server แทนการกระจาย `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`
- Direct provider key ไม่ได้ผิดทางเทคนิค แต่จะทำให้ต้องดูแล provider SDK, billing, rate limit, logs และ fallback แยกกัน
- Gateway ไม่ได้ทำให้ inference ฟรี และไม่ได้ทำให้โมเดลมีความเป็นกลางหรือถูกต้องขึ้นโดยอัตโนมัติ

### Live catalog check: 2026-09-13

- Found: `google/gemini-2.5-flash` — Google Gemini 2.5 Flash; catalog มี pricing metadata และไม่ได้รับรองว่า free
- Found: `meta/llama-3.1-8b` — Meta Llama 3.1 8B Instruct; catalog มี pricing metadata และไม่ได้รับรองว่า free
- Not found: Microsoft Phi-3 Medium 128K Instruct / Phi-3 Medium 128K ใน catalog response ที่ตรวจ
- Selected third model: `openai/gpt-4o-mini` — exact ID found in live catalog; fast tag, 128K context, pricing metadata, and provider diversity from Google/Meta
- Groq Console และ Mistral AI Console remain fallback candidates, not the primary third model
- Catalog did not explicitly confirm native structured output for this model; server-side schema validation remains mandatory
- ต้องใช้ exact `provider/model` IDs จาก catalog ณ เวลาติดตั้ง ห้ามเดา model slug

## 13D. Fibonacci and Confluence Plan

### Fibonacci inputs

- Swing high และ swing low ของช่วงที่วิเคราะห์
- Trend direction และ pivot selection method ที่บันทึกได้
- Levels: `0`, `0.236`, `0.382`, `0.5`, `0.618`, `0.786`, `1`
- Extension levels: `1.272`, `1.618` เฉพาะเมื่อมี swing ที่ยืนยันแล้ว
- แยก retracement, extension และ projected target อย่างชัดเจน

### Fibonacci rules

- ห้ามเลือก swing high/low ด้วยข้อมูลอนาคตที่ยังไม่เกิดในเวลานั้น
- ระดับ Fibonacci ต้องมี source candle range และ timestamp
- ระดับเป็น zone ที่มี tolerance ไม่ใช่ราคาจุดเดียว
- ถ้า swing ยังไม่ยืนยัน ให้สถานะ `provisional` และห้ามใช้เป็น alert หลัก
- เปลี่ยน swing ต้องสร้าง calculation version ใหม่เพื่อ audit ได้

### Confluence scoring

Fibonacci ใช้ร่วมกับ:

- CDC ActionZone zone/trend
- EMA20/EMA50
- RSI/MACD momentum
- Volume confirmation
- Support/resistance และ volatility context

ผลลัพธ์ควรเป็น `confluence summary` เช่น `strong`, `mixed`, `weak` พร้อมรายการเหตุผล ไม่ใช่คะแนนที่แปลว่าโอกาสชนะ เว้นแต่มี calibration จาก backtest ที่ชัดเจน

### Fibonacci entry/exit interpretation

- `consider-entry`: ราคาอยู่ใกล้ retracement zone ที่สนับสนุน trend, ActionZone ไม่ขัดแย้ง และมี candle close confirmation
- `consider-exit`: ราคาเข้า extension/target zone หรือเกิด rejection/reversal พร้อม signal ที่ยืนยัน
- `wait`: levels ขัดแย้ง, swing provisional, data stale, หรือไม่มี confirmation
- AI มีหน้าที่อธิบาย confluence และความเสี่ยง; deterministic engine เป็นผู้คำนวณ levels/conditions

## 13E. Online Architecture and Notifications

เพื่อให้ระบบทำงาน online และแจ้งเตือนได้แม้ปิด browser ต้องเพิ่ม:

- Hosted web app และ HTTPS
- Authentication/user identity ก่อนเก็บ alert preferences
- Persistent database สำหรับ watchlist, alert rules, delivery history และ audit records
- Server-side market ingestion หรือ scheduler ที่ทำงานแม้ browser ปิด
- Queue/retry/idempotency สำหรับแจ้งเตือน
- Web Push subscription และ service worker สำหรับ browser notification
- Notification provider ภายนอกในภายหลัง เช่น email/Telegram/mobile push
- Secrets manager สำหรับ Binance/AI/notification credentials

### Online alert flow

```text
Binance stream/cron
  -> candle close
    -> normalize + indicators + CDC + Fibonacci
      -> deterministic alert rules
        -> deduplicate/cooldown
          -> optional AI explanation
            -> persist event
              -> web push/in-app delivery
```

Browser notification อย่างเดียวจะทำงานครบเมื่อมี service worker, permission และ push subscription; การเปิดหน้าเว็บค้างไว้เป็นเพียงโหมดแรกและไม่ใช่ background notification ที่รับประกันได้

### Online security requirements

- AI key, push private key และ provider secrets อยู่ server เท่านั้น
- user ต้อง opt-in และถอน permission ได้
- alert payload ไม่ควรมี secret หรือข้อมูลเกินจำเป็น
- audit log ต้องระบุ rule version, indicator version, Fibonacci calculation version, model/prompt version และ delivery result

### Proposed AI request flow

```text
Binance historical/realtime data
  -> normalize + data-quality checks
    -> indicators + CDC ActionZone
      -> deterministic signal/alert rules
        -> compact analysis context
          -> AI structured output
            -> validation + safety filter
              -> UI explanation / alert message
```

### Structured output contract

```ts
type AiAnalysis = {
  action: "consider-entry" | "consider-exit" | "wait";
  summary: string;
  reasons: string[];
  risks: string[];
  invalidation: string;
  source: {
    symbol: string;
    timeframe: "1d";
    candleTime: number;
    isClosedCandle: boolean;
    dataStatus: "live" | "stale" | "simulated";
  };
  consensus: {
    agreement: "3-of-3" | "2-of-3" | "none";
    participatingModels: string[];
    dissentingActions: string[];
    deterministicGatePassed: boolean;
  };
};
```

ใช้ schema validation ฝั่ง server ก่อนส่งผลให้ client และ reject output ที่ไม่มี source timestamp, risk หรือ invalidation

### AI integration recommendation

- ใช้ Vercel AI SDK ผ่าน server route เท่านั้น
- ใช้ Vercel AI Gateway หรือ provider-neutral model routing แทน direct provider SDK
- เลือก 3 model หลังตรวจ live model catalog, context window, structured output support, cost, latency และ data-retention policy
- หาก provider ไม่รองรับ native structured output ต้องใช้ JSON output + server-side schema validation และ fallback `wait`
- local development ใช้ `AI_GATEWAY_API_KEY` หรือ credential mechanism ที่กำหนดโดย AI Gateway
- ห้ามใช้ `NEXT_PUBLIC_` กับ AI key
- จำกัด input context ให้เป็น latest snapshot + recent candle summary ไม่ส่งข้อมูลเกินความจำเป็น
- บันทึก model id, provider route, latency, token usage และ consensus result ต่อการวิเคราะห์
- ตั้ง timeout, token budget, retry policy และ fallback เป็น `wait`

### AI safety and product language

- ใช้คำว่า “analysis”, “consider”, “watch”, “risk” ไม่ใช้ “guaranteed”, “sure win” หรือ “must buy/sell”
- ทุกผลต้องมี disclaimer ว่าไม่ใช่คำแนะนำการลงทุน
- ถ้า data stale, gap มีผล, indicator warm-up ไม่ครบ หรือ AI validation ไม่ผ่าน ให้แสดง `wait`
- เก็บ prompt version, model id, input timestamp และ output validation result เพื่อ audit ภายหลัง

## 13B. Alert System Plan

### Trigger types

- CDC ActionZone เปลี่ยนเป็น green/red
- CDC buy/sell transition
- Overall deterministic state เปลี่ยนเป็น Bullish/Bearish/Neutral
- RSI เข้า/ออก threshold 30/70
- EMA20/EMA50 crossover
- Volume สูงกว่าค่าเฉลี่ยตาม threshold ที่กำหนด
- AI analysis เปลี่ยน action โดยต้องมี deterministic trigger ประกอบ

### Alert lifecycle

1. รับ candle update
2. normalize และตรวจ data quality
3. คำนวณ indicator/signal
4. ตรวจ rule และ deduplicate ตาม symbol/timeframe/rule/candle timestamp
5. ขอ AI explanation เฉพาะเมื่อ trigger ผ่านและข้อมูลเป็น closed candle
6. validate AI output
7. แสดง in-app alert และ browser notification ถ้าผู้ใช้อนุญาต
8. บันทึก alert history ใน local persistence ระยะแรก

### MVP notification limitations

- Browser notification ทำงานได้เมื่อผู้ใช้อนุญาตและหน้าเว็บ/แท็บยังทำงาน
- local-only app ไม่สามารถรับประกัน background alert เมื่อปิด browser
- Telegram, email, mobile push และ scheduled server alerts ต้องใช้ account/persistence/backend ใน phase ถัดไป
- ต้องมี cooldown, deduplication และ quiet hours เพื่อป้องกัน notification spam

## 13C. AI and Alert Environment Preparation

เพิ่มภายหลังเมื่อเริ่ม Phase AI เท่านั้น:

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

ห้ามใส่ `AI_GATEWAY_API_KEY` ใน client bundle และห้ามส่ง secret ผ่าน chat

## 14. Implementation Phases

### Phase 0: Scope lock

**Output**: decisions ใน Section 8 และ `plan/REQUEST-FROM-USER.md` ได้รับการอนุมัติ, acceptance criteria พร้อม, provider และ chart library มีเหตุผลรองรับ

**ไม่เริ่ม phase ถัดไปจนกว่า**: realtime scope, indicator defaults, signal rules, daily candle semantics, chart library และ attribution จะชัดเจน

### Phase 1: Domain foundation

- สร้าง types และ validation rules
- สร้าง fixture candles
- สร้าง candle normalization
- สร้าง deterministic indicator functions
- เขียน tests ของ EMA, RSI, MACD และ volume average

**Exit criteria**: tests ของ domain ผ่าน และผลตรงกับ reference fixtures

### Phase 2: Dashboard UI

- เปลี่ยน starter page เป็น dashboard
- สร้าง chart adapter
- สร้าง selector, indicator controls, stats, signal panel และ status states
- ทำ responsive/accessibility baseline

**Exit criteria**: ผู้ใช้เลือก fixture symbol/timeframe และเห็น workflow หลักครบโดยไม่ใช้ network จริง

### Phase 3: Historical integration

- เพิ่ม provider adapter
- เพิ่ม server API boundary
- เพิ่ม env/config validation
- เพิ่ม cache และ provider error mapping
- ต่อ dashboard เข้ากับ historical data

**Exit criteria**: โหลด historical data จริงได้ และกรณี error/empty/stale ทำงานครบ

### Phase 4: Realtime integration

- เพิ่ม WebSocket/stream adapter
- จัดการ reconnect, heartbeat และ subscription lifecycle
- merge live candle กับ historical series
- finalize candle และ recompute signals อย่างถูกต้อง

**Exit criteria**: mock stream tests ผ่าน และ live updates ไม่ถูก event เก่าทับ

### Phase 5: Release hardening

- เพิ่ม observability ขั้นพื้นฐาน
- ตรวจ performance และ bundle size
- ตรวจ mobile/desktop และ keyboard accessibility
- อัปเดต README และ deployment configuration
- ทำ end-to-end acceptance test

**Exit criteria**: lint, build, tests และ acceptance flow ผ่าน พร้อม documented known limitations

### Phase 6: AI analysis

- เพิ่ม server-only AI route
- สร้าง compact analysis context จาก deterministic facts
- เพิ่ม structured schema validation และ fallback `wait`
- เพิ่ม prompt versioning และ model/config observability
- แสดง AI explanation แยกจาก deterministic signal panel
- เพิ่ม Fibonacci confluence context และ AI action contract
- สร้าง historical evaluation dataset และ baseline report ก่อนเรียกผลว่า AI มีประสิทธิภาพ

**Exit criteria**: AI ไม่สามารถสร้าง facts ที่ไม่มีใน input, output ทุกตัวผ่าน schema, stale/unclosed/insufficient data ถูก downgrade เป็น `wait`, และมี test fixtures สำหรับ contradictory signals

### Phase 7: Alerting

- สร้าง deterministic alert rules
- เพิ่ม cooldown/deduplication/quiet hours
- เพิ่ม in-app history และ browser notification permission flow
- เพิ่ม AI explanation เฉพาะ triggered alert ที่ผ่าน validation
- เพิ่ม Fibonacci zone/rejection/confluence triggers หลัง swing confirmation

**Exit criteria**: alert เดียวไม่ยิงซ้ำใน candle เดียว, symbol switch ไม่ทำให้ event เก่าถูกแจ้งเตือน, และ browser permission/error state อ่านได้ชัด

### Phase 8: External notifications

- เปลี่ยนระบบจาก local เป็น online พร้อม account/persistence
- เพิ่ม Telegram/email/push provider
- เพิ่ม background scheduler/queue
- เพิ่ม delivery status, retry และ opt-out

**Exit criteria**: delivery มี idempotency, audit trail และไม่เปิดเผย AI/provider secrets

## 15. Testing Strategy

### Unit tests

- Candle normalization
- Numeric validation
- Duplicate and out-of-order handling
- EMA/RSI/MACD/volume calculations
- Warm-up and insufficient-data behavior
- Signal rule combinations
- CDC ActionZone zones, transitions และ StochRSI momentum

### Integration tests

- Historical provider success/error/timeout/rate-limit
- Query validation
- Cache behavior
- Historical + live candle merge

### Realtime tests

- Connect/disconnect
- Reconnect with backoff
- Symbol/timeframe switch
- Stale event ignored
- Duplicate event ignored
- Candle close finalization
- Alert deduplication, cooldown และ permission states
- Fibonacci swing/level calculation, provisional state และ confluence cases

### AI tests

- Structured output schema rejects missing source, risks หรือ invalidation
- Contradictory indicator context returns `wait`
- Stale/unclosed/simulated data cannot produce actionable AI result
- AI output never invents prices or indicators absent from context
- Prompt/model timeout falls back safely to deterministic result plus warning
- Prompt version and model id are attached to audit metadata
- No look-ahead leakage in Fibonacci swing selection or AI evaluation dataset
- Walk-forward evaluation separates train, validation and test periods
- AI baseline is compared with deterministic baseline before release

### Browser acceptance tests

- เปิด dashboard
- เลือก symbol/timeframe
- เปิด/ปิด indicators
- ตรวจ signal explanation
- ตรวจ loading/error/reconnect states
- ตรวจ mobile layout และ keyboard focus

## 16. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Provider rate limit หรือ downtime | กราฟไม่โหลด/ข้อมูล stale | adapter, cache, retry, status และ fallback fixture |
| Indicator implementation ต่างจาก reference | สัญญาณผิด | known fixtures, independent reference checks และ closed-candle policy |
| Realtime race condition | ข้อมูลเก่าทับข้อมูลใหม่ | request identity, unsubscribe, sequence/timestamp checks |
| Missing candles | indicator เพี้ยน | detect gap, warning และไม่ interpolate เงียบ ๆ |
| ผู้ใช้ตีความ signal เป็นคำสั่งซื้อขาย | ความเสี่ยงด้านผลิตภัณฑ์ | ใช้ analysis vocabulary, explanation และ disclaimer |
| Chart library ผูกกับ UI มากเกินไป | เปลี่ยน library ยาก | component adapter และ domain data model กลาง |
| Scope โตเร็วเกินไป | ล่าช้าและทดสอบไม่ทั่วถึง | freeze MVP และเลื่อน auth, AI, trading ออกไป |
| Data licensing/attribution ไม่ชัด | ใช้งานจริงไม่ได้ | ตรวจ provider terms ก่อน integration และบันทึก attribution |
| AI hallucination หรือ advice เกินข้อมูล | ผู้ใช้ตัดสินใจผิด | ส่งเฉพาะ structured facts, schema validation, fallback wait และแสดง source |
| AI latency/cost สูง | UX ช้าและค่าใช้จ่ายบาน | trigger เฉพาะ event สำคัญ, compact context, timeout, token budget และ cooldown |
| Notification spam | ผู้ใช้ปิดการแจ้งเตือน | deduplication, cooldown, quiet hours และ per-rule controls |
| Local app แจ้งเตือนไม่ได้เมื่อปิด | พลาด event | ระบุ limitation ชัด และเลื่อน background scheduler ไป phase external notifications |
| Model/provider เปลี่ยน output | ผลไม่สม่ำเสมอ | structured schema, prompt versioning, model pinning และ regression fixtures |
| Fibonacci swing selection มองอนาคต | backtest หลอกว่าดี | confirm pivot only with available past data และ walk-forward test |
| AI overfits historical market regime | ใช้จริงแล้วสัญญาณเสื่อม | แยก train/validation/test ตามเวลา, regime analysis และ monitor drift |
| Online push/privacy ขาดการควบคุม | แจ้งเตือนผิดคน/ข้อมูลรั่ว | auth, subscription ownership, opt-in, revoke, encryption และ audit log |

## 17. Definition of Done

ฟีเจอร์ MVP จะถือว่าเสร็จเมื่อ:

- [ ] ผู้ใช้เปิดกราฟคู่เหรียญเริ่มต้นได้
- [ ] historical candles และ volume แสดงผลถูกต้อง
- [ ] indicators รุ่นแรกคำนวณได้และมี tests
- [ ] signal มีเหตุผลและ timestamp ไม่ใช่กล่องดำ
- [ ] realtime update และ candle close ทำงานได้
- [ ] stale/error/reconnect/empty states ครบ
- [ ] symbol/timeframe switching ไม่มี race condition
- [ ] credentials ไม่อยู่ใน client bundle
- [ ] responsive และ keyboard-accessible ในระดับ MVP
- [ ] `pnpm lint` ผ่าน
- [ ] `pnpm build` ผ่าน
- [ ] README ระบุ setup, env vars, provider, attribution และ limitations
- [ ] AI analysis มี schema validation, source timestamp, risk และ invalidation
- [ ] AI ไม่เปลี่ยน deterministic facts และ fallback เป็น `wait` ได้
- [ ] Alert มี deduplication, cooldown และ audit metadata
- [ ] Browser notification permission/denied state ทำงานถูกต้อง
- [ ] Fibonacci levels มี source range, timestamp, version และ provisional status
- [ ] AI evaluation มี baseline, labels และ walk-forward report
- [ ] Online notification มี auth, persistence, deduplication, retry และ audit trail

## 18. No-Code Gate: ก่อนเริ่มแก้ source code

ต้องมีรายการต่อไปนี้ครบก่อนเริ่ม implementation:

- [x] อนุมัติ scope ใน Section 6
- [x] ยืนยัน provider, market, symbols, timeframe, language, timezone และ signal vocabulary
- [ ] ตอบ decisions ที่เหลือใน `plan/REQUEST-FROM-USER.md`
- [ ] เลือก chart library
- [ ] อนุมัติ indicator defaults และ deterministic signal rules
- [ ] อนุมัติ Binance UTC daily candle เป็น source of truth
- [ ] อนุมัติ data attribution
- [x] ยืนยัน local development เป็น target แรก
- [ ] อ่านเอกสาร Next.js ที่ติดตั้งใน `node_modules/next/dist/docs/`
- [x] ยืนยัน Vercel AI Gateway ผ่าน Vercel AI SDK; เลือก model IDs และเตรียม `AI_GATEWAY_API_KEY` แบบปลอดภัยก่อน Phase 6
- [ ] อนุมัติว่า AI ใช้คำว่า `consider-entry/consider-exit/wait` ไม่ใช่คำสั่ง Buy/Sell
- [ ] อนุมัติช่องทางแจ้งเตือน MVP: in-app + browser notification ขณะเปิดเว็บ
- [x] ยืนยัน product direction เป็น online application
- [ ] อนุมัติ Fibonacci confluence rules และ swing confirmation policy
- [x] เลือก 3 model IDs หลังตรวจ live model catalog, cost, latency, context window และ data-retention policy
- [x] เลือก `openai/gpt-4o-mini` เป็น replacement ของ Phi-3 Medium
- [ ] อนุมัติ online architecture: auth, database, scheduler/queue และ Web Push

จนกว่าจะผ่าน gate นี้ เอกสารฉบับนี้เป็นแผนเท่านั้น และยังไม่มีการแก้ไข source code

## 19. Remaining Review Questions

1. Realtime ต้องการ live Daily candle อย่างเดียว หรือรวม ticker ของ selected symbol?
2. อนุมัติค่า EMA 20/50, RSI 14, MACD 12/26/9 และ volume average 20 หรือไม่?
3. อนุมัติกฎ 4 checks และ threshold 3 จาก 4 หรือไม่?
4. อนุมัติ Binance UTC daily close เป็น source of truth หรือไม่?
5. อนุมัติให้เลือก Lightweight Charts หรือให้เปรียบเทียบ library ก่อน?
6. อนุมัติข้อความ attribution `Market data provided by Binance` หรือไม่?
7. ยืนยันว่าใช้ public API โดยไม่ใช้ Binance API key ใน MVP หรือไม่?
8. AI ต้องการใช้ Vercel AI Gateway หรือ provider อื่น?
9. อนุมัติ action vocabulary `consider-entry`, `consider-exit`, `wait` หรือไม่?
10. Alert MVP ใช้ in-app + browser notification ขณะเปิดเว็บได้หรือไม่?
11. ต้องการ Telegram/email/push ตั้งแต่แรก หรือเลื่อนไปหลัง local alert เสถียร?
