const DOT = {
  success: 'bg-accent-500',
  error: 'bg-rose-400',
  info: 'bg-sky-300',
};

/** Bottom-right stack. Rendered once by ToastProvider — call useToast() to push. */
export default function ToastStack({ toasts = [], onDismiss }) {
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex min-w-[264px] max-w-sm animate-toast items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-sm text-brand-50 shadow-xl"
        >
          <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[t.variant] || DOT.info}`} />
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss?.(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded px-1 text-brand-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}
    </div>
  );
}
