import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onSuccess }) {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side guard first so we don't spend a round trip on obvious mistakes.
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setError('');
    setLoading(true);
    try {
      // POST /auth/login → { token }; AuthContext stores it in localStorage.
      await login(email.trim(), password);
      if (!remember) sessionStorage.setItem('pp_session_only', '1');
      toast.success('Signed in');
      onSuccess?.();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Email or password is incorrect.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <header className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold tracking-tight text-slate-900">Sign in to Profit Peak</h1>
          <p className="text-sm text-slate-500">Pick up where you left off.</p>
        </header>

        <div className="flex flex-col gap-4">
          <Input
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            error={error}
          />

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-brand-700"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[13.5px] font-medium text-brand-700 hover:text-emerald-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} fullWidth>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-center text-[13.5px] text-slate-500">
            New to Profit Peak?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-emerald-700">
              Create one
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
