import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getSummary, getTrend, getCategories, getHealthScore } from '../api/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

const PIE_COLORS = ['#7c6ff7', '#22d3a5', '#f75c7e', '#f59e0b', '#38bdf8', '#a78bfa'];

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

function HealthRing({ score, grade }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22d3a5' : score >= 45 ? '#f59e0b' : '#f75c7e';

  return (
    <div className="health-ring-wrapper">
      <svg width="130" height="130" className="health-ring-svg">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Space Grotesk">{score}</text>
        <text x="65" y="78" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">{grade}</text>
      </svg>
      <div className="health-label">Business Health Score</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="tooltip-row" style={{ color: p.color }}>
          <span>{p.name}:</span> <strong>{fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getTrend(), getCategories(), getHealthScore()])
      .then(([s, t, c, h]) => {
        setSummary(s.data);
        setTrend(t.data);
        setCategories(c.data);
        setHealth(h.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <p>Loading your dashboard...</p>
    </div>
  );

  const stats = [
    {
      label: 'Total Revenue',
      value: fmt(summary?.totalIncome),
      icon: '💰',
      change: `+${fmt(summary?.monthIncome)} this month`,
      positive: true,
      gradient: 'rgba(34,211,165,0.1)',
      border: 'rgba(34,211,165,0.2)',
    },
    {
      label: 'Total Expenses',
      value: fmt(summary?.totalExpenses),
      icon: '📤',
      change: `${fmt(summary?.monthExpenses)} this month`,
      positive: false,
      gradient: 'rgba(247,92,126,0.1)',
      border: 'rgba(247,92,126,0.2)',
    },
    {
      label: 'Net Profit',
      value: fmt(summary?.netProfit),
      icon: '📈',
      change: `${summary?.profitMargin}% margin`,
      positive: (summary?.netProfit || 0) >= 0,
      gradient: 'rgba(124,111,247,0.1)',
      border: 'rgba(124,111,247,0.2)',
    },
    {
      label: 'Transactions',
      value: summary?.transactionCount,
      icon: '📋',
      change: 'Total recorded',
      positive: true,
      gradient: 'rgba(56,189,248,0.1)',
      border: 'rgba(56,189,248,0.2)',
    },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Your business at a glance" />
      <div className="page-content animate-in">

        {/* Stat Cards */}
        <div className="grid-4 mb-28">
          {stats.map((s, i) => (
            <div className="stat-card" key={i} style={{ background: s.gradient, border: `1px solid ${s.border}` }}>
              <div className="stat-icon" style={{ background: s.gradient }}>{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-change ${s.positive ? 'positive' : 'negative'}`}>
                {s.positive ? '▲' : '▼'} {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="dashboard-charts">
          {/* Area Chart */}
          <div className="chart-container chart-main">
            <div className="chart-title">Revenue vs Expenses — Last 6 Months</div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3a5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22d3a5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f75c7e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f75c7e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#606080', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Revenue" stroke="#22d3a5" strokeWidth={2.5} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f75c7e" strokeWidth={2.5} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Health Score */}
          <div className="chart-container chart-health">
            <div className="chart-title">Business Health</div>
            {health && <HealthRing score={health.score} grade={health.grade} />}
            <div className="health-stats">
              <div className="health-stat-row">
                <span>Profit Margin</span>
                <span className={parseFloat(health?.profitMargin) > 0 ? 'positive' : 'negative'}>
                  {health?.profitMargin}%
                </span>
              </div>
              <div className="health-stat-row">
                <span>Revenue Diversity</span>
                <span className="positive">Good</span>
              </div>
              <div className="health-stat-row">
                <span>Cash Flow</span>
                <span className={(summary?.cashFlow || 0) >= 0 ? 'positive' : 'negative'}>
                  {(summary?.cashFlow || 0) >= 0 ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="dashboard-bottom">
          <div className="chart-container">
            <div className="chart-title">Expense Breakdown by Category</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#a0a0c0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* This Month Summary */}
          <div className="chart-container">
            <div className="chart-title">This Month Summary</div>
            <div className="month-summary">
              <div className="month-row income">
                <div className="month-row-icon">💚</div>
                <div className="month-row-info">
                  <div className="month-row-label">Income</div>
                  <div className="month-row-value">{fmt(summary?.monthIncome)}</div>
                </div>
                <div className="month-row-bar-wrapper">
                  <div className="month-row-bar income-bar" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="month-row expense">
                <div className="month-row-icon">❤️</div>
                <div className="month-row-info">
                  <div className="month-row-label">Expenses</div>
                  <div className="month-row-value">{fmt(summary?.monthExpenses)}</div>
                </div>
                <div className="month-row-bar-wrapper">
                  <div className="month-row-bar expense-bar"
                    style={{ width: `${Math.min(100, ((summary?.monthExpenses || 0) / (summary?.monthIncome || 1)) * 100)}%` }} />
                </div>
              </div>
              <div className="divider" />
              <div className="month-profit">
                <div className="profit-label">Net Profit This Month</div>
                <div className={`profit-value ${(summary?.monthNetProfit || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {fmt(summary?.monthNetProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
