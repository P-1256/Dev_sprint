import { useMemo } from 'react';

export default function ExpenseHeatmap({ expenses }) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Calculate expenses per day
  const dailyExpenses = useMemo(() => {
    const expensesByDay = {};
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt || expense.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const day = date.getDate();
        expensesByDay[day] = (expensesByDay[day] || 0) + Number(expense.amount);
      }
    });
    return expensesByDay;
  }, [expenses, currentMonth, currentYear]);

  // Find max expense for scaling
  const maxExpense = Math.max(...Object.values(dailyExpenses), 0);

  // Get color based on expense
  const getColor = (amount) => {
    if (amount === 0) return 'bg-ink-100 dark:bg-ink-800';
    const intensity = Math.min(amount / maxExpense, 1);
    if (intensity < 0.2) return 'bg-green-200 dark:bg-green-800';
    if (intensity < 0.4) return 'bg-green-300 dark:bg-green-700';
    if (intensity < 0.6) return 'bg-yellow-300 dark:bg-yellow-600';
    if (intensity < 0.8) return 'bg-orange-300 dark:bg-orange-600';
    return 'bg-red-400 dark:bg-red-800';
  };

  // Generate calendar grid
  const weeks = [];
  let week = [];
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // Add remaining days
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">Expense Heatmap</h2>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs max-w-md mx-auto">
        {/* Day labels */}
        <div className="text-ink-500 text-xs py-1">Sun</div>
        <div className="text-ink-500 text-xs py-1">Mon</div>
        <div className="text-ink-500 text-xs py-1">Tue</div>
        <div className="text-ink-500 text-xs py-1">Wed</div>
        <div className="text-ink-500 text-xs py-1">Thu</div>
        <div className="text-ink-500 text-xs py-1">Fri</div>
        <div className="text-ink-500 text-xs py-1">Sat</div>

        {/* Days */}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-medium transition-colors ${
                day ? getColor(dailyExpenses[day] || 0) : 'bg-transparent'
              }`}
              title={day ? `Day ${day}: ₹${(dailyExpenses[day] || 0).toLocaleString('en-IN')}` : ''}
            >
              {day}
            </div>
          ))
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-500">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-yellow-300 dark:bg-yellow-600"></div>
          <div className="w-3 h-3 rounded-sm bg-orange-300 dark:bg-orange-600"></div>
          <div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-800"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}