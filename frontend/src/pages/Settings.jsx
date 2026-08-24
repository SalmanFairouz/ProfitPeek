import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const THEME_KEY = 'pp_theme';

export default function Settings() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  // Tailwind dark mode is class-based — toggle on <html> and remember the choice.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const changePassword = (e) => {
    e.preventDefault();
    if (pw.next.length < 8) return setPwError('New password must be at least 8 characters.');
    if (pw.next !== pw.confirm) return setPwError('New passwords do not match.');
    setPwError('');
    // Wire to your backend once the endpoint exists, e.g. PUT /auth/password.
    toast.info('Password change endpoint not wired yet — hook up PUT /auth/password.');
    setPw({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-8 md:px-10">
      <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Settings</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="text-[15.5px] font-semibold text-slate-900">Account</h2>
        <Input label="Email" value={user?.email || ''} readOnly hint="Contact support to change your account email." />
      </Card>

      <Card as="form" className="flex flex-col gap-4" onSubmit={changePassword}>
        <h2 className="text-[15.5px] font-semibold text-slate-900">Change password</h2>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={pw.current}
          onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={pw.next}
            onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            error={pwError}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Update password
          </Button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15.5px] font-semibold text-slate-900">Dark mode</h2>
          <p className="text-[13px] text-slate-500">Applies the `dark` class to the document root.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          aria-label="Dark mode"
          onClick={() => setDark((d) => !d)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
            dark ? 'bg-accent-500' : 'bg-slate-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[left] ${dark ? 'left-6' : 'left-1'}`}
          />
        </button>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15.5px] font-semibold text-slate-900">Session</h2>
          <p className="text-[13px] text-slate-500">Clears your token from this browser.</p>
        </div>
        <Button variant="danger" onClick={logout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
