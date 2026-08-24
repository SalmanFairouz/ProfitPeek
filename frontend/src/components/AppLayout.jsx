import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MOBILE_LINKS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/upload', label: 'Upload' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

/** Shell for every authenticated route: sidebar + content, bottom nav under 768px. */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onUploadClick={() => {
            setMenuOpen(false);
            navigate('/upload');
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onMenuClick={() => setMenuOpen(true)} />
          <main className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      >
        {MOBILE_LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              [
                'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors',
                isActive ? 'text-brand-700' : 'text-slate-500',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-accent-500' : 'bg-slate-300'}`} />
                {l.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
