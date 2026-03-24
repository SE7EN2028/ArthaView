// In-memory store (simulates DB for hackathon)
let transactions = [
  { id: '1', date: '2026-01-05', description: 'Product Sales - Batch A', amount: 45000, type: 'income', category: 'Sales' },
  { id: '2', date: '2026-01-08', description: 'Office Rent', amount: 12000, type: 'expense', category: 'Rent' },
  { id: '3', date: '2026-01-12', description: 'Raw Material Purchase', amount: 18000, type: 'expense', category: 'Inventory' },
  { id: '4', date: '2026-01-15', description: 'Service Revenue - Client B', amount: 32000, type: 'income', category: 'Services' },
  { id: '5', date: '2026-01-20', description: 'Staff Salaries', amount: 25000, type: 'expense', category: 'Salaries' },
  { id: '6', date: '2026-01-25', description: 'Utility Bills', amount: 4500, type: 'expense', category: 'Utilities' },
  { id: '7', date: '2026-02-03', description: 'Product Sales - Batch B', amount: 52000, type: 'income', category: 'Sales' },
  { id: '8', date: '2026-02-07', description: 'Marketing Campaign', amount: 8000, type: 'expense', category: 'Marketing' },
  { id: '9', date: '2026-02-12', description: 'Office Rent', amount: 12000, type: 'expense', category: 'Rent' },
  { id: '10', date: '2026-02-15', description: 'Consulting Revenue', amount: 28000, type: 'income', category: 'Services' },
  { id: '11', date: '2026-02-18', description: 'Equipment Purchase', amount: 15000, type: 'expense', category: 'Equipment' },
  { id: '12', date: '2026-02-22', description: 'Staff Salaries', amount: 25000, type: 'expense', category: 'Salaries' },
  { id: '13', date: '2026-02-28', description: 'Product Sales - Batch C', amount: 38000, type: 'income', category: 'Sales' },
  { id: '14', date: '2026-03-02', description: 'Utility Bills', amount: 5200, type: 'expense', category: 'Utilities' },
  { id: '15', date: '2026-03-05', description: 'Service Revenue - Client C', amount: 41000, type: 'income', category: 'Services' },
  { id: '16', date: '2026-03-10', description: 'Office Rent', amount: 12000, type: 'expense', category: 'Rent' },
  { id: '17', date: '2026-03-12', description: 'Raw Material Purchase', amount: 22000, type: 'expense', category: 'Inventory' },
  { id: '18', date: '2026-03-16', description: 'Staff Salaries', amount: 25000, type: 'expense', category: 'Salaries' },
  { id: '19', date: '2026-03-18', description: 'Product Sales - Bulk Order', amount: 75000, type: 'income', category: 'Sales' },
  { id: '20', date: '2026-03-22', description: 'Software Subscription', amount: 2500, type: 'expense', category: 'Software' },
];

export const getTransactions = () => transactions;

export const addTransaction = (txn) => {
  const newTxn = { ...txn, id: Date.now().toString() };
  transactions.push(newTxn);
  return newTxn;
};

export const addTransactions = (txns) => {
  const newTxns = txns.map(t => ({ ...t, id: Date.now().toString() + Math.random() }));
  transactions = [...transactions, ...newTxns];
  return newTxns;
};

export const deleteTransaction = (id) => {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  transactions.splice(idx, 1);
  return true;
};

export const updateTransaction = (id, updates) => {
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  transactions[idx] = { ...transactions[idx], ...updates };
  return transactions[idx];
};
