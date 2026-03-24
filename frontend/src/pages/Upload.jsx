import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Header from '../components/Header';
import { uploadCSV, uploadPDF } from '../api/client';
import { useToast } from '../context/ToastContext';
import './Upload.css';

const SAMPLE_CSV = `Date,Description,Amount,Type,Category
2026-03-01,Product Sales,45000,income,Sales
2026-03-05,Office Rent,12000,expense,Rent
2026-03-10,Staff Salaries,25000,expense,Salaries
2026-03-15,Service Revenue,32000,income,Services
2026-03-20,Raw Materials,18000,expense,Inventory`;

const FILE_TYPES = {
  csv: { label: 'CSV / Excel Export', icon: '📊', ext: '.csv', accept: { 'text/csv': ['.csv'] }, color: '#22d3a5', desc: 'From Tally, Excel, Google Sheets, Zoho' },
  pdf: { label: 'Bank Statement PDF', icon: '🏦', ext: '.pdf', accept: { 'application/pdf': ['.pdf'] }, color: '#7c6ff7', desc: 'Text-based bank statement (not scanned/image)' },
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
        <div className="dropzone-content">
          <div className="dropzone-icon">{isDragActive ? '🎯' : cfg.icon}</div>
          <div className="dropzone-title">
            {isDragActive ? `Drop ${cfg.label} here!` : `Drag & Drop ${cfg.label}`}
          </div>
          <div className="dropzone-sub">{cfg.desc}</div>
          <div className="dropzone-sub" style={{ marginTop: 6 }}>or click to browse · {cfg.ext.toUpperCase()} only · Max 20MB</div>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  const [activeTab, setActiveTab] = useState('pdf');
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

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'arthaview_sample.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header title="Import Data" subtitle="Upload bank statements or CSV exports" />
      <div className="page-content animate-in">

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

            {/* Tabs */}
            <div className="upload-tabs">
              {Object.entries(FILE_TYPES).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`upload-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => handleTabChange(key)}
                  style={activeTab === key ? { borderColor: cfg.color, color: cfg.color, background: `${cfg.color}14` } : {}}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              ))}
            </div>

            {/* PDF tip */}
            {activeTab === 'pdf' && (
              <div className="pdf-tip animate-in">
                <span>ℹ️</span>
                <span>
                  Works best with <strong>text-based PDFs</strong> directly downloaded from your bank's internet banking portal.
                  Scanned or photographed statements (image PDFs) are not supported — use your bank's CSV export instead.
                </span>
              </div>
            )}

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
                  ? `⏳ ${activeTab === 'pdf' ? 'Parsing statement...' : 'Processing CSV...'}`
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
                  {activeTab === 'pdf' && (
                    <div className="error-hint">
                      💡 Tip: Try downloading the statement as <strong>CSV</strong> from your bank's portal and use the CSV tab instead.
                    </div>
                  )}
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
              <div className="info-heading">🏦 Supported Bank PDFs</div>
              <div className="source-list">
                {['SBI · HDFC · ICICI · Axis Bank', 'Kotak · Yes Bank · PNB · BOI', 'Any text-based PDF statement', 'Paytm Business / PhonePe reports', 'RazorpayX bank statements'].map((s, i) => (
                  <div key={i} className="source-item">
                    <span className="source-check">✓</span><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

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
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={downloadSample}>
                ⬇ Download Sample CSV
              </button>
            </div>

            <div className="card">
              <div className="info-heading">🔐 Security Promise</div>
              <div className="security-list">
                {['PDF parsed in memory — never written to disk', 'Raw file discarded after extraction', 'No bank credentials required', 'Delete all data anytime from Transactions'].map((s, i) => (
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
