export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Housing & Utilities',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const CATEGORY_COLORS = {
  'Food & Dining':      '#7ec8a4',
  'Transportation':     '#f5a623',
  'Shopping':           '#a78bfa',
  'Entertainment':      '#38bdf8',
  'Health & Medical':   '#f87171',
  'Housing & Utilities':'#fb923c',
  'Education':          '#34d399',
  'Travel':             '#f472b6',
  'Personal Care':      '#facc15',
  'Other':              '#94a3b8',
};

export const CATEGORY_ICONS = {
  'Food & Dining':      '🍽',
  'Transportation':     '🚗',
  'Shopping':           '🛍',
  'Entertainment':      '🎬',
  'Health & Medical':   '❤️',
  'Housing & Utilities':'🏠',
  'Education':          '📚',
  'Travel':             '✈️',
  'Personal Care':      '💆',
  'Other':              '📦',
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
}
