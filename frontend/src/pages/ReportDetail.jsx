import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { formatDate, formatMoney, toRows } from '../api/normalize';
import Button from '../components/Button';
import Card, { CardStat } from '../components/Card';
import ConfidenceBadge from '../components/ConfidenceBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useReports } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'data', label: 'Extracted Data' },
  { key: 'pdf', label: 'Original PDF' },
  { key: 'history', label: 'Edit History' },
];

export default function ReportDetail({ reportId: reportIdProp }) {
  const params = useParams();
  const reportId = reportIdProp || params.id;
  const navigate = useNavigate();
  const toast = useToast();
  const { removeReport } = useReports();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('data');
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getReport(reportId); // GET /reports/:id
      setReport(res?.report || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const base = toRows(report?.extractedData || report?.data || {});
    if (!sort.key) return base;
    return [...base].sort((a, b) =>
      sort.key === 'label' ? a.label.localeCompare(b.label) * sort.dir : (a.value - b.value) * sort.dir,
    );
  }, [report, sort]);

  const byKey = (key) => rows.find((r) => r.key === key)?.value ?? 0;
  const currency = report?.extractedData?.currency || 'USD';
  const margin = byKey('revenue') ? ((byKey('netIncome') / byKey('revenue')) * 100).toFixed(1) : '0.0';

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeReport(reportId); // DELETE /reports/:id
      toast.success('Report deleted');
      navigate('/dashboard', { replace: true });
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  };

  /** Client-side CSV export of the extracted table — no backend endpoint needed. */
  const handleDownload = () => {
    const csv = [
      ['Line item', `Amount (${currency})`, 'Confidence'],
      ...rows.map((r) => [r.label, r.value, r.confidence]),
    ]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(report?.filename || 'report').replace(/\.pdf$/i, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <LoadingSpinner size="lg" label="Loading report" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <Card className="flex flex-col items-center gap-3 text-center">
          <p className="text-base font-semibold text-slate-900">We couldn’t load this report</p>
          <p className="text-sm text-slate-500">{error || 'It may have been deleted.'}</p>
          <div className="mt-2 flex gap-2.5">
            <Button variant="secondary" onClick={load}>
              Retry
            </Button>
            <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 py-8 md:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">
            {report.companyName || report.company || 'Untitled company'}
          </h1>
          <p className="text-[13.5px] text-slate-500">
            {report.filename} · uploaded {formatDate(report.createdAt || report.uploadedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/reports/${reportId}/edit`)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            Download CSV
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div role="tablist" aria-label="Report views" className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={[
              'h-11 border-b-2 px-4 text-[14.5px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
              tab === t.key ? 'border-brand-700 font-semibold text-brand-700' : 'border-transparent font-medium text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'data' ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            <CardStat label="Revenue" value={formatMoney(byKey('revenue'), currency)} />
            <CardStat label="Gross profit" value={formatMoney(byKey('grossProfit'), currency)} />
            <CardStat label="Operating income" value={formatMoney(byKey('operatingIncome'), currency)} />
            <CardStat label="Net margin" value={`${margin}%`} />
          </div>

          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <caption className="sr-only">Extracted income statement</caption>
                <thead>
                  <tr className="bg-slate-50/80">
                    <SortableTh onClick={() => toggleSort('label')} active={sort.key === 'label'} dir={sort.dir}>
                      Line item
                    </SortableTh>
                    <SortableTh align="right" onClick={() => toggleSort('value')} active={sort.key === 'value'} dir={sort.dir}>
                      Amount ({currency})
                    </SortableTh>
                    <th scope="col" className="px-5 py-3 text-right text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-t border-slate-100 transition-colors hover:bg-slate-50/60">
                      <td className={`px-5 py-3 text-[14.5px] text-slate-700 ${row.subtotal ? 'font-semibold' : ''}`}>
                        {row.label}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[14.5px] text-slate-900">
                        {row.value.toLocaleString('en-US')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ConfidenceBadge confidence={row.confidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'pdf' ? (
        <Card className="flex flex-col items-center gap-4 p-6">
          {report.fileUrl ? (
            <iframe
              title={`${report.filename} preview`}
              src={report.fileUrl}
              className="h-[70vh] w-full max-w-2xl rounded-xl border border-slate-200"
            />
          ) : (
            <div className="grid aspect-[8.5/11] w-full max-w-xl place-items-center rounded-xl border border-slate-200 bg-slate-50 text-center">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-slate-400">Original PDF</span>
                <span className="text-[13.5px] text-slate-400">
                  Return a <code>fileUrl</code> on GET /reports/:id to preview it here.
                </span>
              </div>
            </div>
          )}
          <p className="text-[13px] text-slate-500">Source document, unmodified. Extraction never edits the original.</p>
        </Card>
      ) : null}

      {tab === 'history' ? (
        <Card>
          {(report.history || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No edits recorded yet. Changes you save from the editor will appear here.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-slate-100">
              {report.history.map((h, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-[14.5px] text-slate-700">
                    {h.field} → <span className="font-mono">{h.value}</span>
                  </span>
                  <span className="text-[13px] text-slate-500">{formatDate(h.at)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      ) : null}

      <Link to="/dashboard" className="text-[13.5px] font-medium text-brand-700 hover:text-emerald-700">
        ← Back to dashboard
      </Link>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this report?"
        description={`“${report.filename}” and its extracted figures will be permanently removed. This cannot be undone.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="dangerSolid" loading={deleting} onClick={handleDelete}>
              Delete report
            </Button>
          </>
        }
      />
    </div>
  );
}

function SortableTh({ children, onClick, active, dir, align = 'left' }) {
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === 1 ? 'ascending' : 'descending') : 'none'}
      className={`px-5 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-slate-700">
        {children}
        <span aria-hidden="true">{active ? (dir === 1 ? '↑' : '↓') : ''}</span>
      </button>
    </th>
  );
}
