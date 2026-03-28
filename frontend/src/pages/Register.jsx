import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';

export default function Register() {
  const { register, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', budget: '' });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.budget) <= 0) return;
    const result = await register({
      ...form,
      budget: Number(form.budget),
    });
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
          <h1 className="font-display text-2xl font-700 text-ink-900 dark:text-ink-100">Create your account</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">Start tracking your budget today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorAlert message={error} onDismiss={clearError} />

            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ravi Kumar"
                className="input-field"
                autoComplete="name"
                required
              />
            </div>

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
                placeholder="Create a strong password"
                className="input-field"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Monthly Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-mono">₹</span>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="50000"
                  className="input-field pl-7"
                  min="1"
                  step="1"
                  required
                />
              </div>
              <p className="text-xs text-ink-500 mt-1.5">Set your total spending limit for the month.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sage-400 hover:text-sage-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
