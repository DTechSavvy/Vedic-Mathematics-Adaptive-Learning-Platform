# DWANDA — Project State Audit

**Date:** 2026-08-31  
**Mode:** Analysis only (no implementation in this pass)  
**Repos in workspace:** `Backend/` (NestJS), `vedic-math-ai-tutor/` (Vite + React frontend, branded **VedicMind**)

This report describes what exists in the repository today. It does not rewrite architecture. Schema changes are listed only where they are genuinely required for correctness or the stated final architecture.

---

## A. EXISTING AND WORKING

### A.1 Folder structure (high level)

```
Major Project/
  Backend/                 NestJS API + Prisma
    prisma/                schema, migrations, seed
    src/
      auth/                JWT register/login/profile
      users/               user persistence (no HTTP controller)
      course/, module/, topic/, lesson/
      question/            generators + explanations + submit
      progress/            analytics + simple recommendation
      leaderboard/
      achievement/         service only (no controller)
      ai-tutor/            rule-based tutor orchestration
      nlp/                 full modular NLP pipeline
      prisma/              PrismaModule / PrismaService
  vedic-math-ai-tutor/     Vite React UI (demo / mock)
```

There is no Docker, no CI workflow, no shared monorepo package, and no root `package.json`.

### A.2 NestJS modules (registered in `app.module.ts`)

| Module | Role |
|---|---|
| `PrismaModule` | PostgreSQL via Prisma |
| `AuthModule` | Register, login, JWT |
| `UsersModule` | `findByEmail`, `createUser` |
| `CourseModule` | `GET /courses` |
| `ModuleModule` | `GET /courses/:id/modules` |
| `TopicModule` | `GET /modules/:id/topics` |
| `LessonModule` | `GET /topics/:id/lessons`, `GET /lessons/:id` |
| `QuestionModule` | Generate + submit |
| `ProgressModule` | Authenticated progress analytics |
| `LeaderboardModule` | Top 10 by XP |
| `AchievementModule` | Unlock-on-submit (no HTTP API) |
| `AiTutorModule` | Profile-based tutor response |
| `NlpModule` | `POST /nlp/analyze` + golden tests |

### A.3 Controllers and API routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | None | Nest hello |
| POST | `/auth/register` | None | DTO validated |
| POST | `/auth/login` | None | Returns `access_token` |
| GET | `/auth/profile` | JWT | `{ userId, email }` only |
| GET | `/courses` | None | All courses |
| GET | `/courses/:id/modules` | None | |
| GET | `/modules/:id/topics` | None | |
| GET | `/topics/:id/lessons` | None | Seed never creates lessons |
| GET | `/lessons/:id` | None | |
| GET | `/questions/generate/:templateId` | JWT | Stores `GeneratedQuestion` |
| POST | `/questions/submit` | **None** | Updates XP/level/streak/mastery |
| GET | `/progress/me` | JWT | Aggregate accuracy |
| GET | `/progress/topics` | JWT | Per-topic mastery |
| GET | `/progress/recommendation` | JWT | Weakest topic |
| GET | `/progress/speed` | JWT | |
| GET | `/progress/speed-improvement` | JWT | Needs ≥10 attempts |
| GET | `/progress/topic-analytics` | JWT | |
| GET | `/progress/mental-agility` | JWT | Weighted accuracy/speed |
| GET | `/leaderboard` | None | Top 10 XP |
| POST | `/ai-tutor/generate-response` | None | Body is a `StudentProfile` |
| POST | `/ai-tutor/:userId` | None | Builds profile from DB |
| POST | `/nlp/analyze` | None | Full NLP analysis |
| POST | `/nlp/testing/golden` | None | Runs golden dataset |

### A.4 Services that are implemented and used

**Auth / users**

- `AuthService` — bcrypt hash, JWT sign (`expiresIn: 1d`)
- `JwtStrategy` — Bearer token → `{ userId, email }`
- `JwtAuthGuard`
- `UsersService`

**Curriculum**

- `CourseService.findAll`
- `ModuleService.getModules`
- `TopicService.getTopics`
- `LessonService.getLessons` / `getLesson`

**Question engine (deterministic answers given operands)**

