import express from 'express';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../data/store.js';

const router = express.Router();

// GET all transactions (with optional filters)
router.get('/', (req, res) => {
  let txns = getTransactions();
  const { type, category, from, to, search } = req.query;
  if (type) txns = txns.filter(t => t.type === type);
  if (category) txns = txns.filter(t => t.category === category);
  if (from) txns = txns.filter(t => t.date >= from);
  if (to) txns = txns.filter(t => t.date <= to);
  if (search) txns = txns.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
  // Sort newest first
  txns.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ success: true, data: txns, total: txns.length });
});

// POST add transaction
router.post('/', (req, res) => {
  const { date, description, amount, type, category } = req.body;
  if (!date || !description || !amount || !type || !category) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  const txn = addTransaction({ date, description, amount: parseFloat(amount), type, category });
  res.status(201).json({ success: true, data: txn });
});

// PUT update transaction
router.put('/:id', (req, res) => {
  const { date, description, amount, type, category } = req.body;
  const updates = { date, description, type, category };
  if (amount !== undefined) updates.amount = parseFloat(amount);
  
  const updated = updateTransaction(req.params.id, updates);
  if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: updated });
});

// DELETE transaction
router.delete('/:id', (req, res) => {
  const deleted = deleteTransaction(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, message: 'Deleted' });
});

export default router;
