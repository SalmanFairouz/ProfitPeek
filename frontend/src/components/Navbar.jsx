import { useAuth } from '../context/AuthContext';

/** Mobile/tablet top bar: hamburger + logout. Hidden on ≥1200px where the sidebar is permanent. */
export default function Navbar({ onMenuClick, title = 'Profit Peak' }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden max-w-[140px] truncate text-[13px] text-slate-500 sm:block">{user?.email}</span>
        <button
          type="button"
          onClick={logout}
          className="h-9 rounded-lg border border-slate-200 px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
