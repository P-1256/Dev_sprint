import { useState } from 'react';
import Spinner from './Spinner';

const SPARK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

// ─── Suggestion bank keyed by category ───────────────────────────────────────
const SUGGESTION_BANK = {
  'Food & Dining': [
    {
      title: 'Cook more meals at home',
      tip: 'Preparing meals at home instead of eating out 3–4 times a week drastically cuts food costs. Batch cooking on weekends saves both time and money.',
      saving: 2000,
      priority: 'high',
    },
    {
      title: 'Use a strict grocery list',
      tip: 'Shopping without a list leads to impulse buys. Write a weekly menu first, then shop exactly for it — this alone reduces grocery bills by 20–30%.',
      saving: 800,
      priority: 'medium',
    },
  ],
  'Transportation': [
    {
      title: 'Switch to public transit',
      tip: 'Using metro or bus even 3 days a week can save significant fuel and parking costs. A monthly pass offers even better value.',
      saving: 1500,
      priority: 'high',
    },
    {
      title: 'Carpool with colleagues',
      tip: 'Sharing rides to work with 1–2 colleagues can halve your daily commute cost immediately with zero lifestyle change.',
      saving: 1200,
      priority: 'medium',
    },
  ],
  'Shopping': [
    {
      title: 'Apply the 24-hour rule',
      tip: 'Before any non-essential purchase, wait 24 hours. Most impulse desires fade, cutting unnecessary shopping spend by up to 40%.',
      saving: 2500,
      priority: 'high',
    },
    {
      title: 'Buy during sale seasons',
      tip: 'Plan big purchases around major sale events like end-of-season or festive sales. You can save 30–50% on the same items.',
      saving: 1500,
      priority: 'medium',
    },
  ],
  'Entertainment': [
    {
      title: 'Audit your subscriptions',
      tip: 'List every streaming, music, and app subscription you pay for. Cancel any you have not used in the last 30 days — most people have 2–3 forgotten ones.',
      saving: 600,
      priority: 'medium',
    },
    {
      title: 'Explore free local events',
      tip: 'Parks, libraries, and community centres often offer free or low-cost entertainment. Swap one paid outing a week for a free alternative.',
      saving: 800,
      priority: 'low',
    },
  ],
  'Health & Medical': [
    {
      title: 'Invest in preventive health',
      tip: 'Regular exercise and a balanced diet reduce long-term medical costs significantly. A ₹500/month gym membership can prevent thousands in future bills.',
      saving: 500,
      priority: 'medium',
    },
    {
      title: 'Choose generic medicines',
      tip: 'Generic drugs contain the same active ingredients as branded ones at 40–80% lower cost. Ask your doctor or pharmacist for generic alternatives.',
      saving: 400,
      priority: 'low',
    },
  ],
  'Housing & Utilities': [
    {
      title: 'Cut electricity consumption',
      tip: 'Switch to LED bulbs, unplug idle chargers, and use appliances during off-peak hours. These habits can shave 15–20% off your electricity bill.',
      saving: 700,
      priority: 'medium',
    },
    {
      title: 'Negotiate rent on renewal',
      tip: 'Research comparable rents nearby when your lease is up and negotiate. Landlords often prefer keeping reliable tenants over finding new ones.',
      saving: 1000,
      priority: 'high',
    },
  ],
  'Education': [
    {
      title: 'Use free learning platforms',
      tip: 'Khan Academy, Coursera audit mode, and YouTube offer world-class content for free. Reserve paid courses only for certifications you truly need.',
      saving: 500,
      priority: 'low',
    },
    {
      title: 'Buy second-hand textbooks',
      tip: 'Second-hand books or PDFs cost a fraction of new editions. Check with seniors or online marketplaces before buying new study material.',
      saving: 600,
      priority: 'medium',
    },
  ],
  'Travel': [
    {
      title: 'Book flights well in advance',
      tip: 'Booking flights 6–8 weeks ahead typically saves 20–40% compared to last-minute prices. Set fare alerts on Google Flights or Skyscanner.',
      saving: 3000,
      priority: 'high',
    },
    {
      title: 'Travel during off-peak days',
      tip: 'Shifting travel by just a few days away from weekends or holidays can cut hotel and flight costs by 30% or more.',
      saving: 2000,
      priority: 'medium',
    },
  ],
  'Personal Care': [
    {
      title: 'Try DIY grooming routines',
      tip: 'Many salon services — hair masks, facials, manicures — can be done at home with affordable products. Reduce salon visits to once a month.',
      saving: 700,
      priority: 'medium',
    },
    {
      title: 'Buy toiletries in bulk',
      tip: 'Shampoo, soap, and toiletries are cheaper per unit when bought in bulk or family packs. Stock up during discount sales for maximum savings.',
      saving: 300,
      priority: 'low',
    },
  ],
  'Other': [
    {
      title: 'Track every rupee daily',
      tip: 'Simply being aware of where money goes changes spending behaviour. Logging expenses daily reduces unnecessary spending by 10–15%.',
      saving: 1000,
      priority: 'high',
    },
    {
      title: 'Set a weekly cash limit',
      tip: 'Divide your remaining budget by remaining weeks in the month. Give yourself a strict weekly limit and stop when it runs out.',
      saving: 800,
      priority: 'medium',
    },
  ],
};

