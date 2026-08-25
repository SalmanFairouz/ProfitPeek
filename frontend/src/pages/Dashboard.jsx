import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card, { CardStat } from '../components/Card';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { formatDate, formatMoney, toRows } from '../api/normalize';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';

const idOf = (r) => String(r.id ?? r._id);

export default function Dashboard() {
  const { user } = useAuth();
  const { reports, loading, error, refresh, removeReport, uploadsRemaining, maxUploads } = useReports();
  const atLimit = uploadsRemaining <= 0;
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      [r.filename, r.companyName, r.company].filter(Boolean).some((s) => String(s).toLowerCase().includes(q)),
    );
  }, [reports, query]);

  const firstName = (user?.email || 'there').split('@')[0];

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await removeReport(idOf(pendingDelete)); // DELETE /reports/:id
      toast.success('Report deleted');
      setPendingDelete(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 px-5 py-8 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[29px] font-semibold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
          <p className="text-[15px] text-slate-500">
            {loading ? 'Loading your reports…' : `You have ${reports.length} ${reports.length === 1 ? 'report' : 'reports'}.`}
          </p>
        </div>
        <Button
          size="lg"
          disabled={atLimit}
          title={atLimit ? `Upload limit reached (${maxUploads} max on this demo)` : undefined}
          onClick={() => navigate('/upload')}
          leftIcon={<span aria-hidden="true">↑</span>}
        >
          Upload New PDF
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardStat label="Statements" value={String(reports.length)} />
        <CardStat label="Line items extracted" value={String(reports.length * 10)} />
        <CardStat label="Latest upload" value={reports[0] ? formatDate(reports[0].createdAt || reports[0].uploadedAt) : '—'} />
        <CardStat label="Uploads used" value={`${maxUploads - uploadsRemaining} / ${maxUploads}`} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[17px] font-semibold text-slate-900">Your reports</h2>
          <Input
            type="search"
            aria-label="Search reports by filename or company"
            placeholder="Search filename or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            containerClassName="w-full sm:w-72"
          />
        </div>

        {error ? (
          <Card className="flex flex-wrap items-center justify-between gap-4 border-rose-200 bg-rose-50">
            <p className="text-sm text-rose-800">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>
              Try again
            </Button>
          </Card>
        ) : null}

        {loading ? (
          <Card className="grid place-items-center py-16">
            <LoadingSpinner size="lg" label="Loading reports" />
          </Card>
        ) : visible.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 border-dashed py-14 text-center">
            <p className="text-base font-semibold text-slate-900">
              {query ? `No reports match “${query}”` : 'No reports yet'}
            </p>
            <p className="text-sm text-slate-500">
              {query ? 'Try a different filename or company name.' : 'Upload your first income statement to get started.'}
            </p>
            {!query ? (
              <Button className="mt-3" disabled={atLimit} onClick={() => navigate('/upload')}>
                Upload New PDF
              </Button>
            ) : null}
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((report) => (
              <ReportCard
                key={idOf(report)}
                report={report}
                onView={() => navigate(`/reports/${idOf(report)}`)}
                onEdit={() => navigate(`/reports/${idOf(report)}/edit`)}
                onDelete={() => setPendingDelete(report)}
              />
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this report?"
        description={`“${pendingDelete?.filename || ''}” and its extracted figures will be permanently removed. This cannot be undone.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="dangerSolid" loading={deleting} onClick={confirmDelete}>
              Delete report
            </Button>
          </>
        }
      />
    </div>
  );
}

function ReportCard({ report, onView, onEdit, onDelete }) {
  const rows = toRows(report.extractedData || report.data || {});
  const revenue = rows.find((r) => r.key === 'revenue')?.value;

  return (
    <Card as="li" padded={false} className="flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onView}
        className="flex flex-col gap-3 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-100 bg-[repeating-linear-gradient(135deg,#f8fafc_0_8px,#f1f5f9_8px_16px)] p-3">
          <span className="font-mono text-[10.5px] tracking-[0.06em] text-slate-400">INCOME STATEMENT</span>
          <span className="font-mono text-xl text-brand-700">{revenue ? formatMoney(revenue) : '—'}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            {report.companyName || report.company || 'Untitled company'}
          </span>
          <span className="truncate text-[13px] text-slate-500">{report.filename}</span>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
        <span className="text-[12.5px] text-slate-500">{formatDate(report.createdAt || report.uploadedAt)}</span>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={onView} aria-label={`View ${report.filename}`}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${report.filename}`}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-700" onClick={onDelete} aria-label={`Delete ${report.filename}`}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
