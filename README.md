# ProfitPeek

Upload a financial PDF, Claude extracts the income statement, review and save it as a report.

See [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) for full architecture, status, and API details.

## Quick start

**Backend** (`backend/`) — needs `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY` in `backend/.env`:
```bash
cd backend
npm install
npm run dev      # http://localhost:4000
```

**Frontend** (`frontend/`):
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```
