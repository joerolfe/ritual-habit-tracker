import React, { useState, useMemo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import MonthView from './MonthView';
import YearOverview from './YearOverview';
import GoalsView from './GoalsView';
import InsightsView from './InsightsView';

const HABIT_COLORS = [
  '#FFFFFF','#CCCCCC','#AAAAAA','#888888',
  '#666666','#555555','#444444','#333333',
  '#222222','#1A1A1A',
];


const DAYS_SHORT = ['S','M','T','W','T','F','S'];

const T = {
  bg: '#000000',
  card: '#111111',
  inner: '#1A1A1A',
  teal: '#FFFFFF',
  orange: 'rgba(255,255,255,0.65)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.45)',
  border: 'rgba(255,255,255,0.08)',
};

/* ── Shared tiny pill tab ── */
function PillTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '14px 16px 12px',
      overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none',
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '8px 20px', borderRadius: 24,
            border: 'none', flexShrink: 0, cursor: 'pointer',
            background: active === t ? '#FFFFFF' : T.card,
            color: active === t ? '#000000' : '#888888',
            fontSize: 14, fontWeight: 600,
            fontFamily: 'Inter, -apple-system, sans-serif',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ── Add / Edit habit modal ── */
function HabitModal({ habit, onSave, onClose, onDelete }) {
  const editing = !!habit;
  const [name,  setName]  = useState(habit?.name  || '');
  const [icon,  setIcon]  = useState(habit?.icon  || '⭐');
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0]);
  const [days,  setDays]  = useState(habit?.days  || [0,1,2,3,4,5,6]);

  const toggleDay = (i) => {
    const next = days.includes(i) ? days.filter(d => d !== i) : [...days, i].sort((a,b) => a-b);
    if (next.length > 0) setDays(next);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon, color, days });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 600, display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        style={{
          background: '#111111', borderRadius: '20px 20px 0 0',
          width: '100%', maxHeight: '85vh', overflowY: 'auto',
          padding: '20px 20px calc(90px + env(safe-area-inset-bottom,0px))',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
            {editing ? 'Edit Habit' : 'New Habit'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>✕</button>
        </div>

        {/* Emoji picker */}
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Icon</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: T.inner,
            border: `2px solid ${T.teal}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, flexShrink: 0,
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 13, color: T.muted }}>Selected icon — browse all below</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <EmojiPicker
            onEmojiClick={(data) => setIcon(data.emoji)}
            theme="dark"
            width="100%"
            height={320}
            searchPlaceholder="Search emoji…"
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>

        {/* Name */}
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Habit name</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Morning run, Read 20 pages…"
          autoFocus
          style={{
            width: '100%', background: T.inner, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: '13px 14px', fontSize: 16, color: T.text,
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 18,
          }}
        />

        {/* Color */}
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Colour</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {HABIT_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '3px solid',
                borderColor: color === c ? '#fff' : 'transparent',
                background: c, cursor: 'pointer', flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Days */}
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Repeat</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {DAYS_SHORT.map((d, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              style={{
                flex: 1, aspectRatio: '1', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: days.includes(i) ? '#FFFFFF' : T.inner,
                color: days.includes(i) ? '#000000' : T.muted,
                fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              }}
            >{d}</button>
          ))}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '15px', borderRadius: 30, border: 'none',
            background: name.trim() ? '#FFFFFF' : '#333',
            color: name.trim() ? '#000000' : T.muted,
            fontSize: 16, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit', marginBottom: 10,
          }}
        >
          {editing ? 'Save changes' : 'Add habit'}
        </button>

        {/* Delete (edit mode only) */}
        {editing && (
          <button
            onClick={onDelete}
            style={{
              width: '100%', padding: '13px', borderRadius: 30, border: `1px solid rgba(255,59,48,0.4)`,
              background: 'none', color: '#FF3B30', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Delete habit
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Daily tab ── */
function DailyView({ habits, isCompleted, onToggle, onAddHabit, onEditHabit, onDeleteHabit }) {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const dow = today.getDay();

  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState(null);

  const scheduled = useMemo(
    () => habits.filter(h => !h.days || h.days.includes(dow)),
    [habits, dow]
  );
  const doneCount = useMemo(
    () => scheduled.filter(h => isCompleted(h.id, y, m, d)).length,
    [scheduled, isCompleted, y, m, d]
  );
  const pct = scheduled.length > 0 ? Math.round((doneCount / scheduled.length) * 100) : 0;

  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ padding: '0 16px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Date + summary */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, color: T.muted, marginBottom: 2 }}>{dateStr}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>
          {doneCount}/{scheduled.length}
          <span style={{ fontSize: 14, fontWeight: 500, color: T.muted, marginLeft: 8 }}>habits done</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: '#1A1A1A', marginTop: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: '#FFFFFF',
            width: `${pct}%`, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Habit list */}
      {scheduled.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: 14 }}>
          No habits scheduled for today.<br />
          <span style={{ color: T.teal }}>Tap + to add your first habit.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {scheduled.map(habit => {
            const done = isCompleted(habit.id, y, m, d);
            return (
              <div
                key={habit.id}
                style={{
                  background: T.card, borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  border: done ? `1px solid ${habit.color}40` : `1px solid ${T.border}`,
                }}
              >
                {/* Check circle */}
                <button
                  onClick={() => onToggle(habit.id, y, m, d)}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${done ? habit.color : 'rgba(255,255,255,0.2)'}`,
                    background: done ? habit.color : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: '#000000', transition: 'all 0.18s',
                  }}
                >
                  {done ? '✓' : ''}
                </button>

                {/* Icon + name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600, color: done ? T.muted : T.text,
                    textDecoration: done ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {habit.icon || '⭐'} {habit.name}
                  </div>
                  {habit.category && (
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2, textTransform: 'capitalize' }}>
                      {habit.category}
                    </div>
                  )}
                </div>

                {/* Edit */}
                <button
                  onClick={() => setEditHabit(habit)}
                  style={{
                    background: 'none', border: 'none', color: T.muted,
                    fontSize: 18, cursor: 'pointer', padding: '4px 8px', flexShrink: 0,
                  }}
                >
                  ···
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Unscheduled habits (not today) */}
      {habits.length > scheduled.length && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Not scheduled today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {habits.filter(h => h.days && !h.days.includes(dow)).map(habit => (
              <div
                key={habit.id}
                style={{
                  background: T.card, borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10, opacity: 0.5,
                }}
              >
                <span style={{ fontSize: 16 }}>{habit.icon || '⭐'}</span>
                <span style={{ fontSize: 14, color: T.muted }}>{habit.name}</span>
                <button
                  onClick={() => setEditHabit(habit)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16 }}
                >···</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add habit button */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          width: '100%', padding: '14px', borderRadius: 14,
          border: `1.5px dashed rgba(255,255,255,0.28)`,
          background: 'rgba(255,255,255,0.042)', color: T.teal,
          fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        + Add habit
      </button>

      {/* Add modal */}
      {showAdd && (
        <HabitModal
          habit={null}
          onSave={({ name, icon, color, days }) => {
            onAddHabit(name, color, icon, days, null, null, null, null, null, null);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editHabit && (
        <HabitModal
          habit={editHabit}
          onSave={({ name, icon, color, days }) => {
            onEditHabit(editHabit.id, name, color, icon, days, null, null, null, null, null, null);
            setEditHabit(null);
          }}
          onClose={() => setEditHabit(null)}
          onDelete={() => {
            onDeleteHabit(editHabit.id);
            setEditHabit(null);
          }}
        />
      )}
    </div>
  );
}

/* ══ Main TrackerView ══ */
export default function TrackerView({
  habits,
  completions,
  isCompleted,
  onToggle,
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onYearChange,
  onSelectMonth,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  goals,
  challenges,
  moods,
  water,
  sleep,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onCompleteGoal,
  onAddChallenge,
  onEditChallenge,
  onDeleteChallenge,
  onToggleChallenge,
  onAddBonusXP,
}) {
  const [tab, setTab] = useState('Daily');

  return (
    <div style={{
      background: T.bg, minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, sans-serif',
      color: T.text, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>Tracker</div>
      </div>

      {/* Sub-tabs */}
      <PillTabs tabs={['Daily', 'Monthly', 'Yearly', 'Insights', 'Goals']} active={tab} onChange={setTab} />

      {/* Content */}
      {tab === 'Daily' && (
        <DailyView
          habits={habits}
          isCompleted={isCompleted}
          onToggle={onToggle}
          onAddHabit={onAddHabit}
          onEditHabit={onEditHabit}
          onDeleteHabit={onDeleteHabit}
        />
      )}

      {tab === 'Monthly' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MonthView
            habits={habits}
            year={year}
            month={month}
            isCompleted={isCompleted}
            onToggle={onToggle}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />
        </div>
      )}

      {tab === 'Yearly' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <YearOverview
            habits={habits}
            year={year}
            isCompleted={isCompleted}
            onYearChange={onYearChange}
            onSelectMonth={(m) => { onSelectMonth(m); setTab('Monthly'); }}
          />
        </div>
      )}

      {tab === 'Insights' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <InsightsView
            habits={habits}
            completions={completions}
            moods={moods}
            water={water}
            sleep={sleep}
          />
        </div>
      )}

      {tab === 'Goals' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <GoalsView
            goals={goals}
            challenges={challenges}
            habits={habits}
            completions={completions}
            onAddGoal={onAddGoal}
            onEditGoal={onEditGoal}
            onDeleteGoal={onDeleteGoal}
            onCompleteGoal={onCompleteGoal}
            onAddChallenge={onAddChallenge}
            onEditChallenge={onEditChallenge}
            onDeleteChallenge={onDeleteChallenge}
            onToggleChallenge={onToggleChallenge}
            onAddBonusXP={onAddBonusXP}
          />
        </div>
      )}
    </div>
  );
}
