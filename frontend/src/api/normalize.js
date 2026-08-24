// Backend shapes vary while you're iterating; normalize once here so the UI is stable.

export const LINE_ITEM_ORDER = [
  'revenue',
  'costOfRevenue',
  'grossProfit',
  'researchDevelopment',
  'salesMarketing',
  'generalAdministrative',
  'operatingIncome',
  'interestExpense',
  'incomeTax',
  'netIncome',
];

export const LINE_ITEM_LABELS = {
  revenue: 'Revenue',
  costOfRevenue: 'Cost of revenue',
  grossProfit: 'Gross profit',
  researchDevelopment: 'Research & development',
  salesMarketing: 'Sales & marketing',
  generalAdministrative: 'General & administrative',
  operatingIncome: 'Operating income',
  interestExpense: 'Interest expense',
  incomeTax: 'Income tax',
  netIncome: 'Net income',
};

export const SUBTOTAL_KEYS = new Set(['grossProfit', 'operatingIncome', 'netIncome']);

/**
 * Accepts either { lineItems: { revenue: { value, confidence } } } or a flat
 * { revenue: 123 } map, and returns an array the tables can render directly.
 */
export function toRows(extractedData = {}) {
  const source = extractedData.lineItems || extractedData.line_items || extractedData;
  return LINE_ITEM_ORDER.filter((key) => source?.[key] !== undefined).map((key) => {
    const raw = source[key];
    const isObj = raw !== null && typeof raw === 'object';
    return {
      key,
      label: LINE_ITEM_LABELS[key] || key,
      value: Number(isObj ? raw.value : raw) || 0,
      confidence: isObj ? Number(raw.confidence ?? raw.score ?? 1) : 1,
      subtotal: SUBTOTAL_KEYS.has(key),
    };
  });
}

/** Inverse of toRows — what we PUT back to /reports/:id. */
export function fromRows(rows) {
  return rows.reduce((acc, r) => {
    acc[r.key] = { value: r.value, confidence: r.confidence };
    return acc;
  }, {});
}

export const confidenceTier = (c) => (c >= 0.95 ? 'high' : c >= 0.85 ? 'medium' : 'low');

export const CONFIDENCE_STYLES = {
  high: { label: 'High', className: 'bg-emerald-50 text-emerald-700' },
  medium: { label: 'Check', className: 'bg-amber-50 text-amber-700' },
  low: { label: 'Low', className: 'bg-rose-50 text-rose-700' },
};

export const formatMoney = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(n) || 0);

export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);

export const parseMoney = (s) => Number(String(s).replace(/[^0-9.-]/g, '')) || 0;

export const formatDate = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatBytes = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};
