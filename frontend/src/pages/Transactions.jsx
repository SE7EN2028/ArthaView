import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { getTransactions, addTransaction, deleteTransaction } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Transactions.css';

const CATEGORIES = ['Sales', 'Services', 'Rent', 'Salaries', 'Inventory', 'Marketing', 'Utilities', 'Equipment', 'Software', 'Transport', 'Other'];
const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const emptyForm = { date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'income', category: 'Sales' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [sort, setSort] = useState({ col: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    getTransactions(filter).then(r => setTransactions(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) return toast({ message: 'Fill all fields', type: 'error' });
    setSubmitting(true);
    try {
      await addTransaction({ ...form, amount: parseFloat(form.amount) });
      toast({ message: 'Transaction added!', type: 'success' });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch {
      toast({ message: 'Failed to add transaction', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast({ message: 'Deleted', type: 'success' });
      load();
    } catch {
      toast({ message: 'Delete failed', type: 'error' });
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const toggleSort = (col) => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  const sortIcon = (col) => sort.col === col ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ⬍';

  const sorted = [...transactions].sort((a, b) => {
    let av = a[sort.col], bv = b[sort.col];
    if (sort.col === 'amount') { av = +av; bv = +bv; }
    if (av < bv) return sort.dir === 'asc' ? -1 : 1;
    if (av > bv) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const exportData = (type) => {
    let toExport = sorted;
    if (type === 'income') toExport = sorted.filter(t => t.type === 'income');
    else if (type === 'expense') toExport = sorted.filter(t => t.type === 'expense');

    if (toExport.length === 0) return toast({ message: `No ${type || 'matching'} transactions to export`, type: 'error' });

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = toExport.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arthaview-${type ? type + '-' : ''}transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <Header title="Transactions" subtitle="Track all your income and expenses" />
      <div className="page-content animate-in">

        {/* Summary Strip */}
        <div className="txn-summary">
          <div className="txn-summary-item income-item">
            <span className="summary-icon">📥</span>
            <div>
              <div className="summary-label">Total Income</div>
              <div className="summary-value income-value">{fmt(totalIncome)}</div>
            </div>
          </div>
          <div className="txn-summary-divider" />
          <div className="txn-summary-item expense-item">
            <span className="summary-icon">📤</span>
            <div>
              <div className="summary-label">Total Expenses</div>
              <div className="summary-value expense-value">{fmt(totalExpense)}</div>
            </div>
          </div>
          <div className="txn-summary-divider" />
          <div className="txn-summary-item">
            <span className="summary-icon">📊</span>
            <div>
              <div className="summary-label">Net Balance</div>
              <div className={`summary-value ${totalIncome - totalExpense >= 0 ? 'income-value' : 'expense-value'}`}>
                {fmt(totalIncome - totalExpense)}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="txn-controls">
          <div className="txn-filters">
            <input
              className="form-input filter-input"
              placeholder="🔍 Search transactions..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />
            <select
              className="form-select filter-select"
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select 
              className="form-select filter-select" 
              style={{ fontWeight: 600, cursor: 'pointer' }}
              onChange={(e) => {
                if (e.target.value) { 
                  exportData(e.target.value === 'all' ? '' : e.target.value); 
                  e.target.value = ''; 
                }
              }}
              disabled={transactions.length === 0}
            >
              <option value="">📥 Export CSV...</option>
              <option value="all">Export All</option>
              <option value="income">Export Income Only</option>
              <option value="expense">Export Expense Only</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add Transaction'}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card txn-form-card animate-in">
            <h3 className="form-heading">New Transaction</h3>
            <form onSubmit={handleSubmit} className="txn-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="income">💚 Income</option>
                    <option value="expense">❤️ Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="e.g. Product sales batch A" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : '✓ Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : transactions.length === 0 && (filter.search || filter.type) ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No matching transactions</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No transactions found</h3>
              <p>Add your first transaction or import a CSV file</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('date')} style={{cursor:'pointer'}}>Date{sortIcon('date')}</th>
                    <th onClick={() => toggleSort('description')} style={{cursor:'pointer'}}>Description{sortIcon('description')}</th>
                    <th onClick={() => toggleSort('category')} style={{cursor:'pointer'}}>Category{sortIcon('category')}</th>
                    <th onClick={() => toggleSort('type')} style={{cursor:'pointer'}}>Type{sortIcon('type')}</th>
                    <th onClick={() => toggleSort('amount')} style={{cursor:'pointer'}}>Amount{sortIcon('amount')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => (
                    <tr key={t.id}>
                      <td className="date-cell">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="desc-cell">{t.description}</td>
                      <td><span className="badge badge-purple">{t.category}</span></td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'}`}>
                          {t.type === 'income' ? '▲ Income' : '▼ Expense'}
                        </span>
                      </td>
                      <td className={`amount-cell ${t.type === 'income' ? 'income-amt' : 'expense-amt'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-row">
            <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span className="pagination-info">Page {page} of {totalPages} &middot; {sorted.length} transactions</span>
            <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}

      </div>
    </div>
  );
}
