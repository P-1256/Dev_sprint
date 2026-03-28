import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Define weekly challenges
const ALL_CHALLENGES = [
  {
    id: 'spend_less_70',
    title: 'Spend Less Than 70% of Weekly Budget',
    description: 'Keep your weekly spending under 70% of your monthly budget divided by 4.',
    points: 50,
    check: (expenses, budget) => {
      const weeklyBudget = budget / 4;
      const weeklySpent = getWeeklySpent(expenses);
      return weeklySpent < weeklyBudget * 0.7;
    },
  },
  {
    id: 'no_entertainment',
    title: 'No Entertainment Expenses This Week',
    description: 'Avoid any spending on entertainment this week.',
    points: 30,
    check: (expenses) => {
      const lastWeek = getLastWeekExpenses(expenses);
      const hasEntertainmentLast = lastWeek.some(e => e.category === 'Entertainment');
      if (!hasEntertainmentLast) return false;
      const weeklyExpenses = getWeeklyExpenses(expenses);
      return !weeklyExpenses.some(e => e.category === 'Entertainment');
    },
  },
  {
    id: 'save_vs_last_week',
    title: 'Spend 20% Less Than Last Week',
    description: 'Spend at least 20% less than you did last week.',
    points: 40,
    check: (expenses) => {
      const thisWeek = getWeeklySpent(expenses);
      const lastWeek = getLastWeekSpent(expenses);
      return lastWeek > 0 && thisWeek < lastWeek * 0.8;
    },
  },
  {
    id: 'max_3_expenses',
    title: 'Maximum 3 Expenses This Week',
    description: 'Limit yourself to no more than 3 expenses this week.',
    points: 25,
    check: (expenses) => {
      const weeklyExpenses = getWeeklyExpenses(expenses);
      return weeklyExpenses.length <= 3;
    },
  },
  {
    id: 'no_food_out',
    title: 'No Dining Out This Week',
    description: 'Avoid any food expenses outside home this week.',
    points: 35,
    check: (expenses) => {
      const lastWeek = getLastWeekExpenses(expenses);
      const hasFoodOutLast = lastWeek.some(e => e.category === 'Food' && e.description?.toLowerCase().includes('restaurant'));
      if (!hasFoodOutLast) return false;
      const weeklyExpenses = getWeeklyExpenses(expenses);
      return !weeklyExpenses.some(e => e.category === 'Food' && e.description?.toLowerCase().includes('restaurant'));
    },
  },
  {
    id: 'save_on_transport',
    title: 'Reduce Transport Costs by 30%',
    description: 'Spend 30% less on transportation compared to last week.',
    points: 45,
    check: (expenses) => {
      const lastWeekTransport = getLastWeekExpenses(expenses).filter(e => e.category === 'Transportation').reduce((sum, e) => sum + Number(e.amount), 0);
      if (lastWeekTransport === 0) return false;
      const thisWeekTransport = getWeeklyExpenses(expenses).filter(e => e.category === 'Transportation').reduce((sum, e) => sum + Number(e.amount), 0);
      return thisWeekTransport < lastWeekTransport * 0.7;
    },
  },
  {
    id: 'one_big_purchase',
    title: 'Only One Expense Over ₹500',
    description: 'Have at most one expense greater than ₹500 this week.',
    points: 40,
    check: (expenses) => {
      const weeklyExpenses = getWeeklyExpenses(expenses);
      return weeklyExpenses.filter(e => Number(e.amount) > 500).length <= 1;
    },
  },
  {
    id: 'daily_limit',
    title: 'Stay Under Daily Budget',
    description: 'Keep daily spending under your weekly budget divided by 7.',
    points: 55,
    check: (expenses, budget) => {
      const dailyBudget = (budget / 4) / 7;
      const weeklyExpenses = getWeeklyExpenses(expenses);
      // Group by day
      const dailySpends = {};
      weeklyExpenses.forEach(e => {
        const date = new Date(e.createdAt || e.date).toDateString();
        dailySpends[date] = (dailySpends[date] || 0) + Number(e.amount);
      });
      return Object.values(dailySpends).every(spend => spend < dailyBudget);
    },
  },
  {
    id: 'no_spending_day',
    title: 'No Spending Day',
    description: 'Have at least one day this week with no expenses.',
    points: 60,
    check: (expenses) => {
      const weeklyExpenses = getWeeklyExpenses(expenses);
      // Group by day
      const dailySpends = {};
      weeklyExpenses.forEach(e => {
        const date = new Date(e.createdAt || e.date).toDateString();
        dailySpends[date] = (dailySpends[date] || 0) + Number(e.amount);
      });
      // Check if any day has 0 spend or if there are less than total days in week so far (implying some days have 0)
      const daysWithExpenses = Object.keys(dailySpends).length;
      const now = new Date();
      const totalDaysInWeek = now.getDay() + 1; // Sunday=0 ->1, Monday=1->2, ..., Saturday=6->7
      return daysWithExpenses < totalDaysInWeek || Object.values(dailySpends).some(spend => spend === 0);
    },
  },
];

