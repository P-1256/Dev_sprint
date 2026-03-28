export default function StatCard({ label, value, sub, accent = 'sage', delay = 0 }) {
  const accentMap = {
    sage:  { bg: 'bg-sage-400/10',  border: 'border-sage-400/20',  text: 'text-sage-400'  },
    amber: { bg: 'bg-amber-400/10', border: 'border-amber-400/20', text: 'text-amber-400' },
    rose:  { bg: 'bg-rose-300/10',  border: 'border-rose-300/20',  text: 'text-rose-300'  },
  };
  const a = accentMap[accent] || accentMap.sage;

  return (
    <div
      className={`card animate-slide-up opacity-0 ${a.bg} border ${a.border}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <p className="text-xs uppercase tracking-widest text-ink-400 font-medium mb-3">{label}</p>
      <p className={`text-3xl font-display font-700 ${a.text} leading-none`}>{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-2">{sub}</p>}
    </div>
  );
}
