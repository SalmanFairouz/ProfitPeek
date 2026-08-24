# ProfitPeek — Project Context

## What it is
Upload a financial PDF → AI extracts data → interactive Chart.js charts. Currently mid-migration from a vanilla-JS proof of concept to a full PERN stack (PostgreSQL + Express + React + Node.js).

## Repo layout
```
FinalProject/
├── backend/          PERN backend (active development)
├── index.html        legacy vanilla-JS frontend (root)
├── script.js         legacy vanilla-JS frontend (root)
├── style.css         legacy vanilla-JS frontend (root)
├── server.js         legacy Gemini proxy (root, superseded by backend/)
└── media/            logo + favicon
```
The root-level vanilla files stay in place, untouched, until the frontend is rewritten in React into a new `frontend/` folder — at that point the root files should be retired.

## Backend (`backend/`)
**Stack:** Node.js, Express 5, PostgreSQL (via Neon, hosted), Prisma 7 (`prisma-client` generator, config in `prisma.config.ts`), Zod, JWT (`jsonwebtoken` + `bcrypt`), Multer (PDF upload), `@anthropic-ai/sdk` (Claude, replacing the old Gemini integration).

```
backend/
├── src/
│   ├── middleware/
│   ├── controllers/
│   ├── routes/
│   ├── schemas/
│   ├── generated/prisma/   (generated, gitignored)
│   ├── app.js               (not yet written)
│   └── server.js            (not yet written)
├── prisma/schema.prisma
├── prisma.config.ts
├── .env                      (gitignored — DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY)
└── package.json
```

**Data model** (`backend/prisma/schema.prisma`):
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt hash
  reports   Report[]
  createdAt DateTime @default(now())
}

model Report {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  filename  String
  data      Json     // extracted income statement data
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Planned endpoints:**
1. `POST /auth/register` — create user
2. `POST /auth/login` — get JWT
3. `POST /upload` — upload PDF → Claude extracts data → saves report
4. `GET /reports` — list user's reports
5. `GET /reports/:id` — get single report
6. `PUT /reports/:id` — update report
7. `DELETE /reports/:id` — delete report

**Setup still required before running:**
- Create a free Neon Postgres project, put the pooled connection string in `backend/.env` as `DATABASE_URL`
- Set `JWT_SECRET` (long random string) and `ANTHROPIC_API_KEY` in `backend/.env`
- Run `npx prisma migrate dev --name init` from `backend/` once `DATABASE_URL` is real

## Legacy frontend (root, unverified since last review)
Vanilla HTML/CSS/JS, no framework, no build tool. Chart.js (CDN) for 5 chart types. PDF upload UI exists but the file is never actually read; the Gemini call in `script.js` is broken (hardcoded API key, response written to a nonexistent DOM element). This is being superseded by the new backend rather than fixed in place — see `backend/` above.

## Roadmap
1. Build out `backend/` (auth, upload/extraction, reports CRUD)
2. Rewrite frontend in React, consuming the new backend API
3. Retire root-level vanilla files once the React frontend is live
4. Tooling: ESLint, tests
