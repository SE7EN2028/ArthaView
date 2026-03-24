import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();
import { getTransactions } from '../data/store.js';

const router = express.Router();
let _groq;
const getGroq = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};
const MODEL = () => process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// Build a financial context summary for Groq
function buildFinancialContext() {
  const txns = getTransactions();
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netProfit = income - expenses;
  const profitMargin = income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0;

  const catMap = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const topExpenses = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join(', ');

  const recentTxns = txns
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
    .map(t => `${t.date} | ${t.type === 'income' ? '+' : '-'}₹${t.amount} | ${t.description} (${t.category})`)
    .join('\n');

  return `
You are ArthaView's AI financial advisor for a small/medium Indian business.
Here is their current financial data:

FINANCIAL SUMMARY:
- Total Revenue: ₹${income.toLocaleString('en-IN')}
- Total Expenses: ₹${expenses.toLocaleString('en-IN')}
- Net Profit: ₹${netProfit.toLocaleString('en-IN')}
- Profit Margin: ${profitMargin}%
- Total Transactions: ${txns.length}

TOP EXPENSE CATEGORIES:
${topExpenses}

RECENT TRANSACTIONS:
${recentTxns}

Your role: Give concise, actionable, friendly financial advice. Use Indian business context (₹ currency, GST awareness, Indian market conditions). Keep answers short (3-5 sentences max unless asked otherwise). Be encouraging but honest about financial risks.
  `.trim();
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });

  try {
    const systemPrompt = buildFinancialContext();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const completion = await getGroq().chat.completions.create({
      model: MODEL(),
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ success: false, message: 'AI service error', error: err.message });
  }
});

// GET /api/ai/quick-insights — auto-generated summary
router.get('/quick-insights', async (req, res) => {
  try {
    const systemPrompt = buildFinancialContext();
    const completion = await getGroq().chat.completions.create({
      model: MODEL(),
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Analyze this business data and give me 4 key insights: 1 about revenue, 1 about top expense risk, 1 about profit margin, 1 actionable recommendation. Format each as a short bullet point starting with an emoji.'
        }
      ],
      max_tokens: 400,
      temperature: 0.6,
    });
    const insights = completion.choices[0]?.message?.content || '';
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
