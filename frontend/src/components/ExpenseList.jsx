import { useState } from 'react';
import { getCategoryColor, getCategoryIcon } from './categories';
import Spinner from './Spinner';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ExpenseItem({ expense, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const color = getCategoryColor(expense.category);
  const icon = getCategoryIcon(expense.category);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(expense._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-ink-700/50 last:border-0 group animate-fade-in">
      {/* Category icon badge */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate">
            {expense.note || expense.category}
          </span>
          <span
            className="tag shrink-0"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {expense.category}
          </span>
        </div>
        <p className="text-xs text-ink-500">{formatDate(expense.createdAt || expense.date)}</p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold font-mono text-ink-900 dark:text-ink-100">
          ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="btn-danger shrink-0 opacity-0 group-hover:opacity-100"
        title="Delete expense"
      >
        {deleting ? (
          <Spinner size="sm" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function ExpenseList({ expenses, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-ink-500">
        <div className="w-14 h-14 rounded-2xl bg-ink-700/50 border border-ink-700 flex items-center justify-center text-2xl">
          📊
        </div>
        <p className="text-sm">No expenses yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-4 pb-2 mb-1 border-b border-ink-700">
        <div className="w-9 shrink-0" />
        <p className="flex-1 text-xs text-ink-500 uppercase tracking-wider">Description</p>
        <p className="text-xs text-ink-500 uppercase tracking-wider shrink-0">Amount</p>
        <div className="w-8 shrink-0" />
      </div>

      {expenses.map((exp) => (
        <ExpenseItem key={exp._id} expense={exp} onDelete={onDelete} />
      ))}
    </div>
  );
}
