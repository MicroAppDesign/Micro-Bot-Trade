# Information Request Before Implementation

โปรดกรอกหรือยืนยันเฉพาะรายการที่ยังไม่ถูกล็อก ก่อนเริ่มแก้ไข source code

## Confirmed

- Provider: Binance public market-data API
- Market: Binance Spot
- Symbols: BTCUSDT, ETHUSDT, SOLUSDT
- Timeframe: Daily (`1d`)
- Data mode: historical + realtime พร้อมกัน
- UI language: English
- Signal vocabulary: Bullish / Bearish / Neutral
- Display timezone: `Asia/Bangkok`
- Development target: local
- Trading execution: ไม่ทำใน MVP

## Required Decisions

### 1. Realtime scope

เลือกหนึ่งข้อ:

- [x] Live daily candle อย่างเดียว
- [ ] Live daily candle + ticker ของ symbol ที่เลือก
- [ ] Live daily candle + ticker ของทั้ง 3 symbols

**Recommended**: Live daily candle + ticker ของ symbol ที่เลือก เพื่อควบคุม connection และไม่เกิน scope

### 2. Indicator defaults

ถ้าไม่มีการแก้ไข ให้ใช้ค่ามาตรฐานนี้:

- EMA: 20 และ 50
- RSI: 14, Wilder smoothing, oversold 30, overbought 70
- MACD: fast 12, slow 26, signal 9
- Volume average: 20 candles

ยืนยัน:

- [x] ใช้ค่ามาตรฐานด้านบน
- [ ] ใช้ค่าอื่น: ____________________

### 3. Signal rules

ข้อเสนอสำหรับ MVP:

- Check 1: `close > EMA20`
- Check 2: `EMA20 > EMA50`
- Check 3: `RSI >= 50` และ `MACD histogram > 0`
- Check 4: `volume >= volume average`
- Bullish: ผ่านอย่างน้อย 3 จาก 4 checks
- Bearish: ตรงข้ามและผ่านอย่างน้อย 3 จาก 4 checks
- Neutral: ไม่เข้าเงื่อนไข Bullish หรือ Bearish
- สัญญาณหลักใช้เฉพาะ daily candle ที่ปิดแล้ว

ยืนยัน:

- [x] ใช้กฎนี้
- [ ] ต้องการแก้กฎ: ____________________

### 4. Daily candle semantics

- [x] ใช้ Binance UTC daily candle เป็น source of truth และแสดงผลเวลาเป็น `Asia/Bangkok`
- [ ] ต้องการให้ daily candle อิง timezone อื่น: ____________________

**Recommended**: ใช้ Binance UTC daily candle เพราะตรงกับ provider และตรวจสอบซ้ำได้ง่าย

### 5. Chart library

- [x] อนุมัติให้เลือก Lightweight Charts
- [ ] ต้องการ library อื่น: ____________________
- [x] ให้ agent เปรียบเทียบตัวเลือกก่อนติดตั้ง

### 6. Public API credentials

สำหรับ historical/realtime public market data ไม่จำเป็นต้องมี Binance API key ใน MVP

- [x] ใช้ public Binance API โดยไม่ใช้ API key
- [ ] มี proxy หรือ credential ของตนเอง: ____________________

**ห้ามส่ง API secret ผ่าน chat หรือ commit ลง repository**

### 7. Provider attribution

- [x] อนุญาตให้แสดง `Market data provided by Binance` ในหน้าเว็บ
- [ ] ต้องการข้อความ attribution อื่น: ____________________

## Environment Preparation

สร้างไฟล์ `.env.local` ภายหลังได้ด้วยค่าประมาณนี้:

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

ไม่ต้องใส่ค่าเหล่านี้ใน MVP:

```env
BINANCE_API_KEY=
BINANCE_API_SECRET=
DATABASE_URL=
AUTH_SECRET=
```

## Ready-to-Code Checklist

- [x] ตอบข้อ 1-7 ด้านบน
- [x] อ่านและอนุมัติ `plan/README.md`
- [x] ยืนยันว่าจะใช้ public API หรือจัดเตรียม proxy
- [x] ยืนยันว่าจะเริ่มแก้ source code หลังจาก checklist นี้เสร็จ

## AI and Alert Planning Decisions

ยังไม่ต้องเตรียม secret จนกว่าจะอนุมัติรายการนี้และเริ่ม Phase 6

### 8. AI provider and consensus

- [x] ใช้ Vercel AI Gateway ผ่าน Vercel AI SDK
- [ ] ใช้ provider อื่น: ____________________
- [ ] ยังไม่เพิ่ม AI ใน local MVP

ใช้ Gateway เป็นชั้นกลาง แต่ต้องตรวจ live model catalog ก่อนเลือกโมเดลจริง

- จำนวนโมเดล: 3
- Consensus: 3/3 หรือ 2/3 action เดียวกัน
- 1/3 หรือ deterministic gate ไม่ผ่าน: `wait`
- ไม่ให้โมเดลเห็นคำตอบของกันและกันก่อนตอบ

