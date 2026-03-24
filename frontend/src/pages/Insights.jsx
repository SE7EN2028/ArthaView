import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import { chatWithAI, getQuickInsights } from '../api/ai';
import { getAnomalies, getRecommendations } from '../api/client';
import './Insights.css';

const SUGGESTED = [
  'How can I improve my profit margin?',
  'Which expenses should I cut first?',
  'Is my cash flow healthy?',
  'What are the biggest risks in my finances?',
  'How does my business compare to industry standards?',
];

export default function Insights() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your ArthaView AI advisor powered by Groq (LLaMA 3). I\'ve already analyzed your financial data. Ask me anything about your business!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickInsights, setQuickInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([getQuickInsights(), getAnomalies(), getRecommendations()])
      .then(([qi, an, rec]) => {
        setQuickInsights(qi.insights);
        setAnomalies(an.data);
        setRecommendations(rec.data);
      })
      .finally(() => setInsightsLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await chatWithAI(msg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Sorry, I had trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div>
      <Header title="AI Insights" subtitle="Powered by Groq · LLaMA 3" />
      <div className="page-content animate-in">
        <div className="insights-layout">

          {/* LEFT: Chat */}
          <div className="chat-panel card">
            <div className="chat-header">
              <div className="chat-avatar">🤖</div>
              <div>
                <div className="chat-name">ArthaView AI</div>
                <div className="chat-status">
                  <span className="status-dot" /> Online · LLaMA 3 via Groq
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg-bubble ${msg.role}`}>
                  {msg.role === 'assistant' && <div className="msg-icon">🤖</div>}
                  <div className="msg-content">{msg.content}</div>
                  {msg.role === 'user' && <div className="msg-icon user-icon">You</div>}
                </div>
              ))}
              {loading && (
                <div className="msg-bubble assistant">
                  <div className="msg-icon">🤖</div>
                  <div className="msg-content typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested Questions */}
            <div className="suggestions">
              {SUGGESTED.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>

            <div className="chat-input-row">
              <textarea
                className="chat-input"
                placeholder="Ask about your finances..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="chat-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>

          {/* RIGHT: Panels */}
          <div className="insights-right">

            {/* AI Quick Insights */}
            <div className="card insights-card">
              <div className="card-heading">⚡ AI Quick Insights</div>
              {insightsLoading ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div className="spinner" style={{ width: 20, height: 20 }} /> Analyzing your data...
                </div>
              ) : (
                <div className="quick-insights-text">
                  {quickInsights.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} className="insight-line">{line}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Anomalies */}
            <div className="card">
              <div className="card-heading">🚨 Detected Anomalies</div>
              {anomalies.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}>
                  <div style={{ fontSize: 28 }}>✅</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No anomalies detected</p>
                </div>
              ) : (
                <div className="anomalies-list">
                  {anomalies.map((a, i) => (
                    <div key={i} className={`anomaly-item severity-${a.severity}`}>
                      <div className="anomaly-header">
                        <span className={`badge ${a.severity === 'high' ? 'badge-red' : 'badge-amber'}`}>
                          {a.severity === 'high' ? '🔴 High' : '🟡 Medium'}
                        </span>
                        <span className="anomaly-cat">{a.category}</span>
                      </div>
                      <div className="anomaly-msg">{a.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="card">
              <div className="card-heading">💡 Recommendations</div>
              <div className="reco-list">
                {recommendations.map((r, i) => (
                  <div key={i} className="reco-item">
                    <div className="reco-icon">{r.icon}</div>
                    <div>
                      <div className="reco-title">{r.title}</div>
                      <div className="reco-desc">{r.description}</div>
                    </div>
                    <span className={`badge ${r.priority === 'high' ? 'badge-red' : r.priority === 'medium' ? 'badge-amber' : 'badge-blue'}`}>
                      {r.priority}
                    </span>
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
