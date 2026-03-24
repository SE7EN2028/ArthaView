import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 20, textAlign: 'center',
      padding: 24,
    }}>
      <div style={{ fontSize: 80 }}>📉</div>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 48, fontWeight: 800, color: '#fff' }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>This page doesn't exist in your ledger.</p>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/')}
        style={{ marginTop: 8 }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
