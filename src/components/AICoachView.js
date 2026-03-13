import React, { useState, useRef, useEffect } from 'react';
import { isAIConfigured, sendMessage, buildSystemPrompt, QUICK_PROMPTS } from '../utils/claudeApi';

const WEEKLY_SUMMARY_PROMPT = "Generate a comprehensive weekly summary for me. Include: overall habit completion rate, standout wins, areas to improve, sleep quality analysis, and 3 specific recommendations for next week.";

export default function AICoachView({ habits, completions, moods, sleep, water, goals, workouts, nutrition, wellbeing }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const configured = isAIConfigured();

  const systemPrompt = buildSystemPrompt({ habits, completions, moods, sleep, water, goals, workouts, nutrition, wellbeing });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const reply = await sendMessage(history, systemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message);
      setMessages(prev => prev.slice(0, -1)); // remove the user message on error
    }
    setLoading(false);
  };

  if (!configured) {
    return (
      <div className="ai-coach-view">
        <div className="health-view-header">
          <h2 className="health-view-title">🤖 AI Coach</h2>
          <p className="health-view-sub">Your personalised AI wellness coach</p>
        </div>
        <div className="ai-setup-card">
          <div className="ai-setup-icon">🤖</div>
          <h3 className="ai-setup-title">Set up your AI Coach</h3>
          <p className="ai-setup-desc">Your AI coach analyses your actual habit, sleep, nutrition, and workout data to give you personalised advice — like having a world-class wellness coach in your pocket.</p>
          <div className="ai-setup-steps">
            <div className="ai-setup-step">
              <span className="ai-setup-step-num">1</span>
              <div>Get a free API key at <strong>console.anthropic.com</strong></div>
            </div>
            <div className="ai-setup-step">
              <span className="ai-setup-step-num">2</span>
              <div>Create a <code className="ai-setup-code">.env</code> file in your project root</div>
            </div>
            <div className="ai-setup-step">
              <span className="ai-setup-step-num">3</span>
              <div>Add: <code className="ai-setup-code">REACT_APP_CLAUDE_API_KEY=sk-ant-...</code></div>
            </div>
            <div className="ai-setup-step">
              <span className="ai-setup-step-num">4</span>
              <div>Restart the dev server</div>
            </div>
          </div>
          <div className="ai-preview-features">
            <div className="ai-preview-feature">💬 Ask anything about your habits and health</div>
            <div className="ai-preview-feature">📊 Get insights based on your real data</div>
            <div className="ai-preview-feature">🎯 Personalised goal and habit recommendations</div>
            <div className="ai-preview-feature">🛌 Sleep, nutrition, and workout advice</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-coach-view">
      <div className="health-view-header">
        <h2 className="health-view-title">🤖 AI Coach</h2>
        <p className="health-view-sub">Your personalised AI wellness coach</p>
      </div>

      <div className="ai-chat-container">
        {/* Messages */}
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-welcome">
              <div className="ai-welcome-icon">🤖</div>
              <div className="ai-welcome-title">Hi! I'm your Ritual Coach.</div>
              <div className="ai-welcome-sub">I have access to all your habit, sleep, nutrition, and workout data. Ask me anything.</div>
              <button className="ai-weekly-summary-btn" onClick={() => send(WEEKLY_SUMMARY_PROMPT)}>
                📊 Generate my weekly summary
              </button>
              <div className="ai-quick-prompts">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} className="ai-quick-prompt" onClick={() => send(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="ai-avatar">🤖</div>}
              <div className="ai-message-bubble">
                {msg.content.split('\n').map((line, j) => (
                  <React.Fragment key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant">
              <div className="ai-avatar">🤖</div>
              <div className="ai-message-bubble ai-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && <div className="ai-error">{error}</div>}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (shown after first message) */}
        {messages.length > 0 && !loading && (
          <div className="ai-quick-prompts-row">
            {QUICK_PROMPTS.slice(0, 4).map(p => (
              <button key={p} className="ai-quick-prompt small" onClick={() => send(p)}>{p}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-input-row">
          <textarea
            className="ai-input"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            maxLength={1000}
          />
          <button className="ai-send-btn" onClick={() => send()} disabled={!input.trim() || loading}>
            {loading ? '…' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}
