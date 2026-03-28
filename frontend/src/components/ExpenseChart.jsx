import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getCategoryColor } from './categories';
import { useState } from 'react';

function buildChartData(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const key = e.category || 'Other';
    map[key] = (map[key] || 0) + Number(e.amount);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-600 rounded-xl px-3 py-2 text-sm shadow-xl">
        <p className="text-ink-300 mb-0.5">{name}</p>
        <p className="font-semibold text-ink-900 dark:text-ink-100 font-mono">
          ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ expenses }) {
  const [view, setView] = useState('pie');
  const data = buildChartData(expenses);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-500 text-sm">
        No data to display yet.
      </div>
    );
  }

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-1 mb-6 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl p-1 w-fit">
        {['pie', 'bar'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize ${
              view === v
                ? 'bg-sage-400 text-ink-900'
                : 'text-ink-400 hover:text-ink-200'
            }`}
          >
            {v === 'pie' ? '◉ Pie' : '▬ Bar'}
          </button>
        ))}
      </div>

      {view === 'pie' ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getCategoryColor(entry.name)}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2 min-w-[160px] w-full lg:w-auto">
            {data.map((item) => {
              const color = getCategoryColor(item.name);
              const total = data.reduce((s, d) => s + d.value, 0);
              const pct = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink-300 truncate">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-ink-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252b36" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(126,200,164,0.06)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