// General fallbacks when fewer than 4 category matches are found
const GENERAL_TIPS = [
  {
    title: 'Follow the 50-30-20 rule',
    tip: 'Allocate income into needs (50%), wants (30%), and savings (20%). Review this split every month and adjust based on your actuals.',
    saving: 1500,
    category: 'General',
    priority: 'high',
  },
  {
    title: 'Automate savings on payday',
    tip: 'Set up an auto-transfer to a savings account immediately on payday before you spend anything. Paying yourself first is the most effective saving habit.',
    saving: 2000,
    category: 'General',
    priority: 'high',
  },
  {
    title: 'Avoid EMI for small items',
    tip: 'Using EMI for small purchases adds interest and psychological debt. Only use instalment plans for large, truly necessary purchases.',
    saving: 600,
    category: 'General',
    priority: 'medium',
  },
  {
    title: 'Cancel unused subscriptions',
    tip: 'Go through your phone and list every paid app or subscription. Cancel anything you have not actively used in the past two weeks.',
    saving: 400,
    category: 'General',
    priority: 'low',
  },
];

// ─── Pick 4 relevant tips based on top spending categories ────────────────────
function generateSuggestions(expenses) {
  if (expenses.length === 0) return [];

  const catMap = {};
  expenses.forEach((e) => {
    const k = e.category || 'Other';
    catMap[k] = (catMap[k] || 0) + Number(e.amount);
  });

  const topCats = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const picked = [];
  const usedCats = new Set();

  for (const cat of topCats) {
    if (picked.length >= 4) break;
    const pool = SUGGESTION_BANK[cat];
    if (pool && !usedCats.has(cat)) {
      const tip = pool[Math.floor(Math.random() * pool.length)];
      picked.push({ ...tip, category: cat });
      usedCats.add(cat);
    }
  }

  // Fill remaining slots with general tips
  for (const tip of GENERAL_TIPS) {
    if (picked.length >= 4) break;
    if (!usedCats.has(tip.category)) {
      picked.push(tip);
      usedCats.add(tip.category);
    }
  }

  return picked.slice(0, 4);
}

// ─── UI components ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    high:   { label: 'High impact',   cls: 'bg-rose-300/10 text-rose-300   border-rose-300/25'   },
    medium: { label: 'Medium impact', cls: 'bg-amber-400/10 text-amber-400 border-amber-400/25' },
    low:    { label: 'Low impact',    cls: 'bg-ink-600/40   text-ink-400   border-ink-600'       },
  };
  const { label, cls } = map[priority] || map.low;
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

