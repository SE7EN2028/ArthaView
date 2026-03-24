import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '../components/Header';
import { uploadCSV, uploadPDF } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Upload.css';



const FILE_TYPES = {
  csv: { label: 'CSV / Excel Export', icon: '📊', ext: '.csv', accept: { 'text/csv': ['.csv'] }, color: '#22d3a5', desc: 'From Tally, Excel, Google Sheets, Zoho' },
};

function DropZone({ fileType, onFile, file, onClear }) {
  const cfg = FILE_TYPES[fileType];
  const onDrop = useCallback((accepted) => { if (accepted[0]) onFile(accepted[0]); }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: cfg.accept, maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
      style={{ borderColor: file ? cfg.color : undefined }}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="file-selected">
          <div className="file-icon">{cfg.icon}</div>
          <div className="file-name">{file.name}</div>
          <div className="file-size">{(file.size / 1024).toFixed(1)} KB · {cfg.ext.toUpperCase()}</div>
          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onClear(); }}>
            ✕ Remove
          </button>
        </div>
      ) : (
        <div className={`dropzone-content ${isDragActive ? 'active-pulse' : ''}`}>
          <div className="dropzone-icon" style={{ transform: isDragActive ? 'scale(1.2)' : 'none', transition: '0.2s' }}>
            {isDragActive ? '📥' : cfg.icon}
          </div>
          <div className="dropzone-title" style={{ color: isDragActive ? cfg.color : '' }}>
            {isDragActive ? 'Release to upload...' : `Drag & Drop ${cfg.label}`}
          </div>
          <div className="dropzone-sub">{cfg.desc}</div>
          <div className="dropzone-sub" style={{ marginTop: 6 }}>or click to browse &middot; {cfg.ext.toUpperCase()} only &middot; Max 20MB</div>
          <div className="dropzone-sub" style={{ marginTop: 12, color: 'var(--accent-green)', fontWeight: 500 }}>
            ✨ Imports safely append to your existing data. Nothing is overwritten.
          </div>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  const [activeTab, setActiveTab] = useState('csv');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleTabChange = (tab) => { setActiveTab(tab); setFile(null); setResult(null); setError(null); };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setResult(null); setError(null);
    try {
      const res = activeTab === 'csv' ? await uploadCSV(file) : await uploadPDF(file);
      setResult(res);
      toast({ message: `✅ ${res.message}`, type: 'success' });
      setFile(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please check your file format.';
      setError(msg);
      toast({ message: msg, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = (typeId) => {
    if (!typeId) return;
    
    let csv = 'Date,Description,Amount,Type,Category\n';
    
    const configs = {
      ecommerce: { inc: ['Product Sales', 'Shipping Revenue'], exp: ['Inventory', 'Ads', 'Hosting', 'Shipping'] },
      freelance: { inc: ['Consulting', 'Development', 'Design'], exp: ['Software', 'Internet', 'Marketing', 'Hardware'] },
      retail:    { inc: ['Store Sales', 'Bulk Orders'], exp: ['Rent', 'Utilities', 'Inventory', 'Salaries'] },
      agency:    { inc: ['Retainer', 'Project Fee'], exp: ['Salaries', 'Software', 'Rent', 'Ads'] },
      manufacturing: { inc: ['Wholesale', 'Export'], exp: ['Raw Materials', 'Machinery', 'Labor', 'Logistics'] }
    };
    
    const cfg = configs[typeId] || configs.ecommerce;
    const start = new Date(); start.setMonth(start.getMonth() - 7);
    const end = new Date();
    
    const rows = [];
    for (let i = 0; i < 115; i++) {
      const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      const isInc = Math.random() > 0.65;
      const type = isInc ? 'income' : 'expense';
      const amount = Math.floor(Math.random() * 80000) + (isInc ? 5000 : 1000);
      
      let cat = isInc ? cfg.inc[Math.floor(Math.random() * cfg.inc.length)] : cfg.exp[Math.floor(Math.random() * cfg.exp.length)];
      let desc = isInc ? `Invoice #${1000+Math.floor(Math.random()*9000)} Payment` : `Vendor Payment - ${cat}`;
      
      rows.push({ date: d.toISOString().split('T')[0], desc, amount, type, cat });
    }
    
    rows.sort((a,b) => new Date(a.date) - new Date(b.date));
    rows.forEach(r => { csv += `${r.date},"${r.desc}",${r.amount},${r.type},${r.cat}\n`; });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `arthaview_${typeId}_sample.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Header title="Import Data" subtitle="Upload bank statements or CSV exports" />
        <div style={{ paddingRight: 32, display: 'flex', gap: 8 }}>
          <span className="badge badge-green">CSV</span>
        </div>
      </div>
      <div className="page-content animate-in" style={{ paddingTop: 0 }}>

        {/* Privacy Notice */}
        <div className="privacy-banner">
          <div className="privacy-icon">🔒</div>
          <div>
            <div className="privacy-title">Bank-Grade Privacy Promise</div>
            <div className="privacy-desc">
              Your files are processed in server memory only — never written to disk or stored permanently.
              Raw files are discarded after extraction. Only structured transaction data is saved, and you can delete it anytime.
            </div>
          </div>
        </div>

        <div className="upload-layout">
          <div className="upload-main">



            {/* Drop Zone */}
            <DropZone
              fileType={activeTab}
              file={file}
              onFile={setFile}
              onClear={() => setFile(null)}
            />

            {file && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16, justifyContent: 'center', fontSize: 15, padding: '13px 0' }}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? `⏳ Processing CSV...`
                  : `⬆ Import ${FILE_TYPES[activeTab].label}`}
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="upload-error animate-in">
                <div className="error-icon">⚠️</div>
                <div>
                  <div className="error-title">Import Failed</div>
                  <div className="error-msg">{error}</div>

                </div>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="upload-result animate-in">
                <div className="result-header">
                  ✅ Import Successful
                  {result.pages && <span className="result-pages"> · {result.pages} pages parsed</span>}
                </div>
                <div className="result-count">{result.data?.length || 0} transactions imported</div>
                <div className="result-table">
                  {result.data?.slice(0, 8).map((t, i) => (
                    <div key={i} className="result-row">
                      <span className="result-date">{t.date}</span>
                      <span className="result-desc">{t.description}</span>
                      <span className="result-cat">{t.category}</span>
                      <span className={`result-amt ${t.type}`}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {(result.data?.length || 0) > 8 && (
                    <div className="result-more">+{result.data.length - 8} more transactions — view in Transactions page</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Info Panel */}
          <div className="upload-info">


            <div className="card">
              <div className="info-heading">📋 CSV Format Guide</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Your CSV should have these columns:
              </p>
              <div className="csv-columns">
                {[['Date', ''], ['Description', ''], ['Amount', ''], ['Type', 'income / expense'], ['Category', 'optional']].map(([col, note]) => (
                  <div key={col} className="csv-col">
                    <span className="col-name">{col}</span>
                    {note && <span className="col-note">{note}</span>}
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select 
                  className="form-select" 
                  style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                  onChange={(e) => {
                    if (e.target.value) { downloadSample(e.target.value); e.target.value = ''; }
                  }}
                >
                  <option value="">⬇ Download Sample Data</option>
                  <option value="ecommerce">E-Commerce Business</option>
                  <option value="freelance">Freelance / Independent</option>
                  <option value="retail">Retail Store</option>
                  <option value="agency">Service Agency</option>
                  <option value="manufacturing">Manufacturing Plant</option>
                </select>
              </div>
            </div>

            <div className="card">
              <div className="info-heading">🔐 Security Promise</div>
              <div className="security-list">
                {['Imported files safely append to existing records', 'File parsed in memory — never written to disk', 'Raw file discarded after extraction', 'No bank credentials required', 'Delete all data anytime from Transactions'].map((s, i) => (
                  <div key={i} className="security-item">
                    <span>🛡️</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
