# Profit Peak — frontend

React + Vite + Tailwind. Every screen is wired to the API at `VITE_API_BASE` (defaults to `http://localhost:4000`).

## Run

```bash
npm install
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
echo "VITE_API_BASE=http://localhost:4000" > .env
npm run dev
```

If you're dropping these files into an existing app, you only need `react-router-dom` plus Tailwind, and the `theme.extend` block from `tailwind.config.js`.

## Files

```
src/
  api/client.js            fetch wrapper — JWT header, ApiError, all 7 endpoints
  api/normalize.js         extractedData ⇄ table rows, formatters, confidence tiers
  context/AuthContext.jsx  token in localStorage, login/register/logout, cross-tab sync
  context/ReportsContext.jsx  reports list cache + optimistic remove/upsert
  context/ToastContext.jsx    useToast().success/error/info
  components/              Button Input Modal FileUpload LoadingSpinner Toast
                           Navbar Sidebar Card ConfidenceBadge
                           AppLayout ProtectedRoute AuthLayout
  pages/                   LoginPage RegisterPage Dashboard UploadFlow
                           ReportDetail ReportEditor Settings
  App.jsx                  router + providers
```

## Endpoint map

| Call | Where |
| --- | --- |
| `POST /auth/login` | `AuthContext.login` ← LoginPage |
| `POST /auth/register` | `AuthContext.register` ← RegisterPage (auto-login) |
| `POST /upload` (multipart) | `UploadFlow` step 2 |
| `GET /reports` | `ReportsContext.refresh` ← Dashboard |
| `GET /reports/:id` | ReportDetail, ReportEditor |
| `PUT /reports/:id` | ReportEditor (debounced auto-save) + UploadFlow save |
| `DELETE /reports/:id` | `ReportsContext.removeReport` ← Dashboard, ReportDetail |

Any `401` clears the token, so `ProtectedRoute` bounces to `/login` on the next render.

## Response shapes it tolerates

`toRows()` accepts either nested or flat extraction payloads:

```json
{ "lineItems": { "revenue": { "value": 48250000, "confidence": 0.99 } } }
{ "revenue": 48250000 }
```

Optional fields it will use if present: `companyName`, `period`, `currency`, `createdAt`/`uploadedAt`, `fileUrl` (renders the PDF tab in an iframe), `history[]` (Edit History tab). Report ids read from `id` or `_id`.

## Notes

- Confidence badges: ≥0.95 High, ≥0.85 Check, below that Low.
- Download CSV is client-side — no backend endpoint needed.
- Responsive: permanent sidebar ≥1024px, drawer + hamburger below, bottom nav under 768px.
- `Settings` change-password calls no endpoint yet; wire it to `PUT /auth/password` when it exists.
