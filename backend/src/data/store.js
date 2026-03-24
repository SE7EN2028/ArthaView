// In-memory store (simulates DB for hackathon)
let transactions = [];

export const getTransactions = () => transactions;

export const clearTransactions = () => { transactions = []; };

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
