import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'transactions.json');

let transactions = [];

const seedData = () => {
  const generated = [];
  const start = new Date('2025-09-01').getTime();
  const end = new Date('2026-03-25').getTime();
  const expCats = ['Rent', 'Salaries', 'Inventory', 'Marketing', 'Utilities', 'Software'];
  const incCats = ['Sales', 'Services', 'Consulting'];

  for (let i = 0; i < 115; i++) {
    const time = start + Math.random() * (end - start);
    const dateStr = new Date(time).toISOString().split('T')[0];
    const isIncome = Math.random() > 0.65;
    const type = isIncome ? 'income' : 'expense';
    const amount = Math.floor(Math.random() * 80000) + 1500;
    
    let category = '';
    let description = '';
    
    if (isIncome) {
      category = incCats[Math.floor(Math.random() * incCats.length)];
      description = `Invoice #${1000 + Math.floor(Math.random() * 9000)} Payment`;
    } else {
      category = expCats[Math.floor(Math.random() * expCats.length)];
      description = `Expense - ${category} ${Math.floor(Math.random() * 100)}`;
    }
    
    generated.push({
      id: Date.now().toString() + i + Math.random().toString().slice(2,8),
      date: dateStr,
      description,
      amount,
      type,
      category
    });
  }
  
  generated.sort((a, b) => new Date(a.date) - new Date(b.date));
  return generated;
};

const loadData = () => {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.length > 0) {
        transactions = parsed;
        return;
      }
    } catch (e) {
      console.error('Error reading DB:', e);
    }
  }
  transactions = seedData();
  saveData();
};

const saveData = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(transactions, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving DB:', e);
  }
};

loadData();

export const getTransactions = () => transactions;

export const clearTransactions = () => { 
  transactions = []; 
  saveData(); 
};

export const addTransaction = (txn) => {
  const newTxn = { ...txn, id: Date.now().toString() + Math.random().toString().slice(2,8) };
  transactions.push(newTxn);
  saveData();
  return newTxn;
};

export const addTransactions = (txns) => {
  const newTxns = txns.map(t => ({ ...t, id: Date.now().toString() + Math.random().toString().slice(2,8) }));
  transactions = [...transactions, ...newTxns];
  saveData();
  return newTxns;
};

export const deleteTransaction = (id) => {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  transactions.splice(idx, 1);
  saveData();
  return true;
};

export const updateTransaction = (id, updates) => {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  transactions[idx] = { ...transactions[idx], ...updates };
  saveData();
  return transactions[idx];
};