- `QuestionService.generateQuestion` — switch on `templateType`
- Generators for: addition without carry, Nikhilam subtraction, dot-method addition, base/Urdhva/series-1s/series-9s multiplication, squares ending 5, square base method, Dwandwa Yoga, Yavadunam cube, √2 (fixed answer), fraction +/−, vinculum-style division, Baudhayana, quadratic factor, π circumference, circling a square
- `QuestionService.submitAnswer` — string equality check, XP (10 correct / 2 incorrect + 5 speed bonus if ≤10s), level (`floor(xp/100)+1`), streak vs `lastActiveDate`, topic mastery upsert (≥80% → `completed`), first-correct achievement
- `ExplanationService` — rule-based Vedic-style explanations for the same template types (not an LLM)

**Progress / adaptive (rule-based)**

- `ProgressService` — accuracy, topic mastery, weakest-topic recommendation, speed stats, speed improvement, topic analytics, mental agility score
- `StudentProfileBuilderService` — mastery, accuracy, time, weak/strong topics, recent mistakes
- `AiTutor` recommendation / study planner / motivation — heuristic strings

**Gamification**

- XP / level / streak persisted on `User` at submit time
- `LeaderboardService` — Prisma `orderBy xp desc take 10`
- `AchievementService.unlockAchievement` — idempotent by `(userId, title)`

**NLP (do not rewrite)**

Working pipeline in `NLPOrchestratorService`:

1. Preprocessing  
2. Topic detection  
3. Emotion  
4. Learning goal  
5. Intent classification (uses `ScoringEngineService`)  
6. Entity extraction  
7. Difficulty  
8. Bloom taxonomy  
9. Misconception  
10. Recommendation builder  

Supporting pieces: fuzzy matcher, keyword/synonym/pattern constants, golden dataset + `GoldenTestService`.

Public façade: `NLPService.analyze(text)`.

**AI tutor (rule-based, not RAG)**

- `AiTutorService.generateTutorResponse` / `generateTutorResponseForUser`
- `DoubtSolverService` — placeholder string (comments mention Gemini/OpenAI/local LLM; none called)
- `MistakeAnalyzerService` — rule-based for two topics; default generic
- `StudyPlannerService`, `RecommendationService`, `MotivationService`

### A.5 DTOs / interfaces / enums (existing — reuse these)

**DTOs**

- `RegisterDto`, `LoginDto` (class-validator)
- `SubmitAnswerDto` (`questionId`, `answer`) — **no validators**
- `AnalyzeTextDto` (`text`) — **no validators**

**AI tutor interfaces**

- `StudentProfile`
- `TutorResponse`

**NLP** — large set already present (`NLPAnalysis`, intent/topic/emotion/bloom/difficulty/misconception/entity results, section interfaces). Enums: `IntentType`, `EmotionType`, `LearningGoal`, `BloomLevel`, `DifficultyLevel`, `MisconceptionType`.

**Prisma enum:** `Difficulty { EASY, MEDIUM, HARD }` (separate from NLP `DifficultyLevel`).

### A.6 Prisma / PostgreSQL

Models: `User`, `Course`, `Module`, `Topic`, `Lesson`, `QuestionTemplate`, `GeneratedQuestion`, `QuestionAttempt`, `UserProgress`, `Achievement`.

Migrations exist from init through achievements (see section D).

Seed creates one course **Vedic Mathematics**, five modules, topics, and one `QuestionTemplate` per many practice topics.

### A.7 Frontend pages / UI (working as a demo)

Routes in `vedic-math-ai-tutor/src/App.tsx`: `/`, `/auth`, `/dashboard`, `/learn`, `/practice`, `/tutor`, `/progress`, `/rewards`.

Layout: `AppLayout` sidebar (VedicMind branding). shadcn/ui + Tailwind + Recharts + Framer Motion.

Static knowledge: `src/data/vedic-sutras.ts` — **6 sutras** (not 16).

### A.8 What is already installed but unused in source

Backend `package.json` includes `@nestjs/config`, `@nestjs/mongoose`, `mongoose`, `redis`, `@nestjs/platform-socket.io`, `@nestjs/websockets`. **None of these appear in application TypeScript** (no `MongooseModule`, no Redis client, no gateway, no `ConfigModule`).

---

## B. PARTIALLY IMPLEMENTED

