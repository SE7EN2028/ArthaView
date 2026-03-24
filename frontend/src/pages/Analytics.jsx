import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getTrend, getCategories } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import './Analytics.css';

const PIE_COLORS = ['#7c6ff7', '#22d3a5', '#f75c7e', '#f59e0b', '#38bdf8', '#a78bfa'];
const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontSize: 13, marginBottom: 3 }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrend(), getCategories()])
      .then(([t, c]) => { setTrend(t.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const profitData = trend.map(t => ({ ...t, profit: t.income - t.expenses }));
  const totalIncome = trend.reduce((s, t) => s + t.income, 0);
  const totalExpenses = trend.reduce((s, t) => s + t.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const avgMonthly = trend.length ? totalIncome / trend.length : 0;

  const exportChart = () => {
    const headers = ['Month', 'Income', 'Expenses', 'Profit'];
    const rows = profitData.map(t => [t.month, t.income, t.expenses, t.profit]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arthaview-trend-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <p>Loading your analytics...</p>
    </div>
  );

  return (
    <div>
      <Header title="Analytics" subtitle="Deep dive into your financial trends" />
      <div className="page-content animate-in">

        {trend.length === 0 ? (
          <div className="empty-state card" style={{ padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>No Data Available</h3>
            <p style={{ color: 'var(--text-muted)' }}>Upload bank statements or add transactions to unlock your analytics.</p>
          </div>
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid-4 mb-28">
              {[
                { label: 'Total Revenue', value: fmt(totalIncome), icon: '💰', color: 'rgba(34,211,165,0.1)', border: 'rgba(34,211,165,0.2)' },
                { label: 'Total Expenses', value: fmt(totalExpenses), icon: '📤', color: 'rgba(247,92,126,0.1)', border: 'rgba(247,92,126,0.2)' },
                { label: 'Net Profit', value: fmt(netProfit), icon: '📈', color: 'rgba(124,111,247,0.1)', border: 'rgba(124,111,247,0.2)' },
                { label: 'Avg Monthly Revenue', value: fmt(Math.round(avgMonthly)), icon: '📊', color: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
              ].map((k, i) => (
                <div key={i} className="stat-card" style={{ background: k.color, border: `1px solid ${k.border}` }}>
                  <div className="stat-icon" style={{ background: k.color }}>{k.icon}</div>
                  <div className="stat-label">{k.label}</div>
                  <div className="stat-value">{k.value}</div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="chart-container" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="chart-title" style={{ marginBottom: 0 }}>Monthly Revenue vs Expenses</div>
                <button className="btn btn-secondary btn-sm" onClick={exportChart}>📥 Export Data</button>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#606080', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<TTip />} />
                  <Bar dataKey="income" name="Revenue" fill="#22d3a5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f75c7e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-grid">
              {/* Profit Trend */}
          <div className="chart-container">
            <div className="chart-title">Net Profit Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={profitData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<TTip />} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#7c6ff7" strokeWidth={2.5} dot={{ fill: '#7c6ff7', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie */}
          <div className="chart-container">
            <div className="chart-title">Expense Category Split</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Table */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="chart-title" style={{ marginBottom: 16 }}>Expense Breakdown Details</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Total Spent</th>
                <th>% of Expenses</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              {categories.sort((a, b) => b.value - a.value).map((cat, i) => {
                const total = categories.reduce((s, c) => s + c.value, 0);
                const pct = ((cat.value / total) * 100).toFixed(1);
                return (
                  <tr key={cat.name}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {cat.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{fmt(cat.value)}</td>
                    <td><span className="badge badge-purple">{pct}%</span></td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ background: 'rgba(255,255,255,0.06)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length], height: '100%', borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        </>
        )}
      </div>
    </div>
  );
}