### 9. AI action vocabulary

- [x] ใช้ `consider-entry`, `consider-exit`, `wait`
- [ ] ต้องการคำอื่น: ____________________

AI จะไม่ใช้คำว่า Buy/Sell recommendation และ deterministic engine ยังเป็น source of truth

### 10. AI behavior

- [x] ให้ AI อธิบายจาก indicators, CDC ActionZone, Fibonacci และ deterministic signals เท่านั้น
- [ ] ให้ AI วิเคราะห์จากราคา raw ด้วย

**Recommended**: เลือกข้อแรกเท่านั้น เพื่อป้องกัน hallucination และตรวจสอบย้อนกลับได้

### 11. Alert channels for first version

- [x] In-app alert
- [x] Browser notification ขณะเปิดเว็บ
- [ ] Telegram
- [ ] Email
- [ ] Mobile push

**Recommended**: In-app + browser notification เป็น notification phase แรก ก่อนเพิ่ม external providers

### 13. Product deployment direction

- [x] Online application
- [ ] Local-only prototype

Online หมายถึงต้องมี hosted app, HTTPS, authentication, database, scheduler/queue และ Web Push หากต้องการแจ้งเตือนเมื่อปิด browser

### 14. Fibonacci usage

- [x] ใช้ Fibonacci เป็น confluence tool ร่วมกับ indicators และ CDC ActionZone
- [ ] ใช้ Fibonacci เป็น trigger เดี่ยว

**Recommended**: ข้อแรกเท่านั้น

กติกาพื้นฐานที่แนะนำ:

- Retracement: 0.236, 0.382, 0.5, 0.618, 0.786
- Extension: 1.272, 1.618 เมื่อ swing ยืนยันแล้ว
- แสดงเป็น zone มี tolerance ไม่ใช่ราคาจุดเดียว
- ห้ามใช้ swing ที่อาศัยข้อมูลอนาคต

### 15. AI learning approach

- [x] Context-first: AI อธิบาย structured facts ก่อน
- [ ] Train/fine-tune model ตั้งแต่แรก
- [ ] ยังไม่ทำ AI จนกว่าจะมี historical evaluation dataset

**Recommended**: เริ่ม Context-first แล้วสร้าง evaluation dataset ก่อน train/fine-tune

AI ต้องมี baseline, labels, time-based train/validation/test split และ walk-forward evaluation

### 12. AI environment

เมื่ออนุมัติ Phase 6 ให้เตรียมผ่าน secure environment manager:

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

ไม่ต้องใส่ค่าเหล่านี้ใน MVP ปัจจุบัน:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

เว้นแต่จะอนุมัติ BYOK โดยเฉพาะ และห้ามส่ง secret ผ่าน chat หรือ commit ลง repository

### AI Ready Gate

- [x] อนุมัติ Vercel AI Gateway ผ่าน Vercel AI SDK
- [x] อนุมัติ action vocabulary
- [x] อนุมัติให้ AI ใช้เฉพาะ structured facts
- [x] อนุมัติ in-app + browser notification สำหรับ online MVP
- [x] ยอมรับว่า background notification ต้องใช้ Web Push, service worker และ online backend เมื่อปิด browser
- [ ] อนุมัติให้เริ่ม Phase 6 หลัง alert rules และ schema tests พร้อม
- [x] อนุมัติ In-app + Browser notification
- [x] ยืนยัน online application direction
- [x] อนุมัติ Fibonacci เป็น confluence tool และห้ามใช้เป็น trigger เดี่ยว
- [x] อนุมัติ Context-first AI ก่อนการ train/fine-tune
- [ ] เลือก model IDs หลังตรวจ live catalog, cost, latency, context window และ data retention
- [x] อนุมัติให้ใช้ 3 models และ consensus 2/3 หรือ 3/3
- [x] เลือก model IDs หลังตรวจ live catalog, cost และ account access
- [x] อนุมัติ `openai/gpt-4o-mini` เป็น replacement ของ Phi-3 Medium

Provider candidates สำหรับ replacement:

- [ ] Groq Console
- [ ] Mistral AI Console
- [ ] อื่น ๆ: ____________________

ต้องเลือกจาก exact `provider/model` ที่มีใน AI Gateway catalog ไม่ใช่เลือกจากชื่อ provider อย่างเดียว

### Live catalog check

ตรวจเมื่อ 2026-09-13:

- พบ `google/gemini-2.5-flash`
- พบ `meta/llama-3.1-8b`
- ไม่พบ Microsoft Phi-3 Medium 128K Instruct
- ยังไม่มีหลักฐานว่า 2 โมเดลที่พบเป็น free inference; ต้องตรวจ billing/account access ก่อนใช้จริง
- เลือก `openai/gpt-4o-mini` เป็นโมเดลตัวที่สาม เพราะ exact ID, fast tag, 128K context และ provider diversity
