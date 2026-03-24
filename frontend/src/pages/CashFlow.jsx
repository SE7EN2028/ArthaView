import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getTrend } from '../api/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './CashFlow.css';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function CashFlow() {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrend().then(r => {
      const data = r.data.map(m => ({
        ...m,
        cashFlow: m.income - m.expenses,
        cumulative: 0,
      }));
      // Calculate cumulative cash flow
      let cum = 0;
      data.forEach(d => { cum += d.cashFlow; d.cumulative = cum; });
      setTrend(data);
    }).finally(() => setLoading(false));
  }, []);

  const currentCF = trend[trend.length - 1]?.cashFlow || 0;
  const totalCumulative = trend[trend.length - 1]?.cumulative || 0;
  const avgIncome = trend.length ? trend.reduce((s, t) => s + t.income, 0) / trend.length : 0;
  const avgExpense = trend.length ? trend.reduce((s, t) => s + t.expenses, 0) / trend.length : 0;
  const runway = avgExpense > 0 ? (totalCumulative / avgExpense).toFixed(1) : '∞';
  const burnWarning = totalCumulative < 0 || (parseFloat(runway) < 3 && runway !== '∞');

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

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div>
      <Header title="Cash Flow" subtitle="Monitor your business liquidity" />
      <div className="page-content animate-in">

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.2)' }}>
            <div className="stat-icon">💧</div>
            <div className="stat-label">Current Month CF</div>
            <div className={`stat-value ${currentCF >= 0 ? '' : 'negative-val'}`}>{fmt(currentCF)}</div>
            <div className={`stat-change ${currentCF >= 0 ? 'positive' : 'negative'}`}>
              {currentCF >= 0 ? '▲ Positive flow' : '▼ Negative flow'}
            </div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)' }}>
            <div className="stat-icon">📦</div>
            <div className="stat-label">Cumulative Cash</div>
            <div className="stat-value">{fmt(totalCumulative)}</div>
            <div className="stat-change positive">▲ Total accumulated</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="stat-icon">📊</div>
            <div className="stat-label">Avg Monthly Income</div>
            <div className="stat-value">{fmt(Math.round(avgIncome))}</div>
            <div className="stat-change positive">▲ Over 6 months</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="stat-icon">⏱️</div>
            <div className="stat-label">Cash Runway</div>
            <div className="stat-value">{runway} mo</div>
            <div className="stat-change positive">▲ Months of expenses</div>
          </div>
        </div>

        {/* Burn Rate Warning */}
        {burnWarning && (
          <div className="burn-warning-card">
            <span className="burn-warning-icon">⚠️</span>
            <div>
              <div className="burn-warning-title">Cash Flow Alert</div>
              <div className="burn-warning-desc">
                {totalCumulative < 0
                  ? 'Your cumulative cash position is negative. Immediate action recommended.'
                  : `Cash runway is only ${runway} months. Review expenses to extend your runway.`}
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow Chart */}
        <div className="chart-container" style={{ marginBottom: 20 }}>
          <div className="chart-title">Monthly Cash Flow (Income − Expenses)</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="cfPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3a5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3a5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#606080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<TTip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#22d3a5" strokeWidth={2.5} fill="url(#cfPos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Chart */}
        <div className="chart-container">
          <div className="chart-title">Cumulative Cash Position</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6ff7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6ff7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#606080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#606080', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<TTip />} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative Position" stroke="#7c6ff7" strokeWidth={2.5} fill="url(#cumGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Table */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="chart-title" style={{ marginBottom: 16 }}>Monthly Breakdown</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Cash Flow</th>
                <th>MoM Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.month}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(row.income)}</td>
                  <td style={{ color: 'var(--accent-red)' }}>{fmt(row.expenses)}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: row.cashFlow >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {row.cashFlow >= 0 ? '+' : ''}{fmt(row.cashFlow)}
                  </td>
                  <td>
                    {i > 0 && trend[i-1].cashFlow !== 0 ? (
                      <span className={row.cashFlow > trend[i-1].cashFlow ? 'badge badge-green' : 'badge badge-red'}>
                        {row.cashFlow > trend[i-1].cashFlow ? '↑' : '↓'} {Math.abs(((row.cashFlow - trend[i-1].cashFlow) / Math.abs(trend[i-1].cashFlow)) * 100).toFixed(1)}%
                      </span>
                    ) : <span className="text-muted">-</span>}
                  </td>
                  <td>
                    <span className={`badge ${row.cashFlow >= 0 ? 'badge-green' : 'badge-red'}`}>
                      {row.cashFlow >= 0 ? '✓ Positive' : '✗ Negative'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
