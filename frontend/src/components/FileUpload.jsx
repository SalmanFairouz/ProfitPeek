import { useRef, useState } from 'react';
import Button from './Button';
import { formatBytes } from '../api/normalize';

const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Drag-and-drop PDF picker. Validates type + size locally before the parent uploads.
 * Keyboard accessible: the zone is a button (Enter/Space opens the file dialog).
 */
export default function FileUpload({ file, onFile, onClear, accept = 'application/pdf', maxBytes = MAX_BYTES }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const validate = (candidate) => {
    if (!candidate) return 'No file received.';
    const isPdf = candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'That file is not a PDF.';
    if (candidate.size > maxBytes) return `File is larger than ${formatBytes(maxBytes)}.`;
    return '';
  };

  const accept_ = (candidate) => {
    const problem = validate(candidate);
    setError(problem);
    if (!problem) onFile(candidate);
  };

  if (file) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-[11px] font-bold tracking-wide text-brand-700"
          >
            PDF
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-slate-900">{file.name}</span>
            <span className="text-[13px] text-slate-500">{formatBytes(file.size)} · ready to extract</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onClear}>
          Choose a different file
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a PDF to upload"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept_(e.dataTransfer?.files?.[0]);
        }}
        className={[
          'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors duration-150',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
          dragging ? 'border-accent-500 bg-emerald-50/70' : 'border-slate-300 bg-white hover:border-slate-400',
        ].join(' ')}
      >
        <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-xl text-brand-700">
          ↑
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">Drag your income statement here</span>
        <span className="text-sm text-slate-500">
          PDF up to {formatBytes(maxBytes)}, 5 pages max · or{' '}
          <span className="font-semibold text-brand-700 underline">browse files</span>
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => accept_(e.target.files?.[0])}
      />

      {error ? (
        <p role="alert" className="text-[13px] text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
