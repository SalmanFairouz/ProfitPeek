/** Two-column split used by both auth pages. */
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-gradient-to-b from-brand-700 to-brand-900 p-14 text-brand-50 lg:flex">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-xl bg-accent-500"
          >
            <img src="/logo-mark.png" alt="" className="h-6 w-6" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">Profit Peak</span>
        </div>

        <div className="flex max-w-md flex-col gap-6">
          <h1 className="text-[42px] font-semibold leading-[1.1] tracking-tight text-pretty">
            Income statements, keyed in for you.
          </h1>
          <p className="text-base leading-relaxed text-brand-100">
            Drop a PDF, get structured financials in seconds — every figure scored by extraction confidence so you know
            exactly what to double-check.
          </p>
          <dl className="flex gap-8 pt-2">
            <div className="flex flex-col gap-1">
              <dd className="font-mono text-2xl text-accent-500">18s</dd>
              <dt className="text-[12px] uppercase tracking-[0.08em] text-brand-200">Median extract</dt>
            </div>
            <div className="flex flex-col gap-1">
              <dd className="font-mono text-2xl text-accent-500">99.2%</dd>
              <dt className="text-[12px] uppercase tracking-[0.08em] text-brand-200">Line-item accuracy</dt>
            </div>
          </dl>
        </div>

        <p className="text-[12px] text-brand-200">SOC 2 Type II · Documents never used for model training</p>
      </aside>

      <main className="grid place-items-center bg-white px-6 py-12">
        <div className="w-full max-w-sm animate-rise">{children}</div>
      </main>
    </div>
  );
}
