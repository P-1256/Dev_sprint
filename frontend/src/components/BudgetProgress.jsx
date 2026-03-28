export default function BudgetProgress({ budget, spent }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = budget - spent;
  const isOver = remaining < 0;
  const isDanger = pct >= 80;

  const barColor = isOver
    ? '#f87171'
    : isDanger
    ? '#f5a623'
    : '#7ec8a4';

  return (
    <div className="card animate-slide-up opacity-0 animate-delay-300" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-ink-400 font-medium">Budget Usage</p>
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg"
          style={{ color: barColor, backgroundColor: `${barColor}15` }}
        >
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-ink-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="flex justify-between text-xs text-ink-500">
        <span>
          Spent:{' '}
          <span className="text-ink-300 font-mono font-medium">
            ₹{spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </span>
        <span>
          {isOver ? 'Over by: ' : 'Left: '}
          <span
            className="font-mono font-medium"
            style={{ color: barColor }}
          >
            ₹{Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </span>
      </div>

      {isDanger && !isOver && (
        <p className="mt-3 text-xs text-amber-400 flex items-center gap-1.5 bg-amber-400/8 border border-amber-400/20 rounded-lg px-3 py-2">
          <span>⚠️</span> Approaching your budget limit
        </p>
      )}
      {isOver && (
        <p className="mt-3 text-xs text-rose-300 flex items-center gap-1.5 bg-rose-300/8 border border-rose-300/20 rounded-lg px-3 py-2">
          <span>🚨</span> You've exceeded your budget
        </p>
      )}
    </div>
  );
}
