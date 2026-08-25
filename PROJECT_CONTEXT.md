# ProfitPeek — Project Context

## What it is
Upload a financial PDF → Claude extracts the income statement → interactive tables/charts. PERN stack (PostgreSQL + Express + React + Node.js). Backend and frontend are both functional and wired together.

**Project intent (stated 2026-08-25):** this is a portfolio piece meant to be Dockerized and deployed to AWS with a CI/CD pipeline, to showcase cloud infra skills — not a product being optimized for real user growth. The owner explicitly does not want ongoing AI-spend maintenance, so cost-boundedness (hard per-account caps, prepaid API balance) is a deliberate design constraint here, not premature optimization. Next planned topic (deferred): a walkthrough of the Neon/Postgres side and Prisma so the owner understands what's actually happening there — not started yet.

## Repo layout
```
FinalProject/
├── backend/           PERN backend — functional
├── frontend/          React + Vite + Tailwind frontend — functional, wired to backend/
└── media/             source logo/icon assets (copied into frontend/public/)
```
The original vanilla-JS proof of concept (`index.html`, `script.js`, `style.css`, root `server.js`/`package.json`) has been retired now that `backend/` + `frontend/` fully replace it.

## Backend (`backend/`) — status: functional
**Stack:** Node.js, Express 5, PostgreSQL (Neon, hosted), Prisma 7 (`prisma-client-js` generator — see note below), Zod, JWT (`jsonwebtoken` + `bcrypt`), Multer (PDF upload, in-memory, 15MB max), `@anthropic-ai/sdk`, `pdf-lib` (PDF page counting only, added 2026-08-25).

