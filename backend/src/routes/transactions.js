import express from 'express';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction, clearTransactions } from '../data/store.js';

const router = express.Router();

// GET all transactions (with optional filters + pagination)
router.get('/', (req, res) => {
  try {
    let txns = getTransactions();
    const { type, category, from, to, search, page, limit } = req.query;
    if (type) txns = txns.filter(t => t.type === type);
    if (category) txns = txns.filter(t => t.category === category);
    if (from) txns = txns.filter(t => t.date >= from);
    if (to) txns = txns.filter(t => t.date <= to);
    if (search) txns = txns.filter(t => t.description.toLowerCase().includes(search.toLowerCase()));
    // Sort newest first
    txns.sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = txns.length;
    // Pagination
    if (page && limit) {
      const p = parseInt(page, 10) || 1;
      const l = parseInt(limit, 10) || 20;
      txns = txns.slice((p - 1) * l, p * l);
    }
    res.json({ success: true, data: txns, total, page: page || 1 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions', error: err.message });
  }
});

// POST add transaction
router.post('/', (req, res) => {
  try {
    const { date, description, amount, type, category } = req.body;
    if (!date || !description || !amount || !type || !category) {
      return res.status(400).json({ success: false, message: 'All fields required: date, description, amount, type, category' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be income or expense' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }
    const txn = addTransaction({ date, description, amount: parseFloat(amount), type, category });
    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add transaction', error: err.message });
  }
});

// PUT update transaction
router.put('/:id', (req, res) => {
  try {
    const { date, description, amount, type, category } = req.body;
    const updates = { date, description, type, category };
    if (amount !== undefined) updates.amount = parseFloat(amount);
    const updated = updateTransaction(req.params.id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update transaction', error: err.message });
  }
});

// DELETE all transactions
router.delete('/', (req, res) => {
  try {
    clearTransactions();
    res.json({ success: true, message: 'All transactions deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear transactions', error: err.message });
  }
});

// DELETE single transaction
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTransaction(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete transaction', error: err.message });
  }
});

export default router;

