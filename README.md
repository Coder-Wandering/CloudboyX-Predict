# CloudboyX Predict & Quantitative Forecasting Engine

> An enterprise full-stack Bayesian forecasting, prediction market analytics, and webhook automation platform built with React 19, TypeScript, Express, Vite, and Google Gemini AI.

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+ (comes with Node.js)
- *(Optional)* **Python 3.9+**: only required if executing the offline Python ingestion pipeline (`scripts/ingest_and_model.py`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY="AIzaSy..."
```
> **Tip:** You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
> **Note:** If no API key is provided, the platform automatically runs in **Calibrated Standalone Mode** with zero crashes, providing high-precision econometric regression, Bayesian priors, and deterministic market models.

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:3000`.

---

## 🚀 Production Build & Self-Hosting

### Standard Node.js Server
Compile both the Vite client bundle and the Express backend server into `dist/`:
```bash
npm run build
npm start
```
The server will bind to `0.0.0.0:${PORT:-3000}` and serve the production static assets alongside all `/api/*` endpoints.

---

## ☁️ Deployment Guides for External Cloud Platforms

CloudboyX is completely self-contained and ready for 1-click deployment on any cloud hosting provider.

### 1. Deploying on Render (Recommended)
1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. In the **Environment Variables** tab, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. Render dynamically manages the `$PORT` variable and health checks.

### 2. Deploying on Railway
1. Push your repository to **GitHub**.
2. Go to [Railway Dashboard](https://railway.app/) and click **New Project > Deploy from GitHub repo**.
3. Select this repository.
4. Under **Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: `production`
5. Railway automatically reads `package.json` scripts (`npm run build` and `npm start`) or the provided `Dockerfile`.

### 3. Deploying with Docker
A multi-stage `Dockerfile` is provided out of the box:
```bash
# Build the Docker image
docker build -t cloudboyx-predict .

# Run the container
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your-api-key-here" \
  --name cloudboyx cloudboyx-predict
```
Visit `http://localhost:3000`.

### 4. Deploying on Fly.io
```bash
# Install flyctl if not installed
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Set secret key
fly secrets set GEMINI_API_KEY="your-api-key-here"

# Deploy
fly deploy
```

### 5. Deploying on Google Cloud Run
```bash
gcloud run deploy cloudboyx-predict \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-api-key-here"
```

---

## 🧠 AI Architecture & Portability Guarantee

### 1. Server-Side Secure Execution
All calls to Google Gemini AI models use `@google/genai` exclusively on the **Node.js Express backend** (`server.ts`, `server/sentimentService.ts`, `server/geminiCircuitBreaker.ts`).
- The API key is **never bundled or exposed** to the client browser.
- The client communicates solely via `/api/analyze-probability`, `/api/market/sentiment-trend`, `/api/models/predict`, and `/api/guide-bot`.

### 2. Multi-Model Cascade
When an AI inference request arrives, the server cascades across modern Gemini models:
1. `gemini-3.8-flash` (Primary Superforecaster)
2. `gemini-3.1-flash-lite` (High-Throughput Resilient Fallback)
3. `gemini-flash-latest` (General Alias)

### 3. Built-in Circuit Breaker & Calibrated Baseline Fallbacks
If an external host has no `GEMINI_API_KEY` set, or if the key reaches rate/quota limits (HTTP 429), the circuit breaker immediately engages:
- Prevents cascading timeouts or hung connections.
- Automatically serves **Calibrated Econometric Models**, **Regularized Logistic Regression (Sigmoid)**, and **Bayesian reference class priors**.
- The entire UI, Orderbook Analytics, 3-Check Volatility, NFL Hub, Paper Trading, and Webhook Studio remain **100% operational** without throwing errors.

---

## 🔑 Environment Variables Reference

| Variable | Required? | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Recommended | `""` | Google Gemini API key. Also supports `API_KEY` or `GOOGLE_GENAI_API_KEY`. |
| `PORT` | Optional | `3000` | Port for the Express server to listen on. Cloud providers set this dynamically. |
| `NODE_ENV` | Optional | `development` | Set to `production` in production hosting environments. |
| `APP_URL` | Optional | `http://localhost:3000` | Canonical host URL for webhooks and notification previews. |
| `NEWS_API_KEY` | Optional | `""` | Used by optional offline ingestion script `scripts/ingest_and_model.py`. |
| `ALPHA_VANTAGE_KEY` | Optional | `""` | Used by optional offline ingestion script `scripts/ingest_and_model.py`. |

---

## 📁 Repository Structure

```
.
├── server.ts                    # Main Express full-stack entrypoint & API endpoints
├── server/
│   ├── geminiCircuitBreaker.ts  # Gemini client initialization, key aliases, circuit breaker
│   ├── sentimentService.ts      # 7-day social & news NLP sentiment analysis & divergence
│   └── pdfGenerator.ts          # Master operator manuals and PDF generator
├── src/
│   ├── App.tsx                  # Root React application & state management
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Tailwind CSS v4 design system
│   ├── types.ts                 # TypeScript domain interfaces
│   ├── components/              # Modular UI components (Analyzer, NFL Hub, Webhooks, etc.)
│   └── utils/                   # Statistical engines, backtesters, Kelly formulas
├── scripts/
│   └── ingest_and_model.py      # Multi-source Python ingestion pipeline
├── docs/                        # Markdown instruction manuals & cheatsheets
├── Dockerfile                   # Multi-stage production container manifest
├── .env.example                 # Example environment variables template
└── package.json                 # Dependency manifest & build scripts
```

---

## 🛠 Available Scripts

- `npm run dev`: Starts the live development server with hot reload and backend middleware.
- `npm run build`: Bundles the Vite React client and bundles `server.ts` into `dist/server.cjs`.
- `npm start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Validates TypeScript types across the entire codebase (`tsc --noEmit`).

---

## 📄 License
MIT License. Built for production financial modeling and automated webhook distribution.
