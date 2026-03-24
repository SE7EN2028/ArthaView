import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, uploadCSV } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Sheet.css';

const CATEGORIES = ['Sales', 'Services', 'Rent', 'Salaries', 'Inventory', 'Marketing', 'Utilities', 'Equipment', 'Software', 'Transport', 'Taxes', 'Other', 'Uncategorized'];

export default function Sheet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    getTransactions().then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCellChange = (id, field, value) => {
    setData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleCellBlur = async (id, field, value, originalValue) => {
    if (value === originalValue) return; // no change
    try {
      if (field === 'amount') value = parseFloat(value) || 0;
      await updateTransaction(id, { [field]: value });
      toast({ message: `Updated ${field}`, type: 'success' });
    } catch {
      toast({ message: `Failed to update ${field}`, type: 'error' });
      load(); // revert on fail
    }
  };

  const handleAddRow = async () => {
    const newTxn = {
      date: new Date().toISOString().split('T')[0],
      description: 'New Transaction',
      amount: 0,
      type: 'expense',
      category: 'Uncategorized'
    };
    try {
      const res = await addTransaction(newTxn);
      setData([res.data, ...data]); // Insert at top
      toast({ message: 'Added new row', type: 'success' });
    } catch {
      toast({ message: 'Failed to add row', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this row?')) return;
    try {
      await deleteTransaction(id);
      setData(prev => prev.filter(r => r.id !== id));
      toast({ message: 'Row deleted', type: 'info' });
    } catch {
      toast({ message: 'Failed to delete row', type: 'error' });
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadCSV(file);
      toast({ message: `✅ ${res.message}`, type: 'success' });
      load();
    } catch {
      toast({ message: 'CSV Import failed', type: 'error' });
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="sheet-page">
      <Header title="Data Sheet" subtitle="Spreadsheet view to bulk edit and manage your data" />
      <div className="page-content animate-in sheet-content">
        
        <div className="sheet-toolbar card">
          <div className="toolbar-left">
            <button className="btn btn-primary btn-sm" onClick={handleAddRow}>
              + Add Row
            </button>
            <div className="toolbar-divider" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.length} records</span>
          </div>
          
          <div className="toolbar-actions">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleCsvUpload} 
            />
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '⏳ Importing...' : '📥 Quick Import CSV'}
            </button>
          </div>
        </div>

        <div className="sheet-container card">
          {data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No data found</h3>
              <p>Add a row manually or import a CSV to get started.</p>
            </div>
          ) : (
            <div className="sheet-scroll">
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Date</th>
                    <th style={{ flex: 1 }}>Description</th>
                    <th style={{ width: 150 }}>Category</th>
                    <th style={{ width: 120 }}>Type</th>
                    <th style={{ width: 150 }}>Amount (₹)</th>
                    <th style={{ width: 50, textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(row => (
                    <tr key={row.id}>
                      <td>
                        <input 
                          className="sheet-input" 
                          type="date" 
                          value={row.date} 
                          onChange={(e) => handleCellChange(row.id, 'date', e.target.value)}
                          onBlur={(e) => handleCellBlur(row.id, 'date', e.target.value, row.date)}
                        />
                      </td>
                      <td>
                        <input 
                          className="sheet-input" 
                          type="text" 
                          value={row.description} 
                          onChange={(e) => handleCellChange(row.id, 'description', e.target.value)}
                          onBlur={(e) => handleCellBlur(row.id, 'description', e.target.value, row.description)}
                        />
                      </td>
                      <td>
                        <select 
                          className="sheet-select" 
                          value={row.category}
                          onChange={(e) => {
                            handleCellChange(row.id, 'category', e.target.value);
                            handleCellBlur(row.id, 'category', e.target.value, row.category);
                          }}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td>
                        <select 
                          className="sheet-select" 
                          value={row.type}
                          onChange={(e) => {
                            handleCellChange(row.id, 'type', e.target.value);
                            handleCellBlur(row.id, 'type', e.target.value, row.type);
                          }}
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          className={`sheet-input amount-cell ${row.type}`}
                          type="number" 
                          value={row.amount} 
                          onChange={(e) => handleCellChange(row.id, 'amount', e.target.value)}
                          onBlur={(e) => handleCellBlur(row.id, 'amount', e.target.value, row.amount)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="row-delete-btn" onClick={() => handleDelete(row.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
