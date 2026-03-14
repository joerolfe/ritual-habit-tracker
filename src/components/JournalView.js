import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { isAIConfigured, sendMessage, buildSystemPrompt, QUICK_PROMPTS } from '../utils/claudeApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

function readEntry(raw) {
  if (!raw) return { content: '', mood: null, tags: [] };
  if (typeof raw === 'string') return { content: raw, mood: null, tags: [] };
  return { content: raw.content || '', mood: raw.mood ?? null, tags: raw.tags || [] };
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fmtShort(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function dayLetter(date) {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
}

function wordCount(text) {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getWeekDays(referenceDate) {
  const d = new Date(referenceDate);
  const dow = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

function highlightText(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(255,159,10,0.3)', color: '#fff', borderRadius: 2 }}>{part}</mark>
      : part
  );
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const today = new Date();

function mockDate(daysAgo) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

const MOCK_JOURNAL = {
  [toKey(mockDate(1))]: { content: "Had a productive day. Finished the main project feature and got great feedback from the team. Went for a run in the evening — felt amazing.", mood: 3, tags: ['Productive', 'Happy'] },
  [toKey(mockDate(2))]: { content: "Felt a bit tired today. Skipped my morning routine which threw off my whole day. Need to be more consistent.", mood: 1, tags: ['Tired', 'Stressed'] },
  [toKey(mockDate(3))]: { content: "Great meditation session this morning. Feeling calm and centered. Had lunch with an old friend which was a real mood boost.", mood: 4, tags: ['Grateful', 'Focused'] },
  [toKey(mockDate(4))]: { content: "Quiet day. Worked from home, got through my task list. Nothing spectacular but steady progress.", mood: 2, tags: ['Productive'] },
  [toKey(mockDate(5))]: { content: "Woke up early and watched the sunrise. Spent time reading. Feeling grateful for small moments.", mood: 4, tags: ['Grateful', 'Happy'] },
  [toKey(mockDate(6))]: { content: "Tough Monday. Back-to-back meetings, barely moved from the desk. Need to schedule proper breaks.", mood: 1, tags: ['Stressed', 'Tired'] },
};

// ─── Constants ───────────────────────────────────────────────────────────────

const WRITING_PROMPTS = [
  "What's one thing that surprised you today?",
  "What are you most grateful for right now?",
  "What would make tomorrow even better?",
  "What's one thing you learned today?",
  "How did you take care of yourself today?",
  "What moment do you want to remember from today?",
  "What challenged you today, and how did you handle it?",
];

const ALL_TAGS = ['Grateful', 'Productive', 'Stressed', 'Tired', 'Focused', 'Happy', 'Anxious', 'Excited', 'Calm', 'Motivated'];

const MOODS = ['😫', '😕', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Awful', 'Bad', 'Okay', 'Good', 'Great'];

const AI_QUICK_PROMPTS = [
  "Summarize my week",
  "What patterns do you see?",
  "How's my mood trend?",
  "What should I focus on?",
  "Ask me anything",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function JournalView({ journal = {}, onSetJournal }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showReflections, setShowReflections] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState(null);
  const [longPressKey, setLongPressKey] = useState(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [promptSkipped, setPromptSkipped] = useState(false);

  const textareaRef = useRef(null);
  const searchInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const longPressTimer = useRef(null);

  // ─── Merged data ────────────────────────────────────────────────────────────

  const merged = useMemo(() => ({ ...MOCK_JOURNAL, ...journal }), [journal]);

  // ─── Load entry when date changes ───────────────────────────────────────────

  useEffect(() => {
    const key = toKey(selectedDate);
    const e = readEntry(merged[key]);
    setContent(e.content);
    setMood(e.mood);
    setTags(e.tags);
    setIsDirty(false);
  }, [selectedDate, journal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-save (debounced 1.5s) ─────────────────────────────────────────────

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      onSetJournal(toKey(selectedDate), { content, mood, tags });
      setIsDirty(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, mood, tags, isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-focus search ──────────────────────────────────────────────────────

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // ─── Scroll chat to bottom ──────────────────────────────────────────────────

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  // ─── Past entries ────────────────────────────────────────────────────────────

  const pastEntries = useMemo(() => {
    const todayKey = toKey(new Date());
    return Object.entries(merged)
      .filter(([k]) => k !== todayKey)
      .map(([k, v]) => ({ key: k, date: new Date(k + 'T12:00:00'), entry: readEntry(v) }))
      .filter(e => !isNaN(e.date))
      .sort((a, b) => b.date - a.date);
  }, [merged]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return pastEntries;
    const q = searchQuery.toLowerCase();
    return pastEntries.filter(e =>
      e.entry.content.toLowerCase().includes(q) ||
      e.entry.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [pastEntries, searchQuery]);

  // ─── Week days ───────────────────────────────────────────────────────────────

  const weekDays = useMemo(() => getWeekDays(new Date()), []);

  // ─── Today's writing prompt ─────────────────────────────────────────────────

  const todayPrompt = useMemo(() => {
    const idx = new Date().getDate() % WRITING_PROMPTS.length;
    return WRITING_PROMPTS[idx];
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleContentChange = useCallback((e) => {
    setContent(e.target.value);
    setIsDirty(true);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, []);

  const handleMoodSelect = useCallback((idx) => {
    setMood(idx);
    setIsDirty(true);
  }, []);

  const handleTagToggle = useCallback((tag) => {
    setTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      setIsDirty(true);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSetJournal(toKey(selectedDate), { content, mood, tags });
    setIsDirty(false);
  }, [selectedDate, content, mood, tags, onSetJournal]);

  const handleReflectionPrompt = useCallback((prompt) => {
    setContent(prev => prev + `\n\n${prompt}\n`);
    setIsDirty(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, 0);
  }, []);

  const handleDeleteEntry = useCallback((key) => {
    onSetJournal(key, { content: '', mood: null, tags: [] });
    setLongPressKey(null);
    if (expandedKey === key) setExpandedKey(null);
  }, [onSetJournal, expandedKey]);

  // ─── Long press ─────────────────────────────────────────────────────────────

  const handlePointerDown = useCallback((key) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressKey(key);
    }, 600);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // ─── AI Chat ─────────────────────────────────────────────────────────────────

  const handleSendChat = useCallback(async (text) => {
    const msg = text || chatInput.trim();
    if (!msg) return;
    setChatInput('');
    const userMsg = { role: 'user', content: msg };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    setChatError(null);
    try {
      const systemPrompt = `You are Ritual AI, a warm and encouraging wellness coach.
The user's journal entries show their daily reflections, moods, and wellbeing.
Today is ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
Recent mood trend: ${Object.entries(merged).slice(-7).map(([k, v]) => MOODS[readEntry(v).mood] || '—').join(' ')}.
Help them reflect, grow, and stay consistent with their habits.
Keep responses warm, concise (2-3 paragraphs), and actionable.`;
      const response = await sendMessage([...chatMessages, userMsg], systemPrompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatMessages, merged]);

  const handleWeeklySummary = useCallback(() => {
    handleSendChat("Give me a comprehensive summary of my week, including mood trends, what I journaled about, and what I should focus on next week.");
  }, [handleSendChat]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const selectedKey = toKey(selectedDate);
  const todayKey = toKey(new Date());

  return (
    <div style={{ background: '#000000', minHeight: '100vh', fontFamily: 'Inter,-apple-system,sans-serif', color: '#fff', paddingBottom: 100 }}>

      {/* ── 1. HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 12px' }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>Journal</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setShowSearch(s => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label="Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label="Calendar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 2. SEARCH BAR ── */}
      {showSearch && (
        <div style={{ padding: '0 20px 12px' }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            style={{
              width: '100%',
              background: '#111111',
              border: '1px solid #333',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* ── 3. WEEK DAYS ROW ── */}
      <div style={{ padding: '0 16px 16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
          {weekDays.map((day, i) => {
            const key = toKey(day);
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const hasEntry = !!merged[key] && readEntry(merged[key]).content.trim().length > 0;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 2px 14px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? '2px solid rgba(255,255,255,0.65)' : '2px solid transparent',
                  background: isToday && !isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 400,
                  flexShrink: 0,
                }}>
                  {dayLetter(day)}
                </div>
                {hasEntry && (
                  <div style={{
                    position: 'absolute',
                    bottom: 2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. TODAY'S ENTRY CARD ── */}
      <div style={{ background: '#111111', borderRadius: 16, margin: '0 16px 16px', padding: 16 }}>

        {/* 4a. Mood selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>How are you feeling?</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {MOODS.map((emoji, idx) => {
              const isSelected = mood === idx;
              const hasMood = mood !== null;
              return (
                <button
                  key={idx}
                  onClick={() => handleMoodSelect(idx)}
                  title={MOOD_LABELS[idx]}
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: isSelected ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
                    cursor: 'pointer',
                    width: isSelected ? 40 : 32,
                    height: isSelected ? 40 : 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSelected ? 22 : 20,
                    opacity: hasMood && !isSelected ? 0.5 : 1,
                    transition: 'all 0.15s',
                    padding: 0,
                  }}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4b. Tags row */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, padding: '4px 0 12px', minWidth: 'max-content' }}>
            {ALL_TAGS.map(tag => {
              const isSelected = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  style={{
                    background: isSelected ? '#FFFFFF' : '#1A1A1A',
                    color: isSelected ? '#000000' : 'rgba(255,255,255,0.55)',
                    fontWeight: isSelected ? 700 : 400,
                    border: isSelected ? 'none' : '1px solid #333',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4c. Writing prompt card */}
        {!promptSkipped && (
          <div style={{
            background: '#111111',
            borderLeft: '3px solid rgba(255,255,255,0.3)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>✨ Today's prompt:</div>
                <div style={{ fontSize: 13, color: '#fff' }}>{todayPrompt}</div>
              </div>
              <button
                onClick={() => setPromptSkipped(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.45)',
                  padding: '0 0 0 12px',
                  whiteSpace: 'nowrap',
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* 4d. Textarea */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="What's on your mind today..."
            style={{
              background: '#1A1A1A',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 17,
              lineHeight: 1.6,
              width: '100%',
              borderRadius: 10,
              padding: 14,
              resize: 'none',
              minHeight: 140,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            pointerEvents: 'none',
          }}>
            {wordCount(content)} words
          </div>
        </div>

        {/* 4e. Reflection prompts (expandable) */}
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowReflections(s => !s)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>💭 Reflection prompts</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: showReflections ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: 'auto' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showReflections && (
            <div>
              {["What went well today?", "What would you do differently?", "What are you grateful for?"].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleReflectionPrompt(prompt)}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #333',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: '#fff',
                    textAlign: 'left',
                    width: '100%',
                    marginBottom: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4f. Save button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: isDirty ? '#FFFFFF' : '#1A1A1A',
            color: isDirty ? '#000000' : 'rgba(255,255,255,0.45)',
            borderRadius: 30,
            padding: 14,
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {isDirty ? 'Save Entry' : 'Saved ✓'}
        </button>
      </div>

      {/* ── 5. AI COACH CARD ── */}
      <div style={{
        background: '#111111',
        borderRadius: 16,
        margin: '0 16px 16px',
        padding: 16,
        border: '1px solid rgba(255,255,255,0.21)',
      }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>🤖 Ritual AI</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Ask your wellness coach</div>
        </div>

        {/* Quick prompt chips */}
        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, minWidth: 'max-content', padding: '4px 0' }}>
            {AI_QUICK_PROMPTS.map(chip => (
              <button
                key={chip}
                onClick={() => { setShowAIChat(true); setTimeout(() => handleSendChat(chip), 100); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #FFFFFF',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input or setup message */}
        {isAIConfigured() ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setShowAIChat(true);
                  setTimeout(() => handleSendChat(chatInput), 100);
                }
              }}
              placeholder="Ask your AI coach..."
              style={{
                flex: 1,
                background: '#1A1A1A',
                border: '1px solid #333',
                borderRadius: 24,
                padding: '10px 16px',
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => { setShowAIChat(true); setTimeout(() => handleSendChat(chatInput), 100); }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#FFA726', padding: '8px 0' }}>
            Add REACT_APP_CLAUDE_API_KEY to .env to enable AI
          </div>
        )}
      </div>

      {/* ── 6. PAST ENTRIES SECTION ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 16px 8px' }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Previous entries</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{filteredEntries.length}</span>
      </div>

      {filteredEntries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', padding: '40px 0', fontSize: 14 }}>
          {searchQuery ? 'No entries match your search.' : 'No entries yet. Start journaling above.'}
        </div>
      ) : (
        filteredEntries.map(({ key, date, entry }) => {
          const isExpanded = expandedKey === key;
          const isLongPress = longPressKey === key;
          const preview = entry.content.slice(0, 80) + (entry.content.length > 80 ? '…' : '');

          return (
            <div
              key={key}
              style={{
                background: '#111111',
                borderRadius: 12,
                margin: '0 16px 8px',
                padding: '14px 16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => {
                if (!isLongPress) setExpandedKey(isExpanded ? null : key);
              }}
              onPointerDown={() => handlePointerDown(key)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  {fmtShort(date)} · {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                </span>
                <span style={{ fontSize: 22 }}>
                  {entry.mood !== null ? MOODS[entry.mood] : ''}
                </span>
              </div>

              {/* Content preview or full */}
              <div style={{
                fontSize: 13,
                color: '#ccc',
                overflow: 'hidden',
                textOverflow: isExpanded ? 'unset' : 'ellipsis',
                whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                lineHeight: isExpanded ? 1.6 : 'normal',
                marginBottom: entry.tags.length > 0 ? 8 : 0,
                wordBreak: isExpanded ? 'break-word' : 'normal',
              }}>
                {searchQuery
                  ? highlightText(isExpanded ? entry.content : preview, searchQuery)
                  : (isExpanded ? entry.content : preview)
                }
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {entry.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#1A1A1A',
                        border: '1px solid #333',
                        borderRadius: 10,
                        padding: '2px 8px',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.55)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Long-press delete confirm */}
              {isLongPress && (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #222' }}
                  onClick={e => e.stopPropagation()}
                >
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 }}>Delete entry?</span>
                  <button
                    onClick={() => handleDeleteEntry(key)}
                    style={{
                      background: 'rgba(255,59,48,0.15)',
                      border: '1px solid rgba(255,59,48,0.4)',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: '#FF3B30',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setLongPressKey(null)}
                    style={{
                      background: '#1A1A1A',
                      border: '1px solid #333',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── 7. AI CHAT FULL-SCREEN OVERLAY ── */}
      {showAIChat && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter,-apple-system,sans-serif',
        }}>
          {/* Chat header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 16px 12px',
            borderBottom: '1px solid #1A1A1A',
            flexShrink: 0,
          }}>
            <button
              onClick={() => { setShowAIChat(false); setChatMessages([]); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#FFFFFF',
                padding: '0 12px 0 0',
                lineHeight: 1,
              }}
              aria-label="Back"
            >
              ←
            </button>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700 }}>Ritual AI</span>
            <button
              onClick={handleWeeklySummary}
              style={{
                background: 'transparent',
                border: '1px solid #FFFFFF',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                color: '#FFFFFF',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              Weekly Summary
            </button>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 20px' }}>
            {chatMessages.length === 0 && !chatLoading ? (
              /* Empty state */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.105)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  marginBottom: 16,
                  border: '2px solid rgba(255,255,255,0.21)',
                }}>
                  🤖
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
                  How can I help you today?
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  width: '100%',
                  maxWidth: 360,
                  padding: '0 16px',
                  boxSizing: 'border-box',
                }}>
                  {AI_QUICK_PROMPTS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSendChat(chip)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #FFFFFF',
                        borderRadius: 20,
                        padding: '10px 14px',
                        fontSize: 13,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontFamily: 'inherit',
                        lineHeight: 1.3,
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{
                      background: msg.role === 'user' ? 'rgba(255,255,255,0.12)' : '#111111',
                      color: '#FFFFFF',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      maxWidth: msg.role === 'user' ? '80%' : '85%',
                      padding: '10px 14px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                    <div style={{ background: '#111', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[0, 1, 2].map(n => (
                        <div
                          key={n}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            animation: 'dotBounce 1.2s ease-in-out infinite',
                            animationDelay: `${n * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {chatError && (
                  <div style={{ fontSize: 13, color: '#FF3B30', textAlign: 'center', padding: '8px 0' }}>
                    {chatError}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            background: '#111111',
            padding: '12px 16px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid #1A1A1A',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !chatLoading) handleSendChat(); }}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                background: '#1A1A1A',
                border: '1px solid #333',
                borderRadius: 24,
                padding: '10px 16px',
                fontSize: 15,
                color: '#fff',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: chatLoading || !chatInput.trim() ? '#333' : '#FFFFFF',
                border: 'none',
                cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={chatLoading || !chatInput.trim() ? '#666' : '#000000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Dot bounce animation ── */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
