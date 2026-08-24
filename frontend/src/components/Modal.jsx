import { useCallback, useEffect, useRef } from 'react';

/**
 * Accessible overlay: Escape closes, focus is trapped inside, background scroll locked.
 */
export default function Modal({ open, onClose, title, description, children, actions, maxWidth = 'max-w-md' }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-brand-950/45 p-4 backdrop-blur-[1px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
      onKeyDown={onKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
        className={`w-full ${maxWidth} animate-rise rounded-2xl bg-white p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {description ? <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {actions ? <div className="mt-6 flex justify-end gap-2.5">{actions}</div> : null}
      </div>
    </div>
  );
}
