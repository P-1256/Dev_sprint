import { useState } from 'react';
import { CATEGORIES } from './categories';
import Spinner from './Spinner';
import ErrorAlert from './ErrorAlert';

export default function AddExpenseForm({ onAdd }) {
  const [form, setForm] = useState({ amount: '', category: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) {
      setError('Amount and category are required.');
      return;
    }
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAdd({ amount: Number(form.amount), category: form.category, note: form.note });
      setForm({ amount: '', category: '', note: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} onDismiss={() => setError('')} />

      <div>
        {/* Amount */}
        <div>
          <label className="label">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-mono">₹</span>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-7"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4">
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2 px-2 py-2 bg-ink-50 dark:bg-ink-800 border border-ink-300 dark:border-ink-700 rounded-2xl">
            {CATEGORIES.map((c) => {
              const isActive = form.category === c;
              const icon = c === 'Food & Dining' ? '🍽' :
                            c === 'Transportation' ? '🚗' :
                            c === 'Shopping' ? '🛍' :
                            c === 'Entertainment' ? '🎬' :
                            c === 'Health & Medical' ? '❤️' :
                            c === 'Housing & Utilities' ? '🏠' :
                            c === 'Education' ? '📚' :
                            c === 'Travel' ? '✈️' :
                            c === 'Personal Care' ? '💆' :
                            '📦';

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: c }))}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition duration-150 ${
                    isActive
                      ? 'bg-sage-400/25 border-sage-400 text-sage-800 dark:text-sage-100'
                      : 'bg-ink-100 dark:bg-ink-900 border-ink-200 dark:border-ink-600 text-ink-700 dark:text-ink-200 hover:border-sage-400 hover:text-sage-600 dark:hover:text-sage-300'
                  }`}
                  style={{ minWidth: '160px' }}
                >
                  <span>{icon}</span>
                  <span className="truncate">{c}</span>
                </button>
              );
            })}
          </div>
          <input
            type="hidden"
            name="category"
            value={form.category}
            readOnly
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="label">Note <span className="text-ink-600 normal-case tracking-normal">(optional)</span></label>
        <input
          type="text"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="What was this for?"
          className="input-field"
          maxLength={120}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <><Spinner size="sm" /> Adding…</> : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Expense
          </>
        )}
      </button>
    </form>
  );
}
