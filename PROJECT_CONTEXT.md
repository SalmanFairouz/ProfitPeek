# ProfitPeek — Project Context

## What it is
Vanilla HTML/CSS/JS app. Goal: upload a financial PDF → AI extracts data → interactive Chart.js charts. **The PDF→AI pipeline is not working yet.** Currently just shows hardcoded demo data.

## Stack
- Vanilla JS (ES6+), HTML5, CSS3 — no framework, no build tool, no npm
- Chart.js (CDN) — bar, line, pie, doughnut, radar charts
- Google Gemini API v1beta — scaffolded but broken
- Google Fonts (Poppins)

## File Map
| File | Purpose |
|---|---|
| `index.html` | Layout, 5 chart canvases, hardcoded data tables |
| `script.js` | Tab switching, file upload, Gemini call, Chart.js setup |
| `style.css` | All styling, responsive at 900px |
| `media/` | Logo + favicon |

## What Works / What Doesn't
| Feature | Status |
|---|---|
| Demo/Reset buttons | Working |
| Dashboard/Data tab toggle | Working |
| 5 charts + 5 tables | Working (hardcoded data) |
| PDF upload UI | UI only — file is never read |
| Gemini AI call | Broken (see bugs) |
| Dynamic charts from PDF | Not implemented |

## Known Issues
- **API key still in client-side code** — `script.js` has the Gemini key as a plain string. Needs a backend proxy to fix properly (Phase 3 of roadmap). Rotate the key at Google Cloud Console if it was ever committed publicly.
- **No PDF parsing** — Gemini receives only a filename placeholder, not real content. Blocked until PDF.js is added (Phase 2).

## Roadmap
1. **Fix bugs above** (prerequisite for everything)
2. **Add PDF.js** for client-side text extraction
3. **Build backend proxy** to keep API key server-side + add rate limiting
4. **Dynamic charts** — replace hardcoded data with AI-parsed JSON
5. **Tooling** — Vite, TypeScript, ESLint, tests
6. **UX** — loading states, error messages, chart export

## AI Integration Plan (future)
Architecture: `PDF.js → backend proxy → Gemini/Claude (JSON mode) → Chart.js`
- Use structured output / JSON mode so chart data is predictable
- Claude claude-sonnet-4-6 or Gemini 2.0 Flash are good model choices
- Define a strict JSON schema for the AI response before prompting
