# 🕉️ VedicMind (Dwanda)
### Adaptive Learning Platform & Multimodal AI Tutor for Vedic Mathematics

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📌 Overview

**VedicMind (Dwanda)** is an enterprise-grade, full-stack adaptive learning platform and multimodal intelligent tutoring system designed to democratize and accelerate the mastery of **Vedic Mathematics** — the ancient Indian mental calculation system comprising 16 primary Sutras and 13 Sub-sutras (Upa-sutras).

By fusing timeless mental arithmetic algorithms with modern pedagogical science, **VedicMind** delivers:
- **Interactive Multi-Page Curriculum:** 10 modular units spanning foundational arithmetic, cross-multiplication, polynomials, square roots, cubes, and mental reasoning.
- **Procedural Question Engine:** Dynamically generated mental arithmetic challenges with progressive difficulty tiers and instant step-by-step Vedic breakdowns.
- **Multimodal AI Tutor:** A Socratic AI tutor powered by **Google Gemini 2.5 Flash**, featuring handwritten/printed math image recognition, voice Speech-to-Text (STT) with phonetic Sanskrit normalization, and anti-hallucination math AST verification.
- **10-Stage Deterministic NLP Pipeline:** A local, zero-latency cognitive engine analyzing student intent, emotion, Bloom’s taxonomy depth, and conceptual misconceptions without external API overhead.
- **Adaptive Mastery & Gamification:** Real-time streak tracking, rolling mastery curves, weakest-topic recommendations, and a holistic gamification economy (Wisdom Tree, Daily Goals, Weekly Missions, and Rewards Shop).

---

## 🚀 Key Features

### 1. 🕉️ Complete Vedic Mathematics Curriculum
- **Canonical Coverage:** Full coverage of all 16 Sutras (e.g., *Nikhilam Navatashcaramam Dashatah*, *Urdhva Tiryagbhyam*, *Ekadhikena Purvena*) and key Sub-sutras (e.g., *Dwandwa Yoga Duplex Method*, *Anurupyena*, *Vinculum Method*).
- **Multi-Page Micro-Learning:** Lessons are broken down into digestible slides (`INTRODUCTION`, `THEORY`, `SUTRA_TECHNIQUE`, `WORKED_EXAMPLES`, `COMMON_ERRORS`, `APPLICATIONS`, `SUMMARY`, `PRACTICE_PREP`).
- **LaTeX Math Rendering:** High-speed, responsive formula rendering powered by KaTeX.

### 2. 🤖 Multimodal Socratic AI Tutor
- **5 Pedagogical Modes:** `EXPLAIN` (deep theory), `HINT` (guided hints without revealing final answers), `CHECK_ANSWER` (verifies student work), `DEEP_DIVE` (algebraic proofs), and `STEP_BY_STEP` (granular walk-throughs).
- **Visual Problem Recognition (Vision OCR):** Upload photos or screenshots of handwritten or textbook math problems; the vision pipeline verifies image clarity, extracts mathematical expressions, and confirms Vedic math domain relevance.
- **Voice Speech-to-Text (STT):** Dictate questions directly into the browser. Supported by an OpenAI Whisper bridge with an automatic Gemini multimodal audio fallback and phonetic Sanskrit harmonization.
- **Math-Aware Speech Synthesis (TTS):** Client-side audio speech synthesizer converting mathematical equations and emojis into articulate spoken English.
- **Safety & Domain Guardrails:** Rejects off-topic prompts (politics, recipes, video games, general coding) and prevents answer leakage in hint mode.

### 3. 🧮 Non-Eval Safe Math AST Verification
- **Zero Hallucination:** Mathematical expressions are evaluated using an in-house **Recursive Descent Abstract Syntax Tree (AST) Parser** rather than LLM text generation or unsafe JavaScript `eval()`.
- **High-Precision Tolerance:** Verifies user answers deterministically to within $\Delta < 10^{-5}$.