function getWeeklyChallenges(weekKey) {
  const weekNum = parseInt(weekKey.split('-W')[1]);
  const start = weekNum % ALL_CHALLENGES.length;
  const selected = [];
  for (let i = 0; i < 4; i++) {
    selected.push(ALL_CHALLENGES[(start + i) % ALL_CHALLENGES.length]);
  }
  return selected;
}

// Helper functions
function getWeeklyExpenses(expenses) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  return expenses.filter(e => new Date(e.createdAt || e.date) >= startOfWeek);
}

function getWeeklySpent(expenses) {
  return getWeeklyExpenses(expenses).reduce((sum, e) => sum + Number(e.amount), 0);
}

function getLastWeekSpent(expenses) {
  const now = new Date();
  const startOfLastWeek = new Date(now);
  startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const lastWeekExpenses = expenses.filter(e => {
    const date = new Date(e.createdAt || e.date);
    return date >= startOfLastWeek && date <= endOfLastWeek;
  });

  return lastWeekExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

function getLastWeekExpenses(expenses) {
  const now = new Date();
  const startOfLastWeek = new Date(now);
  startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  endOfLastWeek.setHours(23, 59, 59, 999);

  return expenses.filter(e => {
    const date = new Date(e.createdAt || e.date);
    return date >= startOfLastWeek && date <= endOfLastWeek;
  });
}

function getWeekKey() {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil((now - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

export default function WeeklyChallenges({ expenses, budget, onPointsUpdate }) {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());

  const weekKey = getWeekKey();
  const CHALLENGES = getWeeklyChallenges(weekKey);

  useEffect(() => {
    // Load points from localStorage
    const storedPoints = localStorage.getItem(`userPoints_${user?.id}`);
    if (storedPoints) {
      const pts = parseInt(storedPoints, 10);
      setPoints(pts);
      if (onPointsUpdate) onPointsUpdate(pts);
    }

    // Load completed challenges for this week
    const weekKey = getWeekKey();
    const storedCompleted = localStorage.getItem(`completedChallenges_${user?.id}_${weekKey}`);
    if (storedCompleted) {
      setCompletedChallenges(new Set(JSON.parse(storedCompleted)));
    }
  }, [user?.id]);

  useEffect(() => {
    // Check challenges and award points if completed
    const weekKey = getWeekKey();
    const newCompleted = new Set();

    CHALLENGES.forEach(challenge => {
      if (challenge.check(expenses, budget)) {
        newCompleted.add(challenge.id);
      }
    });

    // Award points for newly completed challenges
    const previouslyCompleted = completedChallenges;
    const newOnes = [...newCompleted].filter(id => !previouslyCompleted.has(id));

    if (newOnes.length > 0) {
      const newPoints = newOnes.reduce((sum, id) => {
        const challenge = CHALLENGES.find(c => c.id === id);
        return sum + (challenge ? challenge.points : 0);
      }, 0);

      setPoints(prev => {
        const updated = prev + newPoints;
        localStorage.setItem(`userPoints_${user?.id}`, updated);
        if (onPointsUpdate) onPointsUpdate(updated);
        return updated;
      });
    }

    setCompletedChallenges(newCompleted);
    localStorage.setItem(`completedChallenges_${user?.id}_${weekKey}`, JSON.stringify([...newCompleted]));
  }, [expenses, budget, user?.id, completedChallenges]);

  return (
    <div className="card animate-slide-up opacity-0 animate-delay-700" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-base font-700 text-ink-900 dark:text-ink-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          Weekly Challenges
        </h2>
        <div className="text-right">
          <p className="text-xs text-ink-500">Total Points</p>
          <p className="text-lg font-bold text-amber-400">{points}</p>
        </div>
      </div>

      <div className="space-y-3">
        {CHALLENGES.map((challenge, index) => {
          const isCompleted = completedChallenges.has(challenge.id);
          return (
            <div
              key={challenge.id}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-amber-400/10 border-amber-400/30'
                  : 'bg-ink-50 dark:bg-ink-800 border-ink-200 dark:border-ink-700'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className={isCompleted ? 'text-sm font-semibold text-amber-400' : 'text-sm font-semibold text-ink-900 dark:text-ink-100'}>
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-ink-400 mt-1 dark:text-ink-300">{challenge.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-medium ${isCompleted ? 'text-amber-400' : 'text-ink-500'}`}>
                    {challenge.points} pts
                  </p>
                  {isCompleted && (
                    <div className="mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-ink-500 mt-4 text-center">
        Challenges reset every Sunday. Keep saving to earn more points!
      </p>
    </div>
  );
}