import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

const linkClass = ({ isActive }) =>
  [
    'flex h-10 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors duration-150',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700',
    isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-slate-600 hover:bg-slate-100',
  ].join(' ');

/**
 * Desktop sidebar (≥1200px static, 768–1199px collapsible drawer).
 * Mobile navigation lives in <BottomNav /> at the foot of AppLayout.
 */
export default function Sidebar({ open = false, onClose, onUploadClick }) {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-brand-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <nav
        aria-label="Main navigation"
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4 transition-transform duration-200',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 px-2">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700"
          >
            <img src="/logo-mark.png" alt="" className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">Profit Peak</span>
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent-500 text-[15px] font-semibold text-brand-950 transition-colors hover:bg-accent-600 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Upload New PDF
        </button>

        <div className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-accent-500' : 'bg-slate-300'}`}
                  />
                  {l.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <SidebarFooter />
      </nav>
    </>
  );
}

function SidebarFooter() {
  const { user, logout } = useAuth();
  const email = user?.email || 'Signed in';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="mt-auto flex flex-col gap-2.5 border-t border-slate-100 pt-3.5">
      <div className="flex items-center gap-2.5 px-1.5">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-semibold text-brand-700"
        >
          {initials}
        </span>
        <span className="truncate text-[13px] font-medium text-slate-700">{email}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="h-9 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        Log out
      </button>
    </div>
  );
}