### 4. 🧠 10-Stage Deterministic In-House NLP Pipeline
A lightning-fast, self-contained NLP engine running natively inside NestJS that decomposes student queries through 10 pedagogical stages:
1. **Preprocessing & Normalization:** Unicode NFKC, slang expansion, math symbol translation, tokenization, n-grams.
2. **Levenshtein Fuzzy Spell Correction:** Matrix-based edit distance matching against a 5-part educational dictionary.
3. **Topic Detection:** Vedic calculation category mapping.
4. **Emotion Detection:** Identifies student sentiment (*Confused*, *Frustrated*, *Curious*, *Confident*, *Motivated*, *Neutral*).
5. **Learning Goal Detection:** Detects objectives (*Concept Understanding*, *Skill Practice*, *Error Analysis*, etc.).
6. **Entity Extraction:** Isolates mathematical operands, operators, and named Sutras.
7. **Intent Classification & Scoring Engine:** Weighted evidence accumulator scoring tokens, synonyms, action verbs, and context boosts across 8 intent types.
8. **Difficulty Analysis:** Linguistic and mathematical complexity categorization (*Easy*, *Medium*, *Hard*).
9. **Bloom’s Taxonomy Classification:** Cognitive depth evaluation (*Remember*, *Understand*, *Apply*, *Analyze*, *Evaluate*, *Create*).
10. **Misconception Diagnosis & Recommendations:** Identifies conceptual gaps or calculation errors and constructs actionable learning suggestions.

### 5. 🎯 Dynamic Practice & Assessment Engine
- **Procedural Generators:** Generates unique problem instances based on templates or Sutras.
- **Difficulty Progression Gates:** Automatically gates access to `EASY`, `MEDIUM`, `ADVANCED`, and `EXPERT` tiers based on demonstrated mastery and attempt thresholds.
- **Technique Selection Drills:** Conceptual challenges that train students to identify which Sutra applies best to a given calculation.