| Area | What exists | What is incomplete |
|---|---|---|
| Auth | Register/login/JWT | No refresh tokens; profile omits name/xp/level/streak; JWT secret not loaded via ConfigModule; no CORS for SPA |
| Curriculum APIs | Course → module → topic → lesson | Lessons never seeded; no pagination; no auth on catalog; syllabus ≠ target 9-unit outline |
| Question engine | Many generators + explanations | `Math.random` operands (answers are computed, not LLM); submit not JWT-guarded; no hint tracking; answer compare is exact string; `GeneratedQuestion.templateId` has **no Prisma relation/FK** |
| Progress / adaptive | Analytics + weakest-topic text | Does not choose next **difficulty** or next **template**; ignores hints; NLP difficulty unused |
| XP / streak | Updated on submit | Not cached in Redis; streak calendar logic is day-diff only; no leaderboard invalidation |
| Achievements | One unlock path (“First Steps”) | No catalog, no GET API, no Firebase events |
| Leaderboard | Postgres top 10 | No Redis cache, no Firebase realtime, unauthenticated |
| AI tutor | Orchestrator + profile builder | Doubt solver is a stub; **NLP not imported**; no `AITutorProvider`; no RAG; `POST :userId` unauthenticated |
| NLP | Full pipeline + golden tests | Not wired to tutor/question/adaptive; analyze + golden endpoints open; embeddings not present |
| Production hardening | Global `ValidationPipe()` | No whitelist/transform config; no Helmet; no rate limit; no health/readiness; no graceful shutdown; listen port **hardcoded 5000** vs `.env PORT=3000`; no structured logger; no exception filter |
| Frontend | Full UI | **Zero HTTP calls** to Nest; demo auth; mock stats/practice/tutor |
| Mongo / Redis / Firebase | Env keys / unused npm packages | **No modules, schemas, or clients** |
| Tests | Nest `*.spec.ts` for several modules; NLP golden set | Frontend test is a placeholder; e2e unused for product flows |

---

## C. MISSING (required for the stated final architecture)

Do **not** recreate existing NLP/question/progress modules. Add only the gaps below.

1. **Vedic Knowledge Base (MongoDB)** — 16 sutras, 13 sub-sutras, methods, rules, examples, applicability, templates metadata, prerequisites, aliases. Map sutras → existing syllabus topics (do not create 16 course modules).
2. **Mongoose connection + collections** — packages installed, never wired.
3. **Sutra ↔ Topic mapping** — Postgres topics vs Mongo knowledge vs frontend 6-sutra list vs NLP `VEDIC_TOPICS` (9 names) are four different taxonomies.
4. **Semantic embeddings + retrieval** — not started.
5. **`AITutorProvider` abstraction** — `generateAnswer()` / `generateHint()`; Gemini / local / future providers. Application must not hard-code a model.
6. **RAG tutor path** — NLP analysis → retrieve KB → provider generate; LLM never source of truth for arithmetic (engine already follows this for practice answers).
7. **Redis module** — leaderboard/XP/streak cache, short AI cache, optional rate-limit counters. Not a system of record.
8. **Firebase Admin** — leaderboard sync, notifications, achievement/level-up events only.
9. **Deterministic adaptive policy** — next difficulty / next topic / revision / challenge from accuracy, attempts, time, hints, mastery. Keep rule-based (no fake ML).
10. **Hint model** — attempts do not record hints used (needed for adaptive later; small Prisma field if implemented).
11. **Frontend API layer** — `fetch`/`axios` client, JWT storage, CORS, env `VITE_API_URL`.
12. **Production bootstrap** — `ConfigModule` + env validation, CORS, Helmet, throttler, health, shutdown hooks, indexes, pagination on list endpoints.
13. **Achievement HTTP API** and catalog vs frontend badge list.
14. **Lesson content** — table exists; seed does not populate.
15. **Deployment** — no Docker, no compose, no CI, READMEs are Nest/Lovable templates.

---

## D. DATABASE STATE

### D.1 Current Prisma models and relationships

```
User 1──* Achievement
User 1──* QuestionAttempt
User 1──* UserProgress
User 1──* GeneratedQuestion

Course 1──* Module 1──* Topic 1──* Lesson
Topic 1──* QuestionTemplate 1──* QuestionAttempt
Topic 1──* UserProgress
UserProgress @@unique([userId, topicId])

GeneratedQuestion 1──* QuestionAttempt  (optional generatedQuestionId)
```

`GeneratedQuestion.templateId` is an `Int` **without** a Prisma relation to `QuestionTemplate`. Submit still loads the template by that id.

