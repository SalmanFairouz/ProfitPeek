import { useId } from 'react';

export default function Input({
  label,
  error,
  hint,
  id: idProp,
  className = '',
  containerClassName = '',
  rightSlot = null,
  ...rest
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'h-11 w-full rounded-xl border bg-white px-3 text-[15px] text-slate-900 placeholder:text-slate-400',
            'transition-colors duration-150 focus:outline-none focus:ring-4',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200 focus:border-brand-700 focus:ring-brand-700/12',
            rightSlot ? 'pr-24' : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {rightSlot ? <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
