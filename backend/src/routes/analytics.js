import express from 'express';
import { getTransactions } from '../data/store.js';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const router = express.Router();

// GET analytics summary
router.get('/summary', (req, res) => {
  const txns = getTransactions();
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = income - expenses;
  const profitMargin = income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0;

  // Current month
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
  const monthTxns = txns.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const monthIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  res.json({
    success: true,
    data: {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit,
      profitMargin: parseFloat(profitMargin),
      cashFlow: income - expenses,
      monthIncome,
      monthExpenses,
      monthNetProfit: monthIncome - monthExpenses,
      transactionCount: txns.length,
    }
  });
});

// GET monthly trend (last 6 months)
router.get('/trend', (req, res) => {
  const txns = getTransactions();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const label = format(date, 'MMM yyyy');
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    const monthTxns = txns.filter(t => t.date >= start && t.date <= end);
    const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    months.push({ month: label, income, expenses, profit: income - expenses });
  }
  res.json({ success: true, data: months });
});

// GET expense breakdown by category
router.get('/categories', (req, res) => {
  const txns = getTransactions().filter(t => t.type === 'expense');
  const catMap = {};
  txns.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const data = Object.entries(catMap).map(([name, value]) => ({ name, value }));
  res.json({ success: true, data });
});

// GET anomalies
router.get('/anomalies', (req, res) => {
  const txns = getTransactions();
  const anomalies = [];

  // Group expenses by category and detect spikes
  const catMap = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    if (!catMap[t.category]) catMap[t.category] = [];
    catMap[t.category].push(t.amount);
  });

  Object.entries(catMap).forEach(([cat, amounts]) => {
    if (amounts.length < 2) return;
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const latest = amounts[amounts.length - 1];
    if (latest > avg * 1.4) {
      anomalies.push({
        type: 'expense_spike',
        category: cat,
        message: `${cat} spending is ${Math.round(((latest - avg) / avg) * 100)}% above average`,
        severity: latest > avg * 1.8 ? 'high' : 'medium',
        amount: latest,
        average: Math.round(avg),
      });
    }
  });

  // Check cash flow
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  if (expenses > income * 0.85) {
    anomalies.push({
      type: 'low_margin',
      category: 'Cash Flow',
      message: `Expenses are ${Math.round((expenses / income) * 100)}% of revenue — profit margin is very thin`,
      severity: 'high',
    });
  }

  res.json({ success: true, data: anomalies });
});

// GET AI recommendations
router.get('/recommendations', (req, res) => {
  const txns = getTransactions();
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const catMap = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const recommendations = [];
  Object.entries(catMap).forEach(([cat, amt]) => {
    const pct = ((amt / expenses) * 100).toFixed(0);
    if (pct > 30) {
      recommendations.push({
        icon: '⚠️',
        priority: 'high',
        title: `High ${cat} Spend`,
        description: `${cat} is ${pct}% of total expenses. Consider reviewing contracts or finding alternatives.`,
      });
    }
  });

  if (income > 0 && expenses / income > 0.7) {
    recommendations.push({
      icon: '📊',
      priority: 'high',
      title: 'Improve Profit Margin',
      description: `Your profit margin is below 30%. Focus on reducing top expense categories or increasing pricing.`,
    });
  }

  recommendations.push({
    icon: '💡',
    priority: 'medium',
    title: 'Diversify Revenue',
    description: 'Consider adding a new product line or service offering to reduce dependency on single revenue streams.',
  });

  recommendations.push({
    icon: '📅',
    priority: 'low',
    title: 'Build an Emergency Fund',
    description: 'Aim to maintain 3 months of operating expenses as a cash reserve for business continuity.',
  });

  res.json({ success: true, data: recommendations });
});

// GET health score
router.get('/health-score', (req, res) => {
  const txns = getTransactions();
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const profitMargin = income > 0 ? (income - expenses) / income : 0;

  let score = 50;
  if (profitMargin > 0.3) score += 30;
  else if (profitMargin > 0.15) score += 15;
  else if (profitMargin < 0) score -= 20;

  const incomeTypes = [...new Set(txns.filter(t => t.type === 'income').map(t => t.category))];
  if (incomeTypes.length >= 3) score += 15;
  else if (incomeTypes.length === 2) score += 8;

  score = Math.min(100, Math.max(0, score));
  let grade = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical';

  res.json({ success: true, data: { score, grade, profitMargin: (profitMargin * 100).toFixed(1) } });
});

export default router;