**Cost guardrails on `/upload` (added 2026-08-25 — see intent note above):**
- Extraction model is `claude-haiku-4-5`, not Sonnet — cheaper per call, sufficient for structured single-page extraction. Set in `uploadController.js` → `EXTRACTION_MODEL`.
- **Lifetime cap of 2 uploads per user account**, tracked via `User.uploadCount` (new Prisma field, migration `20260825132455_add_upload_count`) — incremented only on a *successful* extraction, in the same `$transaction` as the `Report` create. Deliberately **not** derived from `Report` row count, because deleting a report must not reset the cap (that'd be a free bypass). Enforced server-side in `uploadController.js` before the Claude call is ever made (so a blocked request costs $0); `GET /reports` also returns `{ uploadCount, maxUploads }` so the frontend can show/gate this without a dedicated endpoint.
- **5-page limit per PDF**, checked via `pdf-lib` (`PDFDocument.load(...).getPageCount()`) before the Claude call — rejects with 400 if exceeded. Chosen because real income-statement-only PDFs are almost always 1-2 pages; 5 leaves headroom without allowing someone to upload a full 200-page annual report to run up token cost.
- Both constants (`MAX_UPLOADS_PER_USER = 2`, `MAX_PDF_PAGES = 5`) live in `backend/src/constants.js` — shared by `uploadController.js` and `reportController.js` so they can't drift.
- Anthropic billing is prepaid (credits, hard-stops at $0, no overage risk) — worst case exposure is whatever's topped up in the console, e.g. $5. This was a deliberate risk-acceptance decision, not an oversight.

```
backend/
├── src/
│   ├── lib/
│   │   ├── prisma.js         Prisma client singleton (pg driver adapter)
│   │   └── anthropic.js      Anthropic client singleton
│   ├── middleware/
│   │   ├── auth.js           verifies JWT, sets req.userId
│   │   ├── upload.js         multer config (PDF only, 15MB limit)
│   │   └── errorHandler.js   multer errors + generic 500s
│   ├── controllers/
│   │   ├── authController.js     register, login
│   │   ├── uploadController.js   PDF → Claude tool-use extraction → creates Report
│   │   └── reportController.js   list, getOne, update, remove
│   ├── routes/            auth.routes.js, upload.routes.js, report.routes.js
│   ├── schemas/
│   │   ├── auth.schema.js
│   │   └── incomeStatement.js    shared by extraction output + PUT /reports/:id body
│   ├── utils/serializeReport.js  DB row → API response shape
│   ├── app.js
│   └── server.js
├── prisma/schema.prisma
├── prisma.config.ts
├── .env                      (gitignored — DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, PORT)
└── package.json
```

**Prisma generator note:** Prisma 7's new default generator (`provider = "prisma-client"`) emits TypeScript-only source, which a plain-CommonJS backend can't `require()`. This project deliberately uses the classic `provider = "prisma-client-js"` generator instead, which emits to `node_modules/@prisma/client` as before. Prisma 7 also requires an explicit driver adapter — `@prisma/adapter-pg` + `pg`, instantiated in `src/lib/prisma.js` — the client no longer bundles a query engine by default.

**Data model** (`backend/prisma/schema.prisma`): `User { id, email, password (bcrypt hash), reports[], uploadCount (default 0), createdAt }`, `Report { id, userId, filename, data (Json — income statement), createdAt, updatedAt }`.

**Endpoints:**
| Method | Path | Auth | Body / notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | `{ email, password }` → `{ token, userId }` |
| POST | `/auth/login` | — | `{ email, password }` → `{ token, userId }` |
| POST | `/upload` | Bearer JWT | multipart `file` (PDF, ≤5 pages) → `{ reportId, extractedData, uploadCount, maxUploads }`; 403 once `uploadCount` hits `maxUploads` (2), 400 if the PDF exceeds 5 pages |
| GET | `/reports` | Bearer JWT | → `{ reports: [...], uploadCount, maxUploads }` |
| GET | `/reports/:id` | Bearer JWT | → `{ report }` |
| PUT | `/reports/:id` | Bearer JWT | `{ companyName, period, currency, lineItems }` → `{ report }` |
| DELETE | `/reports/:id` | Bearer JWT | → 204 (does **not** decrement `uploadCount` — see cost guardrails above) |

`extractedData` / `report.extractedData` shape: `{ companyName, period, currency, lineItems: { revenue: { value, confidence }, costOfRevenue: {...}, ... } }`. Line item keys: `revenue, costOfRevenue, grossProfit, researchDevelopment, salesMarketing, generalAdministrative, operatingIncome, interestExpense, incomeTax, netIncome` (all optional — only keys actually found in the document are included).

**Not built:** `PUT /auth/password` (Settings page has a change-password form that's intentionally unwired — see its own comment in `Settings.jsx`).

**Verified working (2026-08-24):** DB connectivity, register/login/duplicate-email/wrong-password, JWT-gated `/reports` (list/404/401), and the full register→login→dashboard loop through a real browser against the live Neon DB. The `/upload` → Claude extraction call was verified to reach the Anthropic API correctly (valid model, tool schema, PDF document block) but currently fails with **"credit balance too low"** — this is an Anthropic account billing issue, not a code issue. Add credits at https://console.anthropic.com to unblock it. As of 2026-08-25 the extraction model is `claude-haiku-4-5` (was `claude-sonnet-5`); the upload/page-limit guardrails above (added same day) have not yet been exercised against a real PDF since credits are still at $0 — verify those paths once credits are added.

## Frontend (`frontend/`) — status: functional, fully wired
**Stack:** React 18, Vite, Tailwind, react-router-dom. This was already a complete, correctly-wired app when found (its `src/api/client.js` already pointed at exactly the planned backend routes) — no mock/hardcoded endpoints needed fixing.

```
frontend/
├── public/
│   ├── icon.png          favicon (copied from media/icon.png)
│   └── logo-mark.png     in-app logo badge (copied from media/profitpeek_logo_mark_light_transparent.png)
├── src/
│   ├── api/            client.js (fetch wrapper, JWT header), normalize.js (row/format helpers)
│   ├── context/         AuthContext, ReportsContext, ToastContext
│   ├── components/      Button, Input, Modal, FileUpload, Navbar, Sidebar, Card, etc.
│   ├── pages/            LoginPage, RegisterPage, Dashboard, UploadFlow, ReportDetail, ReportEditor, Settings
│   └── App.jsx
├── .env                  VITE_API_BASE=http://localhost:4000
├── Profit Peak.dc.html   Claude Design canvas source (design tool artifact, not part of the build)
├── support.js            Claude Design canvas runtime (design tool artifact, not part of the build)
└── package.json
```
The logo badge in `Sidebar.jsx` and `AuthLayout.jsx`, and the browser favicon (`index.html`), use the original ProfitPeek logo mark from `media/`.

Pages exist and are wired for: login, register, dashboard (list/search/delete reports), upload flow (upload → review extracted rows → save), report detail (view + CSV export), report editor (debounced auto-save), settings (dark mode, logout; password-change endpoint not wired).

**Upload cap UI (added 2026-08-25):** `ReportsContext` now tracks `uploadCount`/`maxUploads`/`uploadsRemaining` (from `GET /reports`, updated live from `/upload`'s response via `recordUpload()`). `Sidebar` and `Dashboard` disable their "Upload New PDF" buttons and show remaining-uploads text once the cap is hit; `UploadFlow` also self-guards (shows a "limit reached" screen) in case someone navigates to `/upload` directly by URL. `FileUpload`'s helper text now states the 5-page limit.

## Setup

**Backend:**
```bash
cd backend
npm install
# .env needs: DATABASE_URL (Neon pooled connection string), JWT_SECRET, ANTHROPIC_API_KEY, PORT
npx prisma migrate dev   # only if the schema changes
npm run dev              # http://localhost:4000
```

**Frontend:**
```bash
cd frontend
npm install
# .env needs: VITE_API_BASE=http://localhost:4000 (already set)
npm run dev               # http://localhost:5173
```

## Environment variables
| Var | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `backend/.env` | Neon pooled Postgres connection string |
| `JWT_SECRET` | `backend/.env` | signs auth tokens |
| `ANTHROPIC_API_KEY` | `backend/.env` | PDF extraction via Claude |
| `PORT` | `backend/.env` | backend port (default 4000) |
| `VITE_API_BASE` | `frontend/.env` | backend URL the frontend calls |

## Next steps
1. Add Anthropic API credits (e.g. $5, the account minimum) so `/upload` extraction actually runs (blocking, account-level). At current pricing/limits this should last well beyond what a portfolio demo needs — see cost guardrails above.
2. Manually verify the upload → review → save flow once credits are available, including the new 2-upload cap and 5-page-limit rejection paths (untested against a real PDF as of 2026-08-25).
3. Owner wants a walkthrough of Neon/Postgres + Prisma next (stated 2026-08-25) — not started.
4. Optional: `PUT /auth/password` to wire up the Settings page's change-password form.
5. Tooling: ESLint, tests.
6. Eventual: Dockerize + AWS deployment + CI/CD pipeline (the actual point of this portfolio project — not started yet).