### 6. 🌳 Gamification & Motivation Economy
- **Wisdom Tree:** 5-branched visual tree reflecting mastery across Arithmetic, Speed Calculation, Algebra, Geometry, and Higher Mathematics.
- **Real-Time Daily Streaks:** Automatically tracks continuous practice days with strict UTC midnight evaluation.
- **Economy & Rewards Shop:** Earn XP, Coins, Stars, and Wisdom Stones to unlock Hint Tokens, Solution Tokens, and Retry Tokens.
- **Daily Goals & Weekly Missions:** Daily targets and multi-stage missions with claimable reward drops.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│            React 18  •  TypeScript  •  Vite  •  Tailwind CSS            │
│         Radix UI  •  Lucide Icons  •  KaTeX  •  Recharts  •  TTS        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Bearer)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              SERVER TIER                               │
│                  NestJS 11  •  Express  •  TypeScript                  │
│       Controllers  •  Services  •  Guards  •  Pipes  •  Interceptors   │
├───────────────────────────────────┬────────────────────────────────────┤
│         AI & MULTIMODAL           │         NLP & COGNITIVE            │
│  • Google Gemini 2.5 Flash SDK    │  • 10-Stage NLP Pipeline           │
│  • Whisper API / Audio Fallback   │  • Fuzzy Levenshtein Matcher       │
│  • Safe Math AST Parser           │  • Pedagogical Scoring Engine      │
│  • Domain & Hint Guardrails       │  • Misconception Diagnostics       │
├───────────────────────────────────┴────────────────────────────────────┤
│                         DATA ACCESS LAYER                              │
│                      Prisma ORM 6.10 Client Engine                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Connection Pooling / SQL
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             DATABASE TIER                              │
│                     PostgreSQL Relational Database                     │
│               20+ Relational Models, Indexes, Cascades                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack Breakdown

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Single-page reactive user interface |
| **Frontend Build Tool** | [Vite 5.4](https://vitejs.dev/) | Ultra-fast bundling with SWC compiler |
| **Styling & Components** | [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) | Responsive styling with accessible headless primitives |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) | Smooth UI transitions and micro-interactions |
| **Math Rendering** | [KaTeX](https://katex.org/) | Fast rendering of mathematical formulas and equations |
| **Data Visualization** | [Recharts 2.15](https://recharts.org/) | Accuracy trends, radar mastery, and agility graphs |
| **State & Fetching** | [TanStack React Query v5](https://tanstack.com/query) | Server state management, caching, and optimistic updates |
| **Backend Framework** | [NestJS 11](https://nestjs.com/) | Enterprise modular backend with Dependency Injection |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM 6.10](https://www.prisma.io/) | Type-safe schema migrations, relations, and data persistence |
| **Generative AI** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) | Official SDK for Gemini 2.5 Flash / Pro |
| **Speech-to-Text (STT)**| OpenAI Whisper API / Gemini Audio | Multimodal voice transcription with phonetic corrections |
| **Authentication** | Passport.js + `@nestjs/jwt` + bcrypt | Stateless JWT authorization & Google OAuth 2.0 |
| **Security & Resilience**| Helmet + Throttler | HTTP security headers and endpoint rate limiting |

---

## 📁 Repository Structure

```
Major Project/
├── Backend/                       # NestJS Application
│   ├── prisma/
│   │   ├── schema.prisma          # 20+ Prisma models and relationships
│   │   ├── migrations/            # SQL migration history
│   │   └── seed.ts                # Curriculum & canonical Sutras seed
│   ├── src/
│   │   ├── achievement/           # Badge evaluation and unlock services
│   │   ├── ai-tutor/              # AI Tutor, Gemini provider, vision, STT, AST solver
│   │   ├── auth/                  # JWT auth, Google OAuth2, bcrypt, password reset
│   │   ├── config/                # Environment validation schemas
│   │   ├── course/                # Course catalog controllers & services
│   │   ├── curriculum/            # Curriculum hierarchy & search
│   │   ├── gamification/          # Economy, daily goals, missions, rewards shop
│   │   ├── leaderboard/           # XP rankings
│   │   ├── lesson/                # Multi-page lessons & resource materials
│   │   ├── module/                # Curriculum module services
│   │   ├── nlp/                   # 10-stage NLP pipeline & scoring engine
│   │   ├── prisma/                # Global PrismaService instance
│   │   ├── progress/              # Mastery calculation, agility metrics, learning state
│   │   ├── question/              # Procedural question generators & difficulty gating
│   │   ├── sutra/                 # 16 Canonical Sutras API
│   │   ├── topic/                 # Topic services
│   │   ├── users/                 # User persistence
│   │   ├── app.module.ts          # Root NestJS module
│   │   └── main.ts                # Application bootstrap entrypoint
│   └── package.json
│
├── Frontend/                      # Vite + React Application
│   ├── src/
│   │   ├── components/            # Reusable UI & layout components (AppLayout, Navbar)
│   │   ├── data/                  # Static constants & canonical Sutra reference
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # API client (fetch wrapper with JWT injection)
│   │   ├── pages/                 # Route views (Landing, Learn, Practice, Tutor, Rewards, Progress, Dashboard)
│   │   ├── services/              # Client-side Text-To-Speech (TTS) engine
│   │   ├── App.tsx                # Client routing & layout definitions
│   │   └── main.tsx               # Client entrypoint
│   └── package.json
│
├── MAJOR_PROJECT_DOCUMENTATION.md # Comprehensive academic technical specification
└── README.md                      # Project overview & developer guide
```

---

## ⚙️ Getting Started

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or `v20.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x` or higher running locally or hosted on the cloud (e.g., Supabase / Neon / AWS RDS)
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/DTechSavvy/Vedic-Mathematics-Adaptive-Learning-Platform.git
cd Vedic-Mathematics-Adaptive-Learning-Platform
```

---

### Step 2: Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
4. Configure the environment variables in `.env`:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=1d
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dwanda?schema=public
   CLIENT_URL=http://localhost:8080
   BACKEND_URL=http://localhost:3000

   # AI Tutor Configuration
   GEMINI_API_KEY=your_actual_gemini_api_key
   AI_MODEL_NAME=gemini-2.5-flash
   AI_PROVIDER_TIMEOUT_MS=30000

   # Optional: Google OAuth 2.0
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Optional: External Whisper Service
   WHISPER_SERVICE_URL=
   WHISPER_API_KEY=
   ```
5. Apply database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Seed the database with the curriculum and 16 Vedic Sutras:
   ```bash
   npm run seed
   ```
7. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *The backend will be live at `http://localhost:3000`.*

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the frontend environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Ensure `VITE_API_URL` points to your backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
5. Launch the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:8080` (or `http://localhost:5173`).*

---

## 🔑 Environment Variables Reference

### Backend (`Backend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Yes | `3000` | Port on which the NestJS HTTP server listens |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string with credentials |
| `JWT_SECRET` | Yes | — | Secret key used for signing JWT access tokens |
| `JWT_EXPIRES_IN` | No | `1d` | Lifetime of issued JWT tokens |
| `CLIENT_URL` | Yes | `http://localhost:8080` | Allowed CORS origin for frontend requests |
| `BACKEND_URL` | No | `http://localhost:3000` | Canonical base URL for OAuth callbacks |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API Key for AI Tutor functionality |
| `AI_MODEL_NAME` | No | `gemini-2.5-flash` | Gemini model variant (`gemini-2.5-flash` or `gemini-2.5-pro`) |
| `AI_PROVIDER_TIMEOUT_MS`| No | `30000` | Maximum timeout before aborting LLM inference calls |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth Client ID for social authentication |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth Client Secret |

### Frontend (`Frontend/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3000` | Backend API base URL consumed by fetch clients |

---

## 📡 Core API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | Register new user account |
| **Auth** | `POST` | `/auth/login` | Login and obtain JWT token |
| **Auth** | `GET` | `/auth/profile` | Retrieve authenticated profile and balances |
| **Curriculum** | `GET` | `/courses` | List all active curriculum courses |
| **Curriculum** | `GET` | `/lessons/:id/pages` | Fetch multi-page lesson contents |
| **Sutras** | `GET` | `/sutras` | List all 16 canonical Vedic Sutras |
| **Practice** | `GET` | `/questions/generate/topic/:id` | Generate procedural math problem for topic |
| **Practice** | `POST` | `/questions/submit` | Submit answer, calculate XP, streak, and rewards |
| **AI Tutor** | `POST` | `/ai-tutor/message` | Socratic multimodal interactive conversation |
| **AI Tutor** | `POST` | `/ai-tutor/voice/transcribe` | Upload voice audio clip for transcription |
| **Progress** | `GET` | `/progress/state` | Authoritative learning state and recommendations |
| **Rewards** | `GET` | `/rewards/overview` | Balances, Wisdom Tree, and daily missions |
| **Rewards** | `POST` | `/rewards/use-hint` | Consume a Hint Token for step guidance |
| **NLP** | `POST` | `/nlp/analyze` | Run 10-stage NLP diagnostic on raw text |

---

## 🧪 Available Scripts

### Backend
- `npm run start:dev` — Start the development server with file watching.
- `npm run build` — Compile TypeScript to production JavaScript in `dist/`.
- `npm run seed` — Seed curriculum and Vedic Sutras into PostgreSQL.
- `npm run test` — Run Jest unit test suites.
- `npm run test:e2e` — Run end-to-end integration tests.
- `npm run lint` — Lint and format TypeScript files via ESLint.

### Frontend
- `npm run dev` — Launch Vite local development server with Hot Module Replacement.
- `npm run build` — Compile production bundle to `dist/`.
- `npm run lint` — Lint TypeScript and React JSX files.
- `npm run test` — Run component tests with Vitest.

---

## 📄 Documentation

For deep technical insights, database entity diagrams, scoring algorithms, and pedagogical theory:
- **[MAJOR_PROJECT_DOCUMENTATION.md](MAJOR_PROJECT_DOCUMENTATION.md)**: Full academic project documentation and architectural specifications.
- **[AUTH_SETUP.md](AUTH_SETUP.md)**: Step-by-step guide for setting up Google OAuth credentials.

---

## 🤝 Contributing & License

Contributions, issue reports, and feature requests are welcome!
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

This project is licensed under the **MIT License**.
