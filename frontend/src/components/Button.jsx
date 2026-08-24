const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:outline-brand-700',
  accent: 'bg-accent-500 text-brand-950 hover:bg-accent-600 focus-visible:outline-accent-600',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:outline-brand-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-brand-700',
  danger: 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 focus-visible:outline-rose-600',
  dangerSolid: 'bg-rose-700 text-white hover:bg-rose-800 focus-visible:outline-rose-700',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-[15px] rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
