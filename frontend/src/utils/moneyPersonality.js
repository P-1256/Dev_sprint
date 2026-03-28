/**
 * Analyzes user spending patterns to determine money personality
 */

const INVESTMENT_CATEGORIES = [
  'Education',
  'Housing & Utilities',
  'Health & Medical',
];

const CONSUMPTION_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Travel',
  'Personal Care',
];

export function analyzeMoneyPersonality(expenses, budget) {
  if (!expenses || expenses.length === 0) {
    return {
      personality: 'Neutral',
      score: 50,
      traits: [],
      insights: 'Add expenses to discover your money personality.',
      breakdown: {
        investment: 0,
        consumption: 0,
        savings: 0,
      },
    };
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savingsAmount = Math.max(0, budget - totalSpent);
  const savingsRate = budget > 0 ? (savingsAmount / budget) * 100 : 0;
  const spendingRate = 100 - savingsRate;

  // Calculate category breakdown
  const categoryTotals = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
  });

  const investmentSpend = Object.entries(categoryTotals)
    .filter(([cat]) => INVESTMENT_CATEGORIES.includes(cat))
    .reduce((sum, [, amount]) => sum + amount, 0);

  const consumptionSpend = Object.entries(categoryTotals)
    .filter(([cat]) => CONSUMPTION_CATEGORIES.includes(cat))
    .reduce((sum, [, amount]) => sum + amount, 0);

  const investmentPct = totalSpent > 0 ? (investmentSpend / totalSpent) * 100 : 0;
  const consumptionPct = totalSpent > 0 ? (consumptionSpend / totalSpent) * 100 : 0;

  // Classify personality
  let personality = 'Balanced';
  let score = 50;
  let traits = [];
  let insights = '';

  if (savingsRate >= 40) {
    personality = 'Saver';
    score = 85;
    traits = ['Disciplined', 'Cautious', 'Goal-oriented'];
    insights = `You're saving ${savingsRate.toFixed(1)}% of your budget! Great financial discipline. Consider diversifying investments.`;
  } else if (savingsRate < 10 && spendingRate > 90) {
    personality = 'Spender';
    score = 30;
    traits = ['Spontaneous', 'Generous', 'Experience-focused'];
    insights = `You spend ${spendingRate.toFixed(1)}% of your budget. Consider setting aside more for emergencies.`;
  } else if (investmentPct > 35) {
    personality = 'Investor';
    score = 75;
    traits = ['Strategic', 'Future-focused', 'Intentional'];
    insights = `${investmentPct.toFixed(1)}% of your spending is on investments like education & housing. Excellent long-term thinking!`;
  } else if (consumptionPct > 60 && savingsRate >= 15) {
    personality = 'Spender';
    score = 45;
    traits = ['Lifestyle-focused', 'Social', 'Present-minded'];
    insights = `You enjoy spending on experiences (${consumptionPct.toFixed(1)}%). Balance this with future planning.`;
  } else {
    personality = 'Balanced';
    score = 60;
    traits = ['Pragmatic', 'Flexible', 'Well-rounded'];
    insights = `You maintain a balanced approach to spending and saving. Consider your financial goals to optimize further.`;
  }

  return {
    personality,
    score,
    traits,
    insights,
    breakdown: {
      investment: parseFloat(investmentPct.toFixed(1)),
      consumption: parseFloat(consumptionPct.toFixed(1)),
      savings: parseFloat(savingsRate.toFixed(1)),
    },
    metrics: {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      savingsAmount: parseFloat(savingsAmount.toFixed(2)),
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      spendingRate: parseFloat(spendingRate.toFixed(1)),
    },
  };
}

export function getPersonalityEmoji(personality) {
  const emojiMap = {
    'Saver': '🏦',
    'Spender': '💳',
    'Investor': '📈',
    'Balanced': '⚖️',
    'Neutral': '❓',
  };
  return emojiMap[personality] || '❓';
}

export function getPersonalityColor(personality) {
  const colorMap = {
    'Saver': 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    'Spender': 'bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400',
    'Investor': 'bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
    'Balanced': 'bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    'Neutral': 'bg-ink-500/20 border-ink-500/30 text-ink-600 dark:text-ink-400',
  };
  return colorMap[personality] || colorMap['Neutral'];
}

export function getTraitColor(index) {
  const colors = [
    'bg-sage-400/20 text-sage-700 dark:text-sage-300',
    'bg-amber-400/20 text-amber-700 dark:text-amber-300',
    'bg-blue-400/20 text-blue-700 dark:text-blue-300',
  ];
  return colors[index % colors.length];
}