### D.2 Fields already covering transactional concerns

- User identity + password hash, `xp`, `level`, `streak`, `lastActiveDate`
- Course / module / topic / lesson
- Question templates (type, difficulty, min/max, explanation)
- Generated questions (text, correct answer, `isAnswered`)
- Attempts (user/correct answers, `isCorrect`, `timeTakenSeconds`)
- Topic mastery + `completed`
- Per-user achievement rows

### D.3 Missing transactional fields / models (only if genuinely required)

| Item | Why | Recommendation |
|---|---|---|
| `GeneratedQuestion` → `QuestionTemplate` FK | Integrity; orphan `templateId` possible | Small, justified schema fix when touching questions |
| `QuestionAttempt.hintsUsed` (or similar) | Adaptive spec uses hints | Add **when** hints are implemented, not before |
| Indexes on `QuestionAttempt(userId, createdAt)`, `User(xp)`, `UserProgress(userId)` | High-frequency queries today scan without `@@index` | Add indexes; no model redesign |
| Unique `(userId, title)` on `Achievement` | Race on double submit | Optional unique index |
| Role / admin | Not in schema | Not required unless admin APIs are added |
| Coins / mastery stones / speed stars / wisdom tree | Frontend-only | **Do not** add to Postgres unless product explicitly wants those currencies; XP/level/streak already exist |
| Sutra documents | Flexible knowledge | **MongoDB**, not Prisma |
| Chat history | Optional for tutor | Only if persistence is required; not a blocker for first RAG |

**Do not** move User, Course, progress, attempts, XP, or leaderboard **source of truth** into MongoDB.

### D.4 Migrations

| Migration | Intent |
|---|---|
| `20260603194147_init` | User |
| `20260605073529_add_gamification_fields` | xp/level/streak |
| `20260606101042_learning_system` | Course/Module/Topic/Lesson |
| `20260607152134_question_engine` | QuestionTemplate |
| `20260615080514_generated_question` | GeneratedQuestion |
| `20260615090957_question_attempt` | QuestionAttempt |
| `20260616061751_user_progress_unique` | UserProgress unique |
| `20260616163549_add_time_tracking` | timeTakenSeconds |
| `20260625072832_add_streak_tracking` | lastActiveDate |
| `20260625091304_add_achievements` | Achievement |

### D.5 Seed vs intended syllabus

Seed modules:

1. Introduction to Vedic Mathematics  
2. High Speed Addition and Subtraction  
3. Miracle Multiplication and Excellent Division  
4. Lightning Squares and Rapid Cubes  
5. Algebra and Geometry  

Target architecture modules (Introduction, Addition, Subtraction, Multiplication, Division, Square Root, Cube & Cube Root, LCM & HCF, Mental Reasoning) **do not match 1:1**. Algebra/Geometry and combined add/sub and mul/div units exist instead of LCM/HCF and Mental Reasoning.

**Do not** mass-rename modules in Prisma unless product owners require the 9-unit outline. Map knowledge-base sutras onto **existing** topics.

Lessons: **zero seeded rows**.

---

## E. DUPLICATION / CONFLICTS / DEAD CODE

### E.1 Overlapping recommendation logic

Three independent recommenders:

- `ProgressService.getRecommendation`
- `ai-tutor/services/recommendation.service.ts`
- `nlp/services/recommendation-builder.service.ts`

Reuse rather than adding a fourth. Wire NLP + progress into the tutor; keep HTTP `/progress/recommendation` for backward compatibility.

### E.2 Duplicate “AI tutor” on the frontend

`TutorPage` uses **local keyword replies** (`getLocalResponse`). Backend tutor is a different contract (`TutorResponse` with feedback/recommendation/studyPlan/motivation), not a chat transcript. Integration must pick one UX and map APIs—do not invent a second tutor module.

### E.3 Taxonomy conflicts

| Source | Content |
|---|---|
| Frontend `vedic-sutras.ts` | 6 sutras |
| NLP `VEDIC_TOPICS` | 9 technique names |
| Prisma seed | Topic titles (methods + history + algebra) |
| Product spec | 16 sutras + 13 sub-sutras mapped to syllabus |

Frontend Learn page treats sutras as the course. Backend treats **topics** as the course. Final build must map, not fork.

### E.4 Branding / naming

UI: **VedicMind**. Product name: **DWANDA**. Backend: generic Nest starter README.

