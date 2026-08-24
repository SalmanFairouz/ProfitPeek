export default function Card({ as: Tag = 'div', className = '', padded = true, interactive = false, children, ...rest }) {
  return (
    <Tag
      className={[
        'rounded-2xl border border-slate-200 bg-white',
        padded ? 'p-5' : '',
        interactive
          ? 'cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700'
          : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardStat({ label, value, note }) {
  return (
    <Card className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <span className="font-mono text-2xl tracking-tight text-slate-900">{value}</span>
      {note ? <span className="text-[13px] text-emerald-700">{note}</span> : null}
    </Card>
  );
}
