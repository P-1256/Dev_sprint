import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI } from '../services/api';
import StatCard from '../components/StatCard';
import BudgetProgress from '../components/BudgetProgress';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import ErrorAlert from '../components/ErrorAlert';
import AISuggestions from '../components/AISuggestions';
import Alerts from '../components/Alerts';
import ExpenseHeatmap from '../components/ExpenseHeatmap';
import MoneyPersonalityAnalyzer from '../components/MoneyPersonalityAnalyzer';

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'chart'

  const budget = user?.budget || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = budget - totalSpent;

  // Forecast metrics
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const elapsedDays = Math.max(1, Math.ceil((today - startOfMonth) / (1000 * 60 * 60 * 24)));
  const dailyAvg = elapsedDays > 0 ? totalSpent / elapsedDays : 0;
  const projectedWeeklySpend = dailyAvg * 7;
  const weeklyBudget = budget / 4;
  const projectedRemainingAfterWeek = weeklyBudget - projectedWeeklySpend;
  const daysUntilOverBudget = dailyAvg > 0 ? Math.max(0, Math.floor(remaining / dailyAvg)) : Infinity;

  // Calculate weekly saving rate
  const getWeeklySpent = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return expenses
      .filter(e => new Date(e.createdAt || e.date) >= startOfWeek)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  };

  const weeklySpent = getWeeklySpent();
  const savingRate = weeklyBudget > 0 ? ((weeklyBudget - weeklySpent) / weeklyBudget) * 100 : 0;
  const isSaving = savingRate >= 0;

  // Financial health score (0-100)
  const healthScore = Math.max(0, Math.min(100, Math.round(70 + (savingRate * 0.3) - (totalSpent / Math.max(1, budget)) * 20)));
  const healthLabel = healthScore >= 85 ? 'Excellent' : healthScore >= 70 ? 'Good' : healthScore >= 50 ? 'Fair' : 'At Risk';

  const getEmotion = (score) => {
    if (score >= 85) return { emoji: '😊', quote: 'Great job! Your finances are in excellent shape.' };
    if (score >= 70) return { emoji: '🙂', quote: 'Good progress! Keep up the smart spending.' };
    if (score >= 50) return { emoji: '😐', quote: 'Fair. Consider reviewing your expenses.' };
    return { emoji: '😟', quote: 'At risk. Time to adjust your budget.' };
  };

  const { emoji, quote } = getEmotion(healthScore);

  const fetchExpenses = useCallback(async () => {
    if (user?.isDummy) {
      const stored = localStorage.getItem('dummyExpenses');
      setExpenses(stored ? JSON.parse(stored) : []);
      setLoadingExpenses(false);
      return;
    }
    setLoadingExpenses(true);
    setFetchError('');
    try {
      const { data } = await expenseAPI.getAll();
      // Support both array response and wrapped { expenses: [...] }
      setExpenses(Array.isArray(data) ? data : data.expenses || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load expenses.');
    } finally {
      setLoadingExpenses(false);
    }
  }, [user?.isDummy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async (payload) => {
    if (user?.isDummy) {
      // For demo, add locally with fake data
      const newExpense = {
        _id: Date.now().toString(),
        ...payload,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
      };
      setExpenses((prev) => {
        const updated = [newExpense, ...prev];
        localStorage.setItem('dummyExpenses', JSON.stringify(updated));
        return updated;
      });
      window.dispatchEvent(new CustomEvent('expense-notification', { detail: { message: `New expense added: ${payload.category || 'General'} ₹${payload.amount}` } }));
      return;
    }
    const { data } = await expenseAPI.create(payload);
    // Prepend new expense to top
    const newExpense = data.expense || data;
    setExpenses((prev) => [newExpense, ...prev]);
    window.dispatchEvent(new CustomEvent('expense-notification', { detail: { message: `New expense added: ${payload.category || 'General'} ₹${payload.amount}` } }));
  };

  const handleDeleteExpense = async (id) => {
    if (user?.isDummy) {
      // For demo, remove locally
      setExpenses((prev) => {
        const updated = prev.filter((e) => e._id !== id);
        localStorage.setItem('dummyExpenses', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    await expenseAPI.delete(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="animate-fade-in relative">
        <div className="absolute right-0 top-0 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/70 px-3 py-2 text-right">
          <p className="text-xs uppercase text-ink-500 dark:text-ink-400">Finance Score</p>
          <p className={`text-2xl font-bold ${healthLabel === 'At Risk' ? 'text-rose-500 dark:text-rose-400' : 'text-sage-400'}`}>{healthScore}</p>
          <p className={`text-xs font-medium ${healthLabel === 'At Risk' ? 'text-rose-400 dark:text-rose-300' : 'text-ink-600 dark:text-ink-300'}`}>{healthLabel}</p>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1"><span className="text-lg">{emoji}</span> {quote}</p>
        </div>

        <p className="text-sm text-ink-500 mb-1">{greeting()},</p>
        <h1 className="font-display text-3xl font-700 text-ink-900 dark:text-ink-100">
          {user?.name} <span className="text-sage-400">👋</span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-300 mt-1">
          Here's your financial overview for this period.
        </p>
      </div>

      {/* ── Alerts & Nudges ── */}
      <Alerts expenses={expenses} budget={budget} />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Budget"
          value={`₹${budget.toLocaleString('en-IN')}`}
          sub="Total allocated budget"
          accent="sage"
          delay={0}
        />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          sub={`Across ${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
          accent="amber"
          delay={100}
        />
        <StatCard
          label={remaining >= 0 ? 'Remaining' : 'Over Budget'}
          value={`₹${Math.abs(remaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          sub={remaining >= 0 ? 'Still available to spend' : 'You have exceeded budget'}
          accent={remaining >= 0 ? 'sage' : 'rose'}
          delay={200}
        />
        <StatCard
          label="Weekly Saving Rate"
          value={`${Math.abs(savingRate).toFixed(1)}% ${isSaving ? 'Saved' : 'Over'}`}
          sub={isSaving ? 'This week\'s budget efficiency' : 'Exceeded weekly budget'}
          accent={isSaving ? 'sage' : 'rose'}
          delay={300}
        />
      </div>

      {/* ── Forecasting summary ── */}
      <div className="card animate-slide-up opacity-0 animate-delay-300" style={{ animationFillMode: 'forwards' }}>
        <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100 mb-2">Spending forecast</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-ink-400">Expected weekly spend</p>
            <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">₹{projectedWeeklySpend.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
          </div>
          <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-ink-400">Weekly budget</p>
            <p className="text-lg font-semibold text-ink-900 dark:text-ink-100">₹{weeklyBudget.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
          </div>
        </div>

        {dailyAvg > 0 && (
          <p className={`mt-3 text-sm ${projectedRemainingAfterWeek < 0 ? 'text-rose-300' : 'text-sage-300'}`}>
            {projectedRemainingAfterWeek < 0
              ? `At current pace, you’ll exceed your weekly budget in ${daysUntilOverBudget} day${daysUntilOverBudget !== 1 ? 's' : ''}.`
              : `At current pace, you’ll have ₹${Math.abs(projectedRemainingAfterWeek).toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining at week end.`}
          </p>
        )}
      </div>

      {/* ── Budget progress bar ── */}
      <BudgetProgress budget={budget} spent={totalSpent} />

      {/* ── Money Personality Analyzer ── */}
      <MoneyPersonalityAnalyzer expenses={expenses} budget={budget} />

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Add Expense Form — left column */}
        <div
          className="lg:col-span-2 card animate-slide-up opacity-0 animate-delay-400"
          style={{ animationFillMode: 'forwards' }}
        >
          <h2 className="font-display text-base font-700 text-ink-100 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sage-400/15 border border-sage-400/25 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ec8a4" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Add Expense
          </h2>
          <AddExpenseForm onAdd={handleAddExpense} />
        </div>

        {/* Expenses + Chart — right column */}
        <div
          className="lg:col-span-3 card animate-slide-up opacity-0 animate-delay-500"
          style={{ animationFillMode: 'forwards' }}
        >
          {/* Tab header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl p-1">
              {[
                { id: 'expenses', label: '≡ Expenses' },
                { id: 'chart',    label: '◉ Chart'    },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-sage-400 text-ink-900'
                      : 'text-ink-400 hover:text-ink-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'expenses' && expenses.length > 0 && (
              <span className="text-xs text-ink-500 font-mono">{expenses.length} records</span>
            )}
          </div>

          {/* Fetch error */}
          {fetchError && (
            <ErrorAlert message={fetchError} onDismiss={() => setFetchError('')} />
          )}

          {/* Tab content */}
          {activeTab === 'expenses' ? (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
              loading={loadingExpenses}
            />
          ) : (
            <ExpenseChart expenses={expenses} />
          )}
        </div>
      </div>
      {/* ── AI Suggestions ── */}
      <AISuggestions
        expenses={expenses}
        budget={budget}
        userName={user?.name}
      />

      {/* ── Expense Heatmap ── */}
      <ExpenseHeatmap expenses={expenses} />

    </div>
  );
}