### E.5 Difficulty enums

Prisma `Difficulty` vs NLP `DifficultyLevel` — keep both; map at boundaries.

### E.6 Mistake analysis gap

`StudentProfileBuilderService` always calls `analyzeMistake('General', ...)`, so Nikhilam/addition-specific branches in `MistakeAnalyzerService` **never run**.

### E.7 Dead / unused

- Installed: mongoose, redis, socket.io, `@nestjs/config` (unused)
- Frontend: `pages/Index.tsx` unused in router; large unused shadcn set (acceptable)
- `AchievementModule` has no controller
- `UsersModule` has no controller (OK if only used by auth)
- NLP exports unused by `AiTutorModule`
- Debug `console.log` in `submitAnswer`

### E.8 Inconsistent DTOs / security

- Auth DTOs validated; `SubmitAnswerDto` / `AnalyzeTextDto` are not
- Generate requires JWT; submit does not (anyone can score any `questionId`)
- `POST /ai-tutor/:userId` has no auth (IDOR)
- Golden NLP endpoint is open

### E.9 Question vs frontend practice

Backend templates (e.g. `ADD_WITHOUT_CARRY`) ≠ frontend hardcoded Nikhilam/Urdhva/Ekadhikena problems. Connecting Practice without mapping will look like a different product.

---

## F. FRONTEND STATE

### F.1 Pages / components

| Route | Data source |
|---|---|
| Landing | Static marketing |
| Auth | Form + toast; **demo navigate**, no API |
| Dashboard | Hardcoded stats (3/16 sutras, 5-day streak, 87%, coins 250, …) + first 3 static sutras |
| Learn | `sutras[]` local file |
| Practice | 5 hardcoded problems; local score/streak |
| Tutor | Keyword markdown replies |
| Progress | Hardcoded Recharts data + advice |
| Rewards | Hardcoded badges / tree / currencies |

No `src/api`, no React Query usage against Nest, no `VITE_` API URL in `vite-env.d.ts`.

### F.2 APIs already connected

**None.**

### F.3 Mock data still in use

All authenticated product surfaces. Auth comment: “Demo mode — navigate to dashboard”. Tutor comment: “Local AI responses for demo (will be replaced with Cloud AI)”.

---

## G. DEPENDENCIES

### G.1 Backend — installed (selected)

`@nestjs/common/core/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/mongoose`, `mongoose`, `@prisma/client`, `prisma`, `bcrypt`, `class-validator`, `class-transformer`, `redis`, `@nestjs/websockets`, `@nestjs/platform-socket.io`, `rxjs`.

Dev: Jest, ESLint, Prettier, ts-node, etc.

### G.2 Frontend — installed (selected)

React 18, Vite, react-router-dom, TanStack Query, Zod, react-hook-form, Tailwind, Radix/shadcn, Recharts, react-markdown, framer-motion. **No Firebase client, no axios.**

### G.3 Packages still required (exact, for final architecture)

Install **when that slice is implemented**, not all at once:

| Package | Why |
|---|---|
| `helmet` | Security headers |
| `@nestjs/throttler` | Rate limiting |
| `@nestjs/terminus` | Health/readiness |
| `joi` **or** `zod` | Env validation with `ConfigModule` |
| `firebase-admin` | Server notifications / RTDB or FCM (selective) |
| LLM SDK **behind provider only** e.g. `@google/generative-ai` | Gemini implementation of `AITutorProvider` |
| Embedding lib **or** provider embeddings API | RAG (choose one stack when implementing retrieval) |

**Already present — wire, do not reinstall:** `mongoose`, `@nestjs/mongoose`, `redis`, `@nestjs/config`.

**Optional / not required yet:** Socket.IO (Firebase chosen for realtime in the spec), `ioredis` (current `redis` v6 is enough), frontend `firebase` (only if the browser listens to RTDB).

---

## H. ENVIRONMENT VARIABLES

**Never log or commit secret values.** Names observed in `Backend/.env` (values omitted):

| Variable | Present | Used in code today |
|---|---|---|
| `PORT` | Yes | **No** (`main.ts` uses `5000`) |
| `JWT_SECRET` | Yes | Yes (`auth.module`, `jwt.strategy`) |
| `DATABASE_URL` | Yes | Prisma |
| `MONGO_URI` | Yes | **No** |
| `REDIS_HOST` | Yes | **No** |
| `REDIS_PORT` | Yes | **No** |

