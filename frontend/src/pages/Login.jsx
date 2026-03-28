import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';

export default function Login() {
  const { login, dummyLogin, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sage-400/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sage-400 mb-4">
            <svg width="22" height="22" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1L1 5v9h4.5V9h4v5H14V5L7.5 1z" fill="#0e0f11" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-700 text-ink-900 dark:text-ink-100">Welcome back</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">Sign in to your SmartTracker account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorAlert message={error} onDismiss={clearError} />

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={() => {
                dummyLogin();
                navigate('/dashboard', { replace: true });
              }}
              className="btn-secondary w-full"
            >
              Demo Login (No Backend)
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-ink-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-sage-400 hover:text-sage-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