function SuggestionCard({ item, index }) {
  const savingLabel = item.saving > 0
    ? `Save ~₹${Number(item.saving).toLocaleString('en-IN')}/mo`
    : null;

  return (
    <div
      className="group relative bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 hover:border-sage-400/30 rounded-2xl p-4 transition-all duration-200 animate-slide-up opacity-0"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute inset-0 rounded-2xl bg-sage-400/0 group-hover:bg-sage-400/[0.03] transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold text-ink-900 dark:text-ink-100 leading-tight">{item.title}</h4>
        <PriorityBadge priority={item.priority} />
      </div>

      <p className="text-xs text-ink-400 leading-relaxed mb-3">{item.tip}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-ink-600 bg-ink-200 dark:bg-ink-800 border border-ink-300 dark:border-ink-700 px-2 py-0.5 rounded-lg">
          {item.category}
        </span>
        {savingLabel && (
          <span className="text-[11px] font-semibold font-mono text-sage-400">
            {savingLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function AISuggestions({ expenses }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [generated, setGenerated]     = useState(false);

  const handleGenerate = () => {
    if (expenses.length === 0) {
      setError('Add at least one expense to get personalised suggestions.');
      return;
    }
    setError('');
    setLoading(true);
    setSuggestions([]);

    // Simulate brief "thinking" delay for a natural feel
    setTimeout(() => {
      setSuggestions(generateSuggestions(expenses));
      setGenerated(true);
      setLoading(false);
    }, 1200);
  };

  const totalPotentialSaving = suggestions.reduce((s, i) => s + (Number(i.saving) || 0), 0);

  return (
    <div
      className="card animate-slide-up opacity-0"
      style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sage-400/30 to-sage-400/10 border border-sage-400/30 flex items-center justify-center text-sage-400">
            {SPARK_ICON}
          </div>
          <div>
            <h2 className="font-display text-base font-700 text-ink-900 dark:text-ink-100 leading-none">AI Suggestions</h2>
            <p className="text-[11px] text-ink-500 mt-0.5">Smart tips based on your top spending categories</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary text-xs px-4 py-2 gap-1.5"
        >
          {loading ? (
            <><Spinner size="sm" /> Analysing…</>
          ) : generated ? (
            <>{SPARK_ICON} Refresh</>
          ) : (
            <>{SPARK_ICON} Get Suggestions</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-300/10 border border-rose-300/20 rounded-xl px-4 py-3 mb-4 animate-fade-in">
          <svg className="text-rose-300 shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-2xl p-4 space-y-2.5 animate-pulse-soft">
              <div className="h-3.5 bg-ink-700 rounded w-2/3" />
              <div className="h-2.5 bg-ink-700/70 rounded w-full" />
              <div className="h-2.5 bg-ink-700/70 rounded w-4/5" />
              <div className="h-2 bg-ink-200 dark:bg-ink-800 rounded w-1/3 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && suggestions.length > 0 && (
        <>
          {totalPotentialSaving > 0 && (
            <div className="flex items-center gap-3 bg-sage-400/8 border border-sage-400/20 rounded-xl px-4 py-3 mb-4 animate-fade-in">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7ec8a4" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className="text-xs text-sage-400">
                Following all tips could save you{' '}
                <span className="font-semibold font-mono">
                  ~₹{totalPotentialSaving.toLocaleString('en-IN')}
                </span>{' '}
                per month.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((item, i) => (
              <SuggestionCard key={i} item={item} index={i} />
            ))}
          </div>

          <p className="text-[10px] text-ink-600 mt-4 text-center">
            ✦ Suggestions are based on your spending patterns and are for guidance only.
          </p>
        </>
      )}

      {/* Empty state */}
      {!loading && !generated && !error && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-ink-600">
          <div className="w-12 h-12 rounded-2xl border border-dashed border-ink-700 flex items-center justify-center">
            {SPARK_ICON}
          </div>
          <p className="text-xs text-center max-w-[220px] leading-relaxed">
            Click{' '}
            <span className="text-ink-400 font-medium">Get Suggestions</span>{' '}
            to get smart tips based on your top spending categories.
          </p>
        </div>
      )}
    </div>
  );
}
