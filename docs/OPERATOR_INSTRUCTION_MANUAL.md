# CloudboyX Predict &bull; Operator Instruction Manual

**System Architecture, Deployment, Ingestion Pipelines & Production Operations Guide**  
*CFTC-Regulated Kalshi Event Contract Analysis & Econometric Forecasting System*  
*Version 2.4 &bull; Production Release*

---

## 1. System Overview & Executive Architecture

CloudboyX Predict is an end-to-end quantitative research, probability calibration, and financial edge determination engine engineered for event contracts traded on regulated prediction markets (principally Kalshi and Polymarket).

```
+-----------------------------------------------------------------------------------------+
|                                    CLOUDBOYX PREDICT                                    |
+-----------------------------------------------------------------------------------------+
|  MULTI-SOURCE INGESTION  -->  ECONOMETRIC MODEL ENGINE  -->  DECISION & VOLATILITY UI  |
|  * Kalshi Orderbook API       * Linear Regression            * 3-Check Dynamic Arrows   |
|  * Yahoo Finance Data         * Logistic Sigmoid (L2)        * Kelly Staking Calculator |
|  * Polarity Sentiment NLP     * Gemini 3.8 Multi-Agent       * Paper Trading Simulator |
|  * Python ingest_and_model.py * Brier Score Calibrator       * Dialectic Arena (Debate) |
+-----------------------------------------------------------------------------------------+
```

### Core Value Proposition
1. **Implied Market Probability vs. Calibrated Fair Value**: In prediction markets, market prices in cents ($0.01 to $0.99) represent implied probability (e.g., 42¢ = 42%). CloudboyX Predict synthesizes quantitative indicators, macro data, and dialectic AI agents to calculate an independent, calibrated probability.
2. **Mathematical Edge Detection**: Defines statistical edge as $E = P_{\text{calibrated}} - P_{\text{implied}}$.
3. **Execution Safety via 3-Check Orderbook Volatility**: Measures consecutive price checks, tracking directional velocity ($↗$ Green uptrend vs $↘$ Red downtrend), spread range, and traversed path to safeguard against slippage.
4. **Fractional Kelly Capital Allocation**: Eliminates emotional sizing by computing mathematical contract sizing based on EV and bankroll constraints.

---

## 2. Technical Stack & Runtime Specifications

| Tier | Technology | Key Dependencies | Port / Transport |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | React 18 + Vite | Tailwind CSS v4, Lucide-React, Motion | Browser Client SPA |
| **Backend API** | Node.js Express (ESM/CJS) | `@google/genai`, `dotenv`, `child_process` | Port 3000 (`0.0.0.0`) |
| **Python Pipeline**| Python 3 (CLI/Cron) | `requests`, `numpy`, `scipy`, `sklearn` | Standalone CLI |
| **AI Intelligence**| Google GenAI SDK | `gemini-3.8-flash` | Server-side cascade |
| **Deployment** | Google Cloud Run | Docker container, Nginx ingress | Port 3000 hardcoded |

---

## 3. Environment Variables & Secret Configuration

Declare all required variables in `.env` or the Cloud Run container runtime settings:

```env
# Google GenAI API Key for Gemini Cascade & Walkthrough Bot
GEMINI_API_KEY=your_gemini_api_key_here

# Kalshi Official API Credentials (Optional - Falls back to Public Orderbook Feeds)
KALSHI_API_KEY_ID=
KALSHI_PRIVATE_KEY_PATH=
KALSHI_API_BASE_URL=https://api.elections.kalshi.com/trade-api/v2

# Server Port (Must be 3000 for Cloud Run ingress)
PORT=3000
NODE_ENV=production
```

> **Security Rule**: The `GEMINI_API_KEY` and Kalshi secrets are strictly server-side. Never prefix them with `VITE_` or expose them in browser bundles.

---

## 4. Ingestion & Modeling Pipeline (`ingest_and_model.py`)

The automated Python pipeline is located at `/scripts/ingest_and_model.py`. It pulls multi-source financial and qualitative features, transforms them into standardized feature matrices, and runs econometric regressions.

### Execution Instructions
Run the script standalone from terminal:
```bash
python3 scripts/ingest_and_model.py --query "Will Fed cut rates in May 2026?" --category "Economics"
```

### Script Workflow:
1. **Step 1: Kalshi Orderbook Ingestion**: Queries public orderbook depth, extracting `yes_bid`, `yes_ask`, `last_price`, and `volume_24h`.
2. **Step 2: Macro Indicators**: Ingests 10-year Treasury yields, CPI momentum, and VIX volatility index.
3. **Step 3: Sentiment NLP Scrape**: Analyzes recent headlines to output normalized polarity scores $[-1.0, +1.0]$.
4. **Step 4: Econometric Modeling**:
   - **Linear OLS**: Baseline weighted composite score.
   - **Logistic Sigmoid**: $P(Y=1) = \frac{1}{1 + e^{-(\beta_0 + \sum \beta_i X_i)}}$, bounded strictly in $(0, 1)$.
   - **AI Synthesis**: Generates calibrated confidence intervals, bull/bear synthesis, and ambiguity checks.
5. **Step 5: Output Generation**: Writes atomic payload to `data/latest_ingestion.json` for consumption by the Express API.

---

## 5. API Endpoints Reference

### 1. `POST /api/analyze-probability`
- **Body**: `{ query: string, marketPriceCents?: number, category?: string }`
- **Response**: Full `ProbabilityAnalysisResult` object containing calibrated probability, bull/bear agent debates, resolution criteria, and Kelly economics.

### 2. `GET /api/kalshi/price-check?query=...&currentPriceCents=...`
- **Response**: `{ priceCents: number, source: string, yesBid: number, yesAsk: number }`
- **Purpose**: Real-time tick polling for the 3-check volatility engine.

### 3. `POST /api/guide-bot`
- **Body**: `{ question: string, currentSection?: string, activeEvent?: string, history?: Array }`
- **Response**: `{ reply: string, suggestedAction?: { type: string, targetId: string, label: string } }`
- **Purpose**: Powers the interactive AI walkthrough bot.

### 4. `POST /api/model/predict`
- **Body**: `{ features: StructuredFeatures, modelType: 'linear' | 'logistic' | 'gemini_ai', customWeights?: object }`
- **Response**: Predicts contract win probability with full coefficient attribution.

### 5. `GET /api/ingest/latest` & `POST /api/ingest/run`
- **Purpose**: Ingestion status and on-demand trigger for Python data pipelines.

---

## 6. Build, Deployment & Verification Workflow

```bash
# 1. Lint the TypeScript codebase
npm run lint

# 2. Production Build (Bundles frontend to dist/ and backend to dist/server.cjs)
npm run build

# 3. Test Production Server locally
NODE_ENV=production node dist/server.cjs

# 4. Health Check Probe
curl -s http://localhost:3000/api/health
# Returns: {"status":"ok","hasApiKey":true}
```

### Critical Deployment Checklist:
- [x] dev server runs on port 3000 (`0.0.0.0:3000`).
- [x] No `import.meta.url` in CommonJS bundle.
- [x] Static assets served from `dist/` in production.
- [x] Fallback handlers ensure 100% uptime even if external APIs experience rate limits.
