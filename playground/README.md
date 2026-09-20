# TypeSafe Jev • Hugging Face Dataset Multidimensional Classifier

An AI-powered dataset analysis interface built with **TypeSafe AI** and its flagship System One model, **Jev** (`jev-latest`).

Import any dataset directly from the [Hugging Face Hub](https://huggingface.co/datasets), define typed classification dimensions across the three TypeSafe primitives (**Choice**, **Noul**, **Score**), and evaluate records simultaneously using speculative fan-out with calibrated probabilities and certainty metrics.

Designed following strict **impeccable taste** principles with an elegant pastel palette, high typographic contrast, and responsive layout.

---

## 🌟 Key Capabilities

1. **Hugging Face Hub Integration**
   - **Search & Autocomplete:** Real-time query to Hugging Face's dataset catalog.
   - **Any HF Dataset Supported:** Enter canonical repository IDs (e.g. `cornell-movie-review-data/rotten_tomatoes`, `fancyzhx/ag_news`, `cardiffnlp/tweet_eval`, `tatsu-lab/alpaca`, `truthful_qa`, etc.).
   - **Config & Split Explorer:** Select configs (`default`, etc.) and splits (`train`, `validation`, `test`).
   - **Column & State Picker:** Auto-detects text features (`text`, `instruction`, `review`, etc.) or pass structured JSON state.
   - **Local File Upload:** Import proprietary `.json`, `.jsonl`, or `.csv` files.

2. **System One Judgment Primitives (TypeSafe Jev)**
   - **Choice (`choice`):** Selects one option from a defined set, returning the winning choice, full probability distribution, and confidence.
   - **Noul (`noul`):** Yes/No judgment on a calibrated `[0, 1]` probability scale with true/false rubric criteria.
   - **Score (`score`):** Graded rating along 2–10 ordered descriptive levels, computing a probability-weighted continuous score and confidence.

3. **Speculative Fan-Out Pattern**
   - In accordance with TypeSafe AI architecture, all active dimensions for a given row are batched into a **single parallel API request** to `https://api.typesafe.ai/v1/systemone`.
   - Maximum throughput, minimal latency, and zero redundant prompt tokens.

4. **Calibrated Confidence & Edge Case Discovery**
   - Every choice and score carries a confidence metric (0% to 100%).
   - Interactive table slider to filter by certainty threshold (e.g. isolate items with confidence < 75% for human-in-the-loop review).
   - Deep inspection drawer revealing the exact prompt state, criteria, full probability distribution bars, and token metrics.

5. **Curated Dimension Packs & Custom Dimension Builder**
   - **Sentiment & Emotional Tone** (Sentiment polarity, Time urgency noul, Emotional intensity score)
   - **Quality & Content Moderation** (Quality tier choice, Toxicity noul, Helpfulness score)
   - **Topic & Commercial Intent** (Primary domain taxonomy choice, Commercial intent noul)
   - **Complexity & Readability** (Target audience choice, Jargon density noul, Cognitive complexity score)
   - **Customer Support & Churn** (Ticket intent choice, Churn risk noul, Customer frustration score)
   - **Custom Builder:** Define custom question instructions, criteria rubrics, and pastel color themes.

6. **Export & Portability**
   - Export enriched datasets to **CSV**, **Structured JSON**, or **Hugging Face JSONL** (ready for `datasets.load_dataset`).

7. **Calibrated Simulation Mode**
   - Instant testing without consuming API credits: uses an intelligent local heuristic evaluator with realistic calibrated probabilities, so the application works out of the box even before configuring an API key.

---

## 🎨 Pastel Design System & Accessibility

Crafted with the `impeccable` design guidelines:
- **Calibrated Contrast:** Body text strictly adheres to WCAG AA ≥ 4.5:1 (deep slate `#111827` and `#1F2937` on `#FFFFFF` and soft pastel badges).
- **Harmonious Pastel Accents:**
  - Lavender (`#EEF0FD` / `#4D3DB5`)
  - Mint / Sage (`#EAF7F0` / `#1C7352`)
  - Sky Blue (`#EBF5FF` / `#1E65A8`)
  - Peach (`#FFF1E8` / `#A04818`)
  - Rose (`#FDEFF3` / `#A3294C`)
  - Butter (`#FEF9E7` / `#8C6314`)
  - Lilac (`#F5EFFE` / `#7638B0`)
- **Micro-Interactions:** Subtle SVG confidence meters, probability distribution graphs, and hover disclosures.

---

## 🚀 Quick Start

### 1. Run the Application
The backend and pre-built frontend are served together on port `3080`:

```bash
# Start the production server
node server.js
```
Open **[http://localhost:3080](http://localhost:3080)** in your browser.

### 2. Development Mode (Vite HMR)
If you wish to modify frontend components with live hot-module reloading:

```bash
# Terminal 1: Backend API
node server.js

# Terminal 2: Vite Dev Server
npm run dev
```
Vite will run on **[http://localhost:5180](http://localhost:5180)** and proxy `/api` requests to port `3080`.

### 3. Configure TypeSafe API Key
- Click the **"Simulation Mode"** or **"Configure API"** button in the top navigation.
- Paste your TypeSafe API key (`ts_live_...`).
- Click **"Test Connection"** to verify against `api.typesafe.ai/v1/systemone`.
- You can toggle between **Live API** and **Simulation Mode** at any time.

---

## 🏗️ Architecture

```
hf-jev/
├── server.js                     # Express backend: HF dataset proxy, TypeSafe API proxy & simulator
├── src/
│   ├── types/                    # TypeScript interfaces for HF datasets, dimensions, answers
│   ├── data/
│   │   └── presets.ts            # Curated HF datasets and pre-built dimension packs
│   ├── components/
│   │   ├── Header.tsx            # Top nav with brand, model info, and API modal trigger
│   │   ├── DatasetSelector.tsx   # HF Hub search, preset pills, column picker, file upload
│   │   ├── DimensionManager.tsx  # Active questions cards, pack selector, speculative fan-out
│   │   ├── DimensionEditorModal.tsx # Custom question builder for Choice, Noul, and Score
│   │   ├── BatchControls.tsx     # Run / Pause / Reset / Export actions with progress meter
│   │   ├── DatasetTable.tsx      # Responsive data table with confidence rings & filters
│   │   ├── RowInspectorModal.tsx # Deep inspection modal (raw state, probabilities, tokens)
│   │   ├── AnalyticsPanel.tsx    # Aggregate distribution charts and edge-case highlights
│   │   ├── ExportModal.tsx       # Export to CSV, JSON, and Hugging Face JSONL
│   │   ├── PastelBadge.tsx       # Accessible pastel badges
│   │   └── ConfidenceRing.tsx    # SVG calibrated confidence ring
│   ├── App.tsx                   # Main state coordinator
│   └── index.css                 # Tailwind CSS & pastel design tokens
├── dist/                         # Compiled, production-ready frontend bundle
├── package.json
└── vite.config.ts
```
