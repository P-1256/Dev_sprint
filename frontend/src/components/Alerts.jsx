import { useState, useEffect, useRef } from 'react';

export default function Alerts({ expenses, budget }) {
  const [alerts, setAlerts] = useState([]);

  const sentAlertsRef = useRef([]);

  useEffect(() => {
    const newAlerts = [];
    const reliableExpenses = Array.isArray(expenses) ? expenses : [];

    // Helper functions
    const getWeeklySpent = () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return reliableExpenses
        .filter(e => new Date(e.createdAt || e.date) >= startOfWeek)
        .reduce((sum, e) => sum + Number(e.amount), 0);
    };

    const getTodayExpenses = () => {
      const today = new Date().toDateString();
      return reliableExpenses.filter(e => new Date(e.createdAt || e.date).toDateString() === today);
    };

    const weeklySpent = getWeeklySpent();
    const weeklyBudget = budget / 4;

    // Alert: Crossed 80% of weekly budget
    if (budget > 0 && weeklySpent > weeklyBudget * 0.8) {
      newAlerts.push("⚠️ You crossed 80% of your weekly budget");
    }

    // Alert: 5 transactions today
    const todayExpenses = getTodayExpenses();
    if (todayExpenses.length >= 5) {
      newAlerts.push(`You made ${todayExpenses.length} transactions today — unusual activity`);
    }

    // Additional nudges
    if (weeklySpent < weeklyBudget * 0.5 && weeklySpent > 0) {
      newAlerts.push("🎉 You're doing great! Keep up the saving streak!");
    }

    if (todayExpenses.length === 0 && new Date().getHours() > 12) {
      newAlerts.push("💡 No expenses today? That's awesome for your budget!");
    }

    // Bad Habit Detector rules
    const isLateNight = reliableExpenses.some((e) => {
      const hour = new Date(e.createdAt || e.date).getHours();
      return hour >= 23 || hour < 6;
    });
    if (isLateNight) {
      newAlerts.push("🕒 You spent money late at night recently — watch impulsive spending.");
    }

    const categoryAgg = {};
    reliableExpenses.forEach((e) => {
      const category = e.category || 'Other';
      const amount = Number(e.amount) || 0;
      categoryAgg[category] = (categoryAgg[category] || 0) + amount;
    });

    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date(lastWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(lastWeekStart);
    prevWeekEnd.setMilliseconds(-1);

    const weeklyCategory = {}; // this week
    const prevWeeklyCategory = {}; // previous week

    reliableExpenses.forEach((e) => {
      const d = new Date(e.createdAt || e.date);
      const cat = e.category || 'Other';
      const amt = Number(e.amount) || 0;
      if (d >= lastWeekStart) {
        weeklyCategory[cat] = (weeklyCategory[cat] || 0) + amt;
      } else if (d >= prevWeekStart && d <= prevWeekEnd) {
        prevWeeklyCategory[cat] = (prevWeeklyCategory[cat] || 0) + amt;
      }
    });

    Object.keys(weeklyCategory).forEach((cat) => {
      const prev = prevWeeklyCategory[cat] || 0;
      const curr = weeklyCategory[cat];
      if (prev > 0 && curr > prev * 1.5) {
        newAlerts.push(`📈 Overspending Spike: ${cat} spending increased ${Math.round((curr / prev - 1) * 100)}% this week`);
      }
    });

    // Frequency addiction
    const foodOrdersToday = todayExpenses.filter((e) => (e.category || '').toLowerCase().includes('food')).length;
    if (foodOrdersToday > 7) {
      newAlerts.push(`🍔 You made ${foodOrdersToday} food-related transactions today — possible frequency addiction.`);
    }

    // Burst spending (3 orders within 2 hours)
    const sorted = [...reliableExpenses]
      .map((e) => ({ ...e, ts: new Date(e.createdAt || e.date).getTime() }))
      .sort((a, b) => a.ts - b.ts);
    for (let i = 0; i < sorted.length - 2; i += 1) {
      const d0 = sorted[i].ts;
      const d2 = sorted[i + 2].ts;
      if (d2 - d0 <= 2 * 60 * 60 * 1000) {
        newAlerts.push('⚡ Spending burst detected: 3 purchases within 2 hours. Pause and review your habits.');
        break;
      }
    }

    // Budget ignoring (category overspend count this month)
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const categoryMonth = {};
    reliableExpenses
      .filter((e) => new Date(e.createdAt || e.date) >= monthStart)
      .forEach((e) => {
        const cat = e.category || 'Other';
        categoryMonth[cat] = (categoryMonth[cat] || 0) + Number(e.amount);
      });

    const budgetThresholds = {
      Food: (budget / 4) * 0.25,
      Transportation: (budget / 4) * 0.15,
      Entertainment: (budget / 4) * 0.1,
    };

    Object.keys(categoryMonth).forEach((cat) => {
      const spent = categoryMonth[cat];
      if (budgetThresholds[cat] && spent > budgetThresholds[cat]) {
        newAlerts.push(`🚨 Budget ignoring: ${cat} has exceeded suggested monthly threshold (${cat} ${Math.round(spent)})`);
      }
    });

    const uniqueAlerts = [...new Set(newAlerts)];
    const unsentAlerts = uniqueAlerts.filter((alert) => !sentAlertsRef.current.includes(alert));
    unsentAlerts.forEach((alert) => {
      window.dispatchEvent(new CustomEvent('expense-notification', { detail: { message: alert } }));
    });
    sentAlertsRef.current = uniqueAlerts;

    setAlerts(uniqueAlerts);
  }, [expenses, budget]);

  return null;
}