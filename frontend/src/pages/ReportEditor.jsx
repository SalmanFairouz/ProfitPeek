import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatNumber, fromRows, parseMoney, toRows } from '../api/normalize';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfidenceBadge from '../components/ConfidenceBadge';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { useReports } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';

const AUTOSAVE_MS = 1200;

export default function ReportEditor({ reportId: reportIdProp, onSave }) {
  const params = useParams();
  const reportId = reportIdProp || params.id;
  const navigate = useNavigate();
  const toast = useToast();
  const { upsertReport } = useReports();

  const [report, setReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ companyName: '', period: '', currency: 'USD' });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | dirty | saving | saved | error
  const [autoSave, setAutoSave] = useState(true);

  const timer = useRef(null);
  const initial = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getReport(reportId);
        const r = res?.report || res;
        if (!alive) return;
        const extracted = r.extractedData || r.data || {};
        setReport(r);
        setRows(toRows(extracted));
        setMeta({
          companyName: r.companyName || extracted.companyName || '',
          period: extracted.period || '',
          currency: extracted.currency || 'USD',
        });
        initial.current = JSON.stringify({ rows: toRows(extracted), meta });
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
      clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const persist = useCallback(async () => {
    setStatus('saving');
    try {
      const payload = { ...meta, lineItems: fromRows(rows) };
      await api.updateReport(reportId, payload); // PUT /reports/:id
      upsertReport({ id: reportId, ...meta, extractedData: payload });
      setStatus('saved');
      onSave?.(payload);
      return true;
    } catch (e) {
      setStatus('error');
      toast.error(e.message);
      return false;
    }
  }, [meta, rows, reportId, upsertReport, onSave, toast]);

  /** Debounced auto-save: any edit schedules a PUT, latest edit wins. */
  const scheduleSave = useCallback(() => {
    setStatus('dirty');
    if (!autoSave) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, AUTOSAVE_MS);
  }, [autoSave, persist]);

  const editRow = (key, raw) => {
    setRows((list) => list.map((r) => (r.key === key ? { ...r, value: parseMoney(raw) } : r)));
    scheduleSave();
  };

  const editMeta = (key, value) => {
    setMeta((m) => ({ ...m, [key]: value }));
    scheduleSave();
  };

  const statusLabel = useMemo(
    () =>
      ({
        idle: '',
        dirty: autoSave ? 'Unsaved changes…' : 'Unsaved changes',
        saving: 'Saving…',
        saved: 'Saved',
        error: 'Save failed — retry',
      })[status],
    [status, autoSave],
  );

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <LoadingSpinner size="lg" label="Loading report" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-8 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Edit report</h1>
          <p className="text-[13.5px] text-slate-500">{report?.filename}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className={`min-w-[120px] text-right text-[13px] ${
              status === 'error' ? 'text-rose-700' : status === 'saving' ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            {statusLabel}
          </span>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-brand-700"
            />
            Auto-save
          </label>
        </div>
      </div>

      <Card className="grid gap-4 sm:grid-cols-3">
        <Input label="Company name" value={meta.companyName} onChange={(e) => editMeta('companyName', e.target.value)} />
        <Input label="Period" value={meta.period} onChange={(e) => editMeta('period', e.target.value)} placeholder="Q2 2026" />
        <Input label="Currency" value={meta.currency} onChange={(e) => editMeta('currency', e.target.value)} />
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <caption className="sr-only">Editable income statement line items</caption>
            <thead>
              <tr className="bg-slate-50/80">
                <th scope="col" className="px-5 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Line item
                </th>
                <th scope="col" className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Amount ({meta.currency || 'USD'})
                </th>
                <th scope="col" className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className={`px-5 py-2.5 text-[14.5px] text-slate-700 ${row.subtotal ? 'font-semibold' : ''}`}>
                    {row.label}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <input
                      aria-label={`${row.label} amount`}
                      value={formatNumber(row.value)}
                      onChange={(e) => editRow(row.key, e.target.value)}
                      className="w-40 rounded-lg border border-slate-200 px-2.5 py-1.5 text-right font-mono text-sm text-slate-900 transition-colors focus:border-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-700/12"
                    />
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <ConfidenceBadge confidence={row.confidence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={() => navigate(`/reports/${reportId}`)}>
          Cancel
        </Button>
        <Button
          loading={status === 'saving'}
          onClick={async () => {
            clearTimeout(timer.current);
            if (await persist()) {
              toast.success('Report updated');
              navigate(`/reports/${reportId}`);
            }
          }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
