import {
  analyzeMoneyPersonality,
  getPersonalityEmoji,
  getPersonalityColor,
  getTraitColor,
} from '../utils/moneyPersonality';

export default function MoneyPersonalityAnalyzer({ expenses, budget }) {
  const analysis = analyzeMoneyPersonality(expenses, budget);

  if (!analysis.breakdown) {
    return null;
  }

  const {
    personality,
    score,
    traits,
    insights,
    breakdown,
    metrics,
  } = analysis;

  const emoji = getPersonalityEmoji(personality);
  const colorClass = getPersonalityColor(personality);

  return (
    <div className="card animate-fade-in space-y-4">
      {/* Header with personality type */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs uppercase text-ink-500 dark:text-ink-400 mb-1">
            Money Personality
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            <div>
              <h3 className="text-2xl font-bold text-ink-900 dark:text-ink-100">
                {personality}
              </h3>
              <p className="text-xs text-ink-400 max-w-xs">
                {insights}
              </p>
            </div>
          </div>
        </div>

        {/* Score indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-ink-600 dark:text-ink-700"
              />
              {/* Score circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                className={score >= 70 ? 'text-sage-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-ink-900 dark:text-ink-100">
                {score}
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-400 text-center">Score</p>
        </div>
      </div>

      {/* Traits */}
      {traits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {traits.map((trait, idx) => (
            <span
              key={trait}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getTraitColor(idx)}`}
            >
              {trait}
            </span>
          ))}
        </div>
      )}

      {/* Breakdown visualization */}
      <div className="space-y-3 pt-2 border-t border-ink-700/50">
        <p className="text-xs uppercase text-ink-500 dark:text-ink-400 font-medium">
          Spending Breakdown
        </p>

        {/* Investment */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs">📈</span>
              <span className="text-xs text-ink-300">Investment</span>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-400">
              {breakdown.investment}%
            </span>
          </div>
          <div className="w-full bg-ink-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${breakdown.investment}%` }}
            />
          </div>
        </div>

        {/* Consumption */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs">🛍️</span>
              <span className="text-xs text-ink-300">Consumption</span>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-400">
              {breakdown.consumption}%
            </span>
          </div>
          <div className="w-full bg-ink-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${breakdown.consumption}%` }}
            />
          </div>
        </div>

        {/* Savings */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs">💰</span>
              <span className="text-xs text-ink-300">Savings</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {breakdown.savings}%
            </span>
          </div>
          <div className="w-full bg-ink-700/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${breakdown.savings}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key metrics */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-700/50">
          <div className="bg-ink-900/50 rounded-lg p-2">
            <p className="text-xs text-ink-400 mb-0.5">Total Spent</p>
            <p className="text-sm font-semibold text-ink-100 font-mono">
              ₹{metrics.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-ink-900/50 rounded-lg p-2">
            <p className="text-xs text-ink-400 mb-0.5">Saved</p>
            <p className="text-sm font-semibold text-emerald-400 font-mono">
              ₹{metrics.savingsAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
