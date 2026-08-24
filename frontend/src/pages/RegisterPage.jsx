import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage({ onSuccess }) {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '', form: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.includes('@')) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // POST /auth/register → { userId, token }. Token is adopted immediately (auto-login).
      await register(form.email.trim(), form.password);
      toast.success('Account created — welcome aboard');
      onSuccess?.();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors({ form: err.status === 409 ? 'An account with that email already exists.' : err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <header className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500">Free while you evaluate — 25 statements included.</p>
        </header>

        <div className="flex flex-col gap-4">
          <Input
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
          />

          {errors.form ? (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-[13px] leading-relaxed text-rose-800">
              {errors.form}
            </p>
          ) : null}

          <Button type="submit" loading={loading} fullWidth>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-center text-[13.5px] text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
