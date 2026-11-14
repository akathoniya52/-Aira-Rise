# AiraRise — Breathe Better. Build a Better Tomorrow.

**AI-powered civic air-quality intelligence** that turns uploaded or pasted air-quality data into traceable insights, prioritized local actions, historical comparisons, and multilingual reports.

---

## 🏆 PromptWars Competition Submission Details

| Parameter | Submission Detail |
| :--- | :--- |
| **Challenge** | Civic Air Quality Briefing Studio (Google for Developers × H2S) |
| **Product** | **AiraRise Intelligence OS** |
| **Frontend** | [http://localhost:3000](http://localhost:3000) (Next.js 14 + Tailwind CSS + TypeScript) |
| **Backend API** | [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) (Node.js + Express + TypeScript) |
| **Primary AI Provider** | **Google Gemini 1.5 Flash / Pro** (`@google/generative-ai`) |

---

## 👥 Supported Roles & Meaningful Interventions

Unlike static tools that merely swap names, AiraRise outputs **fundamentally different civic workflows** based on the logged-in role's statutory authority:

| Role | Operational Scope | Tailored Action Examples |
| :--- | :--- | :--- |
| **Municipal Ward Officer** | Ward-level arterial overview, freight corridors, municipal machinery. | Deploy mobile anti-smog water cannons to flyovers, enforce 18-wheel heavy transit curfews, activate dust sweeping units. |
| **Housing Society Admin** | Residential perimeters, building towers, common areas, construction neighbors. | Serve formal dust mitigation notices to adjacent construction sites, mandate 25-ft green geotextile netting, activate indoor lobby HVAC filtration. |
| **School Administrator** | Student safety, school campuses, children vulnerability buffers. | Shift outdoor sports/PT drills to indoor study halls, issue parent SMS advisories, seal street-facing classroom windows during morning inversion peaks. |
| **Ward-Level Field Team** | Ground sensor maintenance, calibration, physical hotspot inspection. | Recalibrate optical particle counters (zero-point baseline drift check), inspect loose haulage silt accumulation along road berms. |

---

## 🤖 GenAI Services Used & Truthfulness Safeguards

| GenAI Capability | Implementation & Model | Truthfulness Safeguard |
| :--- | :--- | :--- |
| **Environmental Telemetry Synthesis** | Google Gemini 1.5 Flash / Pro | Bounded prompt: Restricted to verified source rows and sensor IDs. Zero hallucination of fake readings. |
| **Role-Specific Intervention Generation** | Google Gemini 1.5 Flash / Pro | Role-aware schema: Generates distinct legal/administrative actions matching user's civic powers. |
| **Multilingual Citizen Advisory** | Google Gemini 1.5 Flash / Pro | Synchronized output across **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** with identical telemetry citations. |
| **Historical Policy Impact Retrospective** | Google Gemini 1.5 Pro | Compares diurnal curve shifts against historical baselines to recommend long-term municipal policies. |

*Note: All numeric analytics (means, medians, max, CPCB exceedances, delta percentages) are computed deterministically by TypeScript algorithms—never left to LLM calculation.*

---

## 🔑 Evaluator Test Credentials

Evaluators can sign in using dummy credentials or use the **1-Click Quick Login** buttons on `/login`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Ward Officer** | `officer@airarise.test` | `TestPass123!` |
| **Housing Society Admin** | `housing@airarise.test` | `TestPass123!` |
| **School Administrator** | `school@airarise.test` | `TestPass123!` |
| **Ward Field Team** | `field@airarise.test` | `TestPass123!` |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### 2. Frontend Launch (Port 3000)
```bash
cd airarise/frontend
npm install
npm run build
npm run start
```
Access the application at **[http://localhost:3000](http://localhost:3000)**.

### 3. Backend Launch (Port 4000)
```bash
cd airarise/backend
npm install
npm run build
npm run start
```
Verify the health check at **`http://localhost:4000/api/v1/health`**.

### 4. Running Test Suites
```bash
cd airarise/backend
npm test
```

---

## 📐 Application Architecture & Sitemap

```
airarise/
├── frontend/               # Next.js 14 App Router (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx               # Main Dashboard
│   │   │   │   ├── air-quality/page.tsx   # AI Air Quality Intelligence
│   │   │   │   ├── data-upload/page.tsx   # Data Ingestion & CSV Preview
│   │   │   │   ├── ai-insights/page.tsx   # Automated AI Insights
│   │   │   │   ├── pollution-hotspots/    # GIS Hotspots & Mesh Monitor
│   │   │   │   ├── action-center/page.tsx # Civic Intervention Hub
│   │   │   │   ├── reports/page.tsx       # Multilingual Advisory Studio
│   │   │   │   ├── historical/page.tsx    # Policy Impact Comparisons
│   │   │   │   └── settings/page.tsx      # Settings & Gemini API Key
│   │   │   ├── login/page.tsx             # 1-Click Evaluator Sign-In
│   │   │   └── register/page.tsx          # Division Registration
│   │   ├── components/layout/             # Sidebar, Header, ClientProvider
│   │   ├── context/AppContext.tsx         # Unified Reactive State Engine
│   │   └── services/geminiService.ts      # Live & Validated Gemini Engine
├── backend/                # Node.js + Express + TypeScript (Port 4000)
│   ├── src/
│   │   ├── config/                        # Database & Environment validation
│   │   ├── shared/                        # Response envelopes, error classes
│   │   ├── __tests__/pipeline.test.ts     # Automated unit test suite
│   │   ├── app.ts                         # Express application setup
│   │   └── server.ts                      # Non-blocking server launcher
└── docs/                   # Architecture, Data Model, API contracts
```

---

## 🛡️ Truthfulness & Disqualification Compliance

1. **No Static/Mock Pages**: Every page reacts dynamically to role changes, language switches, file uploads, and button interactions.
2. **Deterministic Integrity**: Missing readings are explicitly flagged as `MISSING_VALUE` without being zero-imputed. Units such as `mg/m³` are safely normalized by multiplying by 1,000.
3. **Traceability**: Every AI finding cites specific dataset row identifiers (`#001`, `#005`), sensor IDs, and physical coordinates.
4. **Resilient AI Execution**: The platform supports live Google Gemini API keys while providing an audited, rule-bounded deterministic engine to guarantee zero downtime during evaluation.
