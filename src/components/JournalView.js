import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function migrateEntry(raw) {
  if (!raw || raw === undefined) return { content: '', tags: [], mood: null, photo: null };
  if (typeof raw === 'string') return { content: raw, tags: [], mood: null, photo: null };
  return { content: raw.content || '', tags: raw.tags || [], mood: raw.mood ?? null, photo: raw.photo || null };
}

function stripHTML(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDisplayDate(date) {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatEntryDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

const PROMPTS = [
  "What are you most grateful for today?",
  "What's one thing you want to accomplish tomorrow?",
  "Describe a challenge you faced today and how you handled it.",
  "What made you smile today?",
  "What is one thing you could have done better?",
];

const PRESET_TAGS = ['#gratitude','#milestone','#vent','#reflection','#win','#lesson','#anxiety','#dream'];

const MOODS = ['😫','😔','😐','😊','🌟'];

const TEMPLATES = [
  {
    name: 'Morning Pages',
    html: '<h3>Brain Dump</h3><p></p><h3>What am I feeling?</h3><p></p><h3>What do I want today?</h3><p></p>',
  },
  {
    name: 'Evening Wind-Down',
    html: '<h3>What went well today?</h3><p></p><h3>What could have gone better?</h3><p></p><h3>What am I grateful for?</h3><p></p>',
  },
  {
    name: 'Weekly Reflection',
    html: '<h3>Biggest win this week</h3><p></p><h3>Biggest challenge</h3><p></p><h3>What did I learn?</h3><p></p><h3>What will I do differently?</h3><p></p><h3>Theme for next week</h3><p></p>',
  },
  {
    name: 'Gratitude Deep-Dive',
    html: '<h3>I am grateful for...</h3><p></p><h3>A person I appreciate</h3><p></p><h3>Something I take for granted</h3><p></p><h3>A recent moment of joy</h3><p></p><h3>How can I give back today?</h3><p></p>',
  },
];

// ─── Stats helpers ────────────────────────────────────────────────────────────

function computeStreak(journal, today) {
  let current = 0;
  let d = new Date(today);
  while (true) {
    const key = toDateKey(d);
    const entry = migrateEntry(journal[key]);
    if (entry.content && stripHTML(entry.content).trim()) {
      current++;
      d = addDays(d, -1);
    } else {
      break;
    }
  }
  return current;
}

function computeLongestStreak(journal) {
  const keys = Object.keys(journal).sort();
  if (keys.length === 0) return 0;
  let longest = 0;
  let current = 0;
  let prev = null;
  for (const key of keys) {
    const entry = migrateEntry(journal[key]);
    if (!entry.content || !stripHTML(entry.content).trim()) continue;
    if (!prev) {
      current = 1;
    } else {
      const prevDate = new Date(prev.replace(/-/g, '/'));
      const curDate = new Date(key.replace(/-/g, '/'));
      const diff = (curDate - prevDate) / (1000 * 60 * 60 * 24);
      current = diff === 1 ? current + 1 : 1;
    }
    if (current > longest) longest = current;
    prev = key;
  }
  return longest;
}

function heatmapColor(wc) {
  if (wc === 0) return 'transparent';
  if (wc < 100) return 'rgba(200, 169, 110, 0.3)';
  if (wc < 300) return 'rgba(200, 169, 110, 0.6)';
  return '#c8a96e';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toolbar({ editor }) {
  if (!editor) return null;
  const btn = (action, label, activeCheck) => (
    <button
      type="button"
      className={`jtb-btn${activeCheck ? ' jtb-active' : ''}`}
      onMouseDown={e => { e.preventDefault(); action(); }}
      title={label}
    >
      {label}
    </button>
  );
  return (
    <div className="journal-toolbar">
      {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
      {btn(() => editor.chain().focus().toggleBulletList().run(), '•', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1.', editor.isActive('orderedList'))}
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '❝', editor.isActive('blockquote'))}
    </div>
  );
}

function TagsRow({ tags, onChange }) {
  const [custom, setCustom] = useState('');

  function toggle(tag) {
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    onChange(next);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && custom.trim()) {
      const tag = custom.trim().startsWith('#') ? custom.trim() : `#${custom.trim()}`;
      if (!tags.includes(tag)) onChange([...tags, tag]);
      setCustom('');
    }
  }

  return (
    <div className="journal-tags-row">
      {PRESET_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          className={`journal-tag-chip${tags.includes(tag) ? ' active' : ''}`}
          onClick={() => toggle(tag)}
        >
          {tag}
        </button>
      ))}
      {tags.filter(t => !PRESET_TAGS.includes(t)).map(tag => (
        <button
          key={tag}
          type="button"
          className="journal-tag-chip active"
          onClick={() => toggle(tag)}
        >
          {tag}
        </button>
      ))}
      <input
        className="journal-tag-input"
        type="text"
        placeholder="+ tag"
        value={custom}
        onChange={e => setCustom(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

function MoodRow({ mood, onChange }) {
  return (
    <div className="journal-mood-row">
      <span className="journal-mood-label">Mood:</span>
      {MOODS.map((emoji, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            className={`journal-mood-btn${mood === val ? ' active' : ''}`}
            onClick={() => onChange(mood === val ? null : val)}
            title={`Mood ${val}`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

function PhotoSection({ photo, onChange }) {
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="journal-photo-section">
      <button
        type="button"
        className="journal-photo-btn"
        onClick={() => fileRef.current && fileRef.current.click()}
        title="Attach photo"
      >
        📷
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {photo && (
        <div className="journal-photo-thumb-wrap">
          <img src={photo} alt="Attachment" className="journal-photo-thumb" style={{ maxHeight: 180, borderRadius: 8 }} />
          <button type="button" className="journal-photo-remove" onClick={() => onChange(null)}>×</button>
        </div>
      )}
    </div>
  );
}

function OnThisDay({ journal, dateKey }) {
  const [expanded, setExpanded] = useState(false);
  const [y, m, d] = dateKey.split('-');
  const mmdd = `${m}-${d}`;
  const currentYear = parseInt(y, 10);

  const pastEntries = useMemo(() => {
    return Object.keys(journal)
      .filter(k => {
        const [ky, km, kd] = k.split('-');
        return `${km}-${kd}` === mmdd && parseInt(ky, 10) < currentYear;
      })
      .sort((a, b) => b.localeCompare(a))
      .map(k => {
        const entry = migrateEntry(journal[k]);
        const text = stripHTML(entry.content);
        return { year: k.split('-')[0], preview: text.slice(0, 120) + (text.length > 120 ? '…' : '') };
      })
      .filter(e => e.preview.trim());
  }, [journal, mmdd, currentYear]);

  if (pastEntries.length === 0) return null;

  return (
    <div className="on-this-day-card">
      <button
        type="button"
        className="on-this-day-toggle"
        onClick={() => setExpanded(v => !v)}
      >
        <span>🗓 On This Day</span>
        <span className="on-this-day-count">{pastEntries.length} {pastEntries.length === 1 ? 'entry' : 'entries'}</span>
        <span className="on-this-day-chevron">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="on-this-day-entries">
          {pastEntries.map(e => (
            <div key={e.year} className="on-this-day-entry">
              <span className="on-this-day-year">{e.year}</span>
              <p className="on-this-day-text">{e.preview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplatesModal({ onSelect, onClose }) {
  return (
    <div className="templates-modal-overlay" onClick={onClose}>
      <div className="templates-modal" onClick={e => e.stopPropagation()}>
        <div className="templates-modal-header">
          <h3>Templates</h3>
          <button type="button" className="templates-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="templates-grid">
          {TEMPLATES.map(t => (
            <button
              key={t.name}
              type="button"
              className="template-card"
              onClick={() => onSelect(t.html)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsView({ journal, today }) {
  const stats = useMemo(() => {
    const allKeys = Object.keys(journal);
    const entries = allKeys.map(k => ({ key: k, entry: migrateEntry(journal[k]) }))
      .filter(({ entry }) => entry.content && stripHTML(entry.content).trim());

    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, { entry }) => sum + wordCount(stripHTML(entry.content)), 0);
    const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    const todayKey = toDateKey(today);
    const [ty, tm] = todayKey.split('-');
    const entriesThisMonth = entries.filter(({ key }) => key.startsWith(`${ty}-${tm}`)).length;

    const currentStreak = computeStreak(journal, today);
    const longestStreak = computeLongestStreak(journal);

    // Top 5 tags
    const tagCounts = {};
    for (const { entry } of entries) {
      for (const tag of entry.tags || []) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalEntries, totalWords, avgWords, currentStreak, longestStreak, entriesThisMonth, topTags };
  }, [journal, today]);

  // Build 12-month heatmap for current year
  const todayKey = toDateKey(today);
  const currentYear = parseInt(todayKey.split('-')[0], 10);

  const heatmapData = useMemo(() => {
    return MONTH_NAMES.map((_, mi) => {
      const daysInMonth = new Date(currentYear, mi + 1, 0).getDate();
      return Array.from({ length: 31 }, (_, di) => {
        if (di >= daysInMonth) return -1; // out of month
        const m = String(mi + 1).padStart(2, '0');
        const d = String(di + 1).padStart(2, '0');
        const key = `${currentYear}-${m}-${d}`;
        const entry = migrateEntry(journal[key]);
        return wordCount(stripHTML(entry.content));
      });
    });
  }, [journal, currentYear]);

  return (
    <div className="journal-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalEntries}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalWords.toLocaleString()}</div>
          <div className="stat-label">Total Words</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgWords}</div>
          <div className="stat-label">Avg Words / Entry</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">Longest Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.entriesThisMonth}</div>
          <div className="stat-label">This Month</div>
        </div>
      </div>

      {stats.topTags.length > 0 && (
        <div className="stats-section">
          <h4 className="stats-section-title">Top Tags</h4>
          <div className="stats-tags-row">
            {stats.topTags.map(([tag, count]) => (
              <span key={tag} className="journal-tag-chip active">
                {tag} <span className="tag-count">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="stats-section">
        <h4 className="stats-section-title">{currentYear} Writing Heatmap</h4>
        <div className="journal-heatmap">
          <div className="heatmap-col-labels">
            <div className="heatmap-row-label-spacer" />
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className="heatmap-col-label">{i + 1}</div>
            ))}
          </div>
          {heatmapData.map((row, mi) => (
            <div key={mi} className="heatmap-row">
              <div className="heatmap-row-label">{MONTH_SHORT[mi]}</div>
              {row.map((wc, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{ background: wc === -1 ? 'transparent' : heatmapColor(wc) }}
                  title={wc >= 0 ? `${MONTH_SHORT[mi]} ${di + 1}: ${wc} words` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JournalView({ journal, onSetJournal }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'stats'

  const dateKey = toDateKey(selectedDate);
  const entry = useMemo(() => migrateEntry(journal[dateKey]), [journal, dateKey]);

  const prompt = useMemo(() => {
    const idx = getDayOfYear(selectedDate) % PROMPTS.length;
    return PROMPTS[idx];
  }, [selectedDate]);

  const isToday = selectedDate.getTime() === today.getTime();

  // ── Editor ──────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write here...' }),
    ],
    content: entry.content || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onSetJournal(dateKey, { ...migrateEntry(journal[dateKey]), content: html });
    },
  });

  // Reinitialize editor content when date changes
  useEffect(() => {
    if (!editor) return;
    const newContent = migrateEntry(journal[dateKey]).content || '';
    // Only set if the content is actually different to avoid cursor jump
    if (editor.getHTML() !== newContent) {
      editor.commands.setContent(newContent, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, editor]);

  const editorWordCount = useMemo(() => {
    if (!editor) return 0;
    return wordCount(editor.getText().trim());
    // We want this to recompute when the editor content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, entry.content]);

  // ── Entry update helpers ────────────────────────────────────────────────────
  const updateEntry = useCallback((patch) => {
    const current = migrateEntry(journal[dateKey]);
    onSetJournal(dateKey, { ...current, ...patch });
  }, [journal, dateKey, onSetJournal]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  function goBack() { setSelectedDate(d => addDays(d, -1)); }
  function goForward() {
    if (!isToday) {
      const next = addDays(selectedDate, 1);
      if (next.getTime() <= today.getTime()) setSelectedDate(next);
    }
  }

  // ── Previous entries ────────────────────────────────────────────────────────
  const previousEntries = useMemo(() => {
    const entries = [];
    for (let i = 1; i <= 90 && entries.length < 7; i++) {
      const d = addDays(today, -i);
      const key = toDateKey(d);
      if (key === dateKey) continue;
      const e = migrateEntry(journal[key]);
      const text = stripHTML(e.content);
      if (text.trim()) entries.push({ key, text, entry: e });
    }
    return entries;
  }, [journal, dateKey, today]);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return previousEntries;
    const q = search.toLowerCase();
    return previousEntries.filter(e =>
      e.text.toLowerCase().includes(q) || e.key.includes(q)
    );
  }, [previousEntries, search]);

  // ── Template apply ──────────────────────────────────────────────────────────
  function applyTemplate(html) {
    if (editor) {
      editor.commands.setContent(html);
      onSetJournal(dateKey, { ...entry, content: html });
    }
    setShowTemplates(false);
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="journal-view">
      {/* Header */}
      <div className="journal-header">
        <div className="journal-date-nav">
          <button className="journal-nav-btn" onClick={goBack} aria-label="Previous day">&#8592;</button>
          <span className="journal-date-display">{formatDisplayDate(selectedDate)}</span>
          <button
            className="journal-nav-btn"
            onClick={goForward}
            disabled={isToday}
            aria-label="Next day"
            style={{ opacity: isToday ? 0.3 : 1 }}
          >
            &#8594;
          </button>
        </div>
        <div className="journal-header-actions">
          <button
            type="button"
            className={`journal-tab-btn${activeTab === 'write' ? ' active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            ✍️ Write
          </button>
          <button
            type="button"
            className={`journal-tab-btn${activeTab === 'stats' ? ' active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
          {activeTab === 'write' && (
            <button
              type="button"
              className="journal-templates-btn"
              onClick={() => setShowTemplates(true)}
            >
              Templates
            </button>
          )}
        </div>
      </div>

      {/* Templates modal */}
      {showTemplates && (
        <TemplatesModal onSelect={applyTemplate} onClose={() => setShowTemplates(false)} />
      )}

      {activeTab === 'stats' ? (
        <StatsView journal={journal} today={today} />
      ) : (
        <>
          {/* Daily prompt */}
          <div className="journal-prompt-card">
            <span className="journal-prompt-label">Today's Prompt</span>
            <p className="journal-prompt-text">{prompt}</p>
          </div>

          {/* On This Day */}
          <OnThisDay journal={journal} dateKey={dateKey} />

          {/* Toolbar + Editor */}
          <Toolbar editor={editor} />
          <div className="journal-editor-wrap">
            <EditorContent editor={editor} />
          </div>

          {/* Word count */}
          <div className="journal-word-count">{editorWordCount} {editorWordCount === 1 ? 'word' : 'words'}</div>

          {/* Photo */}
          <PhotoSection
            photo={entry.photo}
            onChange={photo => updateEntry({ photo })}
          />

          {/* Mood */}
          <MoodRow mood={entry.mood} onChange={mood => updateEntry({ mood })} />

          {/* Tags */}
          <TagsRow tags={entry.tags} onChange={tags => updateEntry({ tags })} />

          {/* Previous entries */}
          <div className="journal-previous-section">
            <h3 className="journal-previous-title">Previous Entries</h3>
            <input
              className="journal-search"
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {filteredEntries.length === 0 ? (
              <p className="journal-no-entries">
                {search.trim() ? 'No entries match your search.' : 'No previous entries yet.'}
              </p>
            ) : (
              <div className="journal-entry-list">
                {filteredEntries.map(e => {
                  const [y, m, d] = e.key.split('-').map(Number);
                  const entryDate = new Date(y, m - 1, d);
                  const wc = wordCount(e.text);
                  const preview = e.text.slice(0, 100) + (e.text.length > 100 ? '…' : '');
                  return (
                    <button
                      key={e.key}
                      className="journal-entry-preview"
                      onClick={() => setSelectedDate(startOfDay(entryDate))}
                    >
                      <div className="journal-entry-meta">
                        <span className="journal-entry-date">{formatEntryDate(e.key)}</span>
                        <span className="journal-entry-wc">{wc} {wc === 1 ? 'word' : 'words'}</span>
                      </div>
                      {e.entry.mood != null && (
                        <span className="entry-mood-indicator">{MOODS[e.entry.mood - 1]}</span>
                      )}
                      <p className="journal-entry-excerpt">{preview}</p>
                      {e.entry.tags && e.entry.tags.length > 0 && (
                        <div className="entry-tags-preview">
                          {e.entry.tags.slice(0, 3).map(t => (
                            <span key={t} className="journal-tag-chip small">{t}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
