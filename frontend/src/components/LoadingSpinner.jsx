const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' };

export default function LoadingSpinner({ size = 'md', label = 'Loading', className = '' }) {
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`${SIZES[size] || SIZES.md} animate-spin rounded-full border-slate-200 border-t-accent-500`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Skeleton row set for table/list placeholders. */
export function SkeletonRows({ count = 5, widths = ['72%', '54%', '88%', '40%', '66%'] }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ width: widths[i % widths.length] }}
          className="h-4 animate-pulse rounded-md bg-slate-200/80"
        />
      ))}
    </div>
  );
}