No `.env.example` in the repo.

### Missing for final deployment (names only)

- `NODE_ENV`
- `CORS_ORIGIN` (frontend origin)
- `JWT_EXPIRES_IN` (optional; currently hardcoded `1d`)
- `MONGODB_URI` (or keep `MONGO_URI` and document it — do not add a second unused name)
- `REDIS_URL` or `REDIS_PASSWORD` (if hosted Redis)
- `AI_TUTOR_PROVIDER` (`local` \| `gemini` \| …)
- Provider keys only as needed, e.g. `GEMINI_API_KEY` — never hard-code
- `AI_PROVIDER_TIMEOUT_MS`, retry counts
- Firebase: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (or `GOOGLE_APPLICATION_CREDENTIALS`)
- Frontend: `VITE_API_URL`
- Optional: `LOG_LEVEL`

`ConfigModule` is installed but not loading these. JWT currently depends on process env at module init (fragile if `.env` is not loaded).

---

## I. FINAL BUILD PLAN (shortest safe order)

Reuse existing modules. No NLP rewrite. No moving transactional data to Mongo. No fake deep learning.

### 1. Blockers (do first)

1. **`ConfigModule` + `.env.example` + env validation** — single source for `PORT`, `JWT_SECRET`, `DATABASE_URL`. Fix listen-port vs `PORT` mismatch.  
2. **CORS** for the Vite origin.  
3. **Guard `POST /questions/submit` and `POST /ai-tutor/:userId` with JWT**; ignore body `userId` in favor of `req.user`.  
4. **ValidationPipe** `{ whitelist, forbidNonWhitelisted, transform }` + validators on submit/analyze DTOs.

### 2. Core end-to-end (product loop)

5. **Frontend auth** — register/login against existing APIs, store JWT, send `Authorization`.  
6. **Wire catalog** — `GET /courses` → modules → topics (Learn can stay sutra-oriented later via mapping).  
7. **Wire practice** — generate by `templateId` + submit; show `explanation` from backend; persist XP/streak from response.  
8. **Wire dashboard/progress/leaderboard** to existing progress + leaderboard APIs.

### 3. AI / knowledge

9. **Mongo knowledge module** — schemas + seed 16 sutras / 13 sub-sutras / methods, **mapped to existing Topic ids/titles**.  
10. **`AITutorProvider` interface** + one implementation (start with Gemini **or** a thin local stub that still uses retrieved facts + NLP; arithmetic stays in the question engine).  
11. **Tutor chat endpoint** that: NLP analyze → retrieve KB → provider `generateAnswer`/`generateHint`. Keep existing `generate-response` for profile coaching if the UI still needs it.  
12. **Embeddings + retrieval** after a working retrieve-by-topic path (keyword/topic id first is acceptable).

### 4. Infrastructure

13. Redis cache for leaderboard (Postgres remains source of truth).  
14. Helmet, throttler, Terminus health, Prisma disconnect / shutdown hooks.  
15. Indexes on hot queries.  
16. Firebase **only** for live leaderboard / achievement pings after HTTP path works.

### 5. Frontend integration (remaining)

17. Replace Learn static sutras with KB or mapped topics.  
18. Replace Tutor `getLocalResponse`.  
19. Align branding (DWANDA vs VedicMind) when product decides.  
20. Adaptive next-question using progress + template difficulty (deterministic rules).

### 6. Deployment

21. Docker Compose: API + Postgres + Redis + (Mongo or Atlas URI).  
22. Health checks, no secrets in image, frontend `VITE_API_URL`.  
23. Populate lessons or serve lesson text from Mongo KB to avoid empty Learn content.

**Avoid:** rewriting NLP; replacing Prisma question engine with LLM math; adding 16 Prisma courses for 16 sutras; Redis-only XP; Firebase as primary DB.

---

## Snapshot: working vs gap

| Layer | Status |
|---|---|
| Nest + Prisma learning/gamification core | **Substantial and usable via HTTP** |
| NLP pipeline | **Implemented, isolated** |
| Question generation + rule explanations | **Implemented** |
| AI tutor / RAG / embeddings | **Stub / missing** |
| Mongo KB / Redis / Firebase | **Missing in code** |
| Frontend | **UI complete, fully mocked** |
| Production ops | **Minimal** |

---
