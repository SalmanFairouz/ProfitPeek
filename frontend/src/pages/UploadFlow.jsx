import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { formatNumber, fromRows, parseMoney, toRows } from '../api/normalize';
import Button from '../components/Button';
import Card from '../components/Card';
import ConfidenceBadge from '../components/ConfidenceBadge';
import FileUpload from '../components/FileUpload';
import Input from '../components/Input';
import { SkeletonRows } from '../components/LoadingSpinner';
import { useReports } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';

const STEPS = [
  { n: 1, label: 'Upload' },
  { n: 2, label: 'Extract' },
  { n: 3, label: 'Review' },
];

const PROGRESS_MESSAGES = [
  'Uploading your document…',
  'Reading page structure…',
  'Locating the income statement table…',
  'Normalizing line items and periods…',
  'Scoring extraction confidence…',
];

export default function UploadFlow({ onUploadSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(PROGRESS_MESSAGES[0]);
  const [result, setResult] = useState(null); // { reportId, extractedData }
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ companyName: '', period: '', currency: 'USD' });
  const [saving, setSaving] = useState(false);

  const timer = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { upsertReport, uploadsRemaining, maxUploads, recordUpload } = useReports();

  useEffect(() => () => clearInterval(timer.current), []);

  /**
   * POST /upload (multipart). The request is real work, so we drive an indeterminate
   * progress bar that eases toward 95% and completes when the response lands.
   */
  const startExtraction = async () => {
    if (!file) return;
    setStep(2);
    setProgress(6);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(95, p + Math.max(0.6, (95 - p) * 0.06));
        setMessage(PROGRESS_MESSAGES[Math.min(PROGRESS_MESSAGES.length - 1, Math.floor((next / 100) * PROGRESS_MESSAGES.length))]);
        return next;
      });
    }, 180);

    try {
      const res = await api.upload(file);
      clearInterval(timer.current);
      setProgress(100);
      const extracted = res.extractedData || res.data || {};
      recordUpload(res.uploadCount);
      setResult({ reportId: res.reportId ?? res.id, extractedData: extracted });
      setRows(toRows(extracted));
      setMeta({
        companyName: extracted.companyName || res.companyName || '',
        period: extracted.period || '',
        currency: extracted.currency || 'USD',
      });
      setStep(3);
    } catch (e) {
      clearInterval(timer.current);
      toast.error(e.message || 'Extraction failed. Try re-uploading the PDF.');
      setStep(1);
      setProgress(0);
    }
  };

  const editRow = (key, raw) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, value: parseMoney(raw) } : r)));

  /** PUT /reports/:id — persists any corrections made on the review step. */
  const saveReport = async () => {
    setSaving(true);
    try {
      const payload = { ...meta, lineItems: fromRows(rows) };
      await api.updateReport(result.reportId, payload);
      upsertReport({ id: result.reportId, filename: file.name, ...meta, extractedData: payload, createdAt: new Date().toISOString() });
      toast.success('Report saved');
      onUploadSuccess?.(result.reportId);
      navigate(`/reports/${result.reportId}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (uploadsRemaining <= 0 && step === 1) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 md:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New extraction</h1>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <p className="text-base font-semibold text-slate-900">Upload limit reached</p>
          <p className="max-w-sm text-sm text-slate-500">
            This demo allows {maxUploads} PDF extractions per account to keep AI costs bounded. Your existing reports
            are still fully viewable and editable.
          </p>
          <Button className="mt-3" variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 md:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New extraction</h1>

      <ol className="flex items-center gap-3">
        {STEPS.map((s) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <li key={s.n} className="flex flex-1 items-center gap-2.5">
              <span
                aria-current={active ? 'step' : undefined}
                className={[
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-semibold',
                  active ? 'bg-brand-700 text-white' : done ? 'bg-accent-500 text-white' : 'bg-slate-200 text-slate-500',
                ].join(' ')}
              >
                {done ? '✓' : s.n}
              </span>
              <span className={`text-[13.5px] font-medium ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
              <span className={`h-0.5 flex-1 rounded ${done ? 'bg-accent-500' : 'bg-slate-200'}`} />
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <FileUpload file={file} onFile={setFile} onClear={() => setFile(null)} />
          <div className="flex items-center justify-between gap-4">
            <p className="text-[13px] text-slate-500">Files are processed in-region and removed from temp storage after extraction.</p>
            <Button size="lg" disabled={!file} onClick={startExtraction}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <Card className="flex flex-col gap-6 p-8">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-accent-500"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-[17px] font-semibold tracking-tight text-slate-900">Claude is extracting your data…</p>
              <p aria-live="polite" className="text-[13.5px] text-slate-500">
                {message}
              </p>
            </div>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-accent-500 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <SkeletonRows count={5} />
        </Card>
      ) : null}

      {step === 3 && result ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <p className="text-sm text-emerald-900">
              Extracted <strong>{rows.length} line items</strong> from {file?.name}. Correct anything that looks off, then
              save.
            </p>
            <span className="font-mono text-[13px] text-emerald-700">
              {rows.filter((r) => r.confidence < 0.9).length} to check
            </span>
          </div>

          <Card padded={false} className="overflow-hidden">
            <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
              <MetaField label="Company" value={meta.companyName} onChange={(v) => setMeta((m) => ({ ...m, companyName: v }))} />
              <MetaField label="Period" value={meta.period} onChange={(v) => setMeta((m) => ({ ...m, period: v }))} />
              <MetaField label="Currency" value={meta.currency} onChange={(v) => setMeta((m) => ({ ...m, currency: v }))} />
            </div>

            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full border-collapse">
                <caption className="sr-only">Extracted income statement line items, editable</caption>
                <thead>
                  <tr className="bg-slate-50/80">
                    <Th>Line item</Th>
                    <Th align="right">Amount ({meta.currency || 'USD'})</Th>
                    <Th align="right">Confidence</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-t border-slate-100 transition-colors hover:bg-slate-50/60">
                      <td className={`px-5 py-2.5 text-[14.5px] text-slate-700 ${row.subtotal ? 'font-semibold' : ''}`}>
                        {row.label}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <input
                          aria-label={`${row.label} amount`}
                          value={formatNumber(row.value)}
                          onChange={(e) => editRow(row.key, e.target.value)}
                          className="w-40 rounded-lg border border-transparent px-2.5 py-1.5 text-right font-mono text-sm text-slate-900 transition-colors hover:bg-slate-100 focus:border-brand-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-700/12"
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
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Discard
            </Button>
            <Button variant="accent" loading={saving} onClick={saveReport}>
              Save Report
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetaField({ label, value, onChange }) {
  return (
    <div className="bg-white px-5 py-4">
      <Input
        label={label}
        value={value}
        placeholder="—"
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return (
    <th
      scope="col"
      className={`px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}
