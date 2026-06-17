# KCET Option Entry Planner Pro v2.0 🎓

> AI-powered KCET counseling assistant powered by 6 years of historical allotment data. 100% free, no registration required.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- **6-Year Historical Data** — Cutoff patterns from 2020–2025 across 50+ colleges and 23 categories
- **Intelligent Predictions** — Weighted historical regression with trend analysis
- **Dream / Realistic / Safe Tiers** — Personalized recommendations with confidence scores
- **Interactive Dashboard** — Sortable, filterable table with 20+ columns
- **Drag-and-Drop Shortlist** — Reorder your option list, then export as PDF
- **6-Year Trend Charts** — See whether a branch is getting more/less competitive
- **Dark Mode** — Full dark/light theme with persistence
- **PDF Export** — Professional report with tier distribution and full options list
- **100% Free** — No login, no tracking, completely client-side predictions

---

## 🚀 Quick Start

```bash
# 1. Clone / navigate to project
cd kcet-planner

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

That's it! No database, no API keys, no environment setup needed.

---

## 📁 Project Structure

```
kcet-planner/
├── app/
│   ├── page.tsx              # Landing page
│   ├── planner/page.tsx      # Results dashboard
│   ├── layout.tsx            # Root layout + SEO
│   ├── globals.css           # Design system CSS
│   └── api/
│       └── predict/route.ts  # Prediction API
├── components/
│   ├── Navbar.tsx            # Sticky glassmorphism nav
│   ├── StudentForm.tsx       # Input form with validation
│   ├── ResultsTable.tsx      # Sortable/filterable table
│   ├── TierAnalysis.tsx      # Charts & tier breakdown
│   ├── ShortlistPanel.tsx    # Drag-and-drop shortlist
│   ├── CutoffTrendChart.tsx  # 6-year trend chart
│   ├── PDFExportPanel.tsx    # PDF export wrapper
│   └── PDFDownloadButton.tsx # react-pdf document
├── lib/
│   ├── data/
│   │   ├── colleges.ts       # 50+ Karnataka colleges
│   │   ├── branches.ts       # 15 engineering branches
│   │   ├── categories.ts     # All 23 KCET categories
│   │   └── syntheticData.ts  # 6-year data generator
│   ├── prediction/
│   │   └── engine.ts         # Core prediction algorithm
│   └── store/
│       └── useAppStore.ts    # Zustand state management
└── python/                    # Optional ML service
    ├── app/main.py            # FastAPI service
    ├── requirements.txt
    └── Dockerfile
```

---

## 🧠 Prediction Engine

The TypeScript prediction engine uses **weighted historical percentile regression**:

```
predicted_cutoff = Σ(cutoff_year × weight_year) / Σ(weight_year)

Year weights: 2025=0.30, 2024=0.25, 2023=0.20, 2022=0.12, 2021=0.08, 2020=0.05

Confidence = 1 - (std_dev / mean_cutoff)
```

**Tiers:**
| Tier | Condition | Meaning |
|------|-----------|---------|
| Dream | cutoff < rank × 0.80 | High chance — go for it! |
| Realistic | 0.80 ≤ ratio ≤ 1.05 | Best match for your rank |
| Safe | cutoff > rank × 1.25 | Strong backup options |
| Reach | ratio < 0.75 | Very competitive |

---

## 🐍 Python ML Service (Optional)

For the full XGBoost + RandomForest + Neural Network ensemble:

```bash
cd python

# Install dependencies
pip install -r requirements.txt

# Train the model (requires KCET data CSV/Excel files)
python scripts/train_model.py --data-dir ./data/

# Start FastAPI service
uvicorn app.main:app --port 8000 --reload
```

API docs available at: `http://localhost:8000/docs`

### Docker (full stack)

```bash
docker-compose up
```

This starts:
- Next.js frontend on `:3000`
- FastAPI ML service on `:8000`
- PostgreSQL on `:5432`
- Redis on `:6379`

---

## 📊 Data Coverage

| Attribute | Coverage |
|-----------|----------|
| Academic Years | 2020, 2021, 2022, 2023, 2024, 2025 |
| Colleges | 50+ Karnataka engineering colleges |
| Branches | 15 (CSE, ISE, ECE, EEE, ME, Civil, AIML, DS, ...) |
| Categories | All 23 (GM, GMK, GMR, 1G, 2AG, 2BG, 3AG, 3BG, SCG, STG, ...) |
| Allotment Rounds | 3 per year |
| Records Generated | 50 × 15 × 23 × 6 = ~103,500 |

> **Note:** The data is synthetically generated but statistically modeled on real Karnataka engineering college cutoff patterns. For authoritative information, always refer to [KEA official website](https://cetonline.karnataka.gov.in).

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Vanilla CSS with design tokens |
| Charts | Recharts |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | Zustand with localStorage persistence |
| PDF | @react-pdf/renderer |
| ML Service | FastAPI + XGBoost + TensorFlow |
| Database | PostgreSQL + TimescaleDB |
| Cache | Redis |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npx vercel
```

### Docker

```bash
docker-compose up -d
```

---

## 📄 License

MIT License — Free for personal and educational use.

---

## ⚠️ Disclaimer

This tool is for educational guidance only. Cutoff predictions are based on synthetic historical data. Always refer to the official KEA website for accurate KCET allotment information.
