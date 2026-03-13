import React, { useState, useMemo } from 'react';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_NUTRITION = {
  "2026-3-7": {
    breakfast: [{ name: "Scrambled eggs on toast", kcal: 380, protein: 22, carbs: 32, fat: 16 }],
    lunch:     [{ name: "Turkey wrap", kcal: 490, protein: 34, carbs: 45, fat: 15 }],
    dinner:    [{ name: "Beef stir-fry with rice", kcal: 620, protein: 38, carbs: 55, fat: 20 }],
    snacks:    [{ name: "Banana", kcal: 110, protein: 1, carbs: 28, fat: 0 }],
  },
  "2026-3-8": {
    breakfast: [{ name: "Protein shake + granola", kcal: 410, protein: 30, carbs: 48, fat: 10 }],
    lunch:     [{ name: "Caesar salad with chicken", kcal: 520, protein: 42, carbs: 18, fat: 24 }],
    dinner:    [{ name: "Pasta primavera", kcal: 580, protein: 22, carbs: 78, fat: 14 }],
    snacks:    [{ name: "Almonds", kcal: 170, protein: 6, carbs: 6, fat: 15 }],
  },
  "2026-3-9": {
    breakfast: [{ name: "Avocado toast", kcal: 350, protein: 10, carbs: 38, fat: 18 }],
    lunch:     [{ name: "Lentil soup & bread", kcal: 440, protein: 24, carbs: 62, fat: 8 }],
    dinner:    [{ name: "Grilled chicken thighs", kcal: 540, protein: 48, carbs: 12, fat: 26 }],
    snacks:    [{ name: "Apple & peanut butter", kcal: 220, protein: 6, carbs: 28, fat: 10 }],
  },
  "2026-3-10": {
    breakfast: [{ name: "Omelette with vegetables", kcal: 320, protein: 24, carbs: 10, fat: 20 }],
    lunch:     [{ name: "Sushi rolls (8 pcs)", kcal: 480, protein: 20, carbs: 70, fat: 8 }],
    dinner:    [{ name: "Steak & roasted potatoes", kcal: 720, protein: 52, carbs: 42, fat: 32 }],
    snacks:    [{ name: "Protein bar", kcal: 200, protein: 20, carbs: 22, fat: 6 }],
  },
  "2026-3-11": {
    breakfast: [{ name: "Overnight oats", kcal: 360, protein: 14, carbs: 62, fat: 7 }],
    lunch:     [{ name: "Grilled salmon bowl", kcal: 560, protein: 44, carbs: 38, fat: 24 }],
    dinner:    [{ name: "Veggie curry with naan", kcal: 620, protein: 18, carbs: 82, fat: 20 }],
    snacks:    [{ name: "Cottage cheese", kcal: 120, protein: 16, carbs: 6, fat: 2 }],
  },
  "2026-3-12": {
    breakfast: [{ name: "Oats with berries", kcal: 320, protein: 12, carbs: 58, fat: 6 }],
    lunch:     [{ name: "Chicken salad", kcal: 450, protein: 38, carbs: 22, fat: 14 }],
    dinner:    [{ name: "Salmon & veg", kcal: 520, protein: 42, carbs: 18, fat: 22 }],
    snacks:    [{ name: "Greek yogurt", kcal: 140, protein: 14, carbs: 8, fat: 3 }],
  },
  "2026-3-13": {
    breakfast: [{ name: "Smoothie bowl", kcal: 340, protein: 16, carbs: 54, fat: 8 }],
    lunch:     [{ name: "Tuna poke bowl", kcal: 510, protein: 40, carbs: 50, fat: 14 }],
    dinner:    [{ name: "Chicken & sweet potato", kcal: 580, protein: 46, carbs: 48, fat: 16 }],
    snacks:    [{ name: "Mixed nuts", kcal: 190, protein: 5, carbs: 8, fat: 17 }],
  },
};

const RECENT_FOODS = [
  { name: "Chicken Breast (100g)", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Brown Rice (100g)", kcal: 216, protein: 4, carbs: 45, fat: 1.6 },
  { name: "Whole Milk (250ml)", kcal: 152, protein: 8, carbs: 12, fat: 8 },
  { name: "Banana (medium)", kcal: 105, protein: 1, carbs: 27, fat: 0.3 },
  { name: "Cheddar Cheese (30g)", kcal: 120, protein: 7, carbs: 0.1, fat: 10 },
];

const MEALS_LIST = ['breakfast', 'lunch', 'dinner', 'snacks'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
const MEAL_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };

const TODAY = "2026-3-13";

function dateKeyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function dateToKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
function formatDateLabel(key) {
  const d = dateKeyToDate(key);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

function sumMeals(dayData) {
  const all = MEALS_LIST.flatMap(m => (dayData?.[m] || []));
  return all.reduce(
    (acc, item) => ({
      kcal:    acc.kcal    + (item.kcal    || 0),
      protein: acc.protein + (item.protein || 0),
      carbs:   acc.carbs   + (item.carbs   || 0),
      fat:     acc.fat     + (item.fat     || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function DonutRing({ eaten, goal, size = 120, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(eaten / (goal || 1), 1);
  const dash = pct * circ;
  const remaining = goal - eaten;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="#FF8C42" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          {Math.max(remaining, 0)}
        </span>
        <span style={{ fontSize: 10, color: '#888', marginTop: 2 }}>kcal left</span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#aaa' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{Math.round(value)}g</div>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>{goal}g goal</div>
      <div style={{ height: 4, borderRadius: 2, background: '#222', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

function MealSection({ mealKey, items, expanded, onToggle, onAdd, onDelete, goals }) {
  const totals = (items || []).reduce(
    (a, it) => ({ kcal: a.kcal + it.kcal, protein: a.protein + it.protein, carbs: a.carbs + it.carbs, fat: a.fat + it.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div style={{ background: '#111111', borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', padding: '14px 16px',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 18, marginRight: 10 }}>{MEAL_ICONS[mealKey]}</span>
        <span style={{ fontWeight: 700, color: '#fff', flex: 1, fontSize: 15 }}>{MEAL_LABELS[mealKey]}</span>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginRight: 12 }}>
          {totals.kcal} <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>kcal</span>
        </span>
        {/* Add button */}
        <button
          onClick={e => { e.stopPropagation(); onAdd(); }}
          style={{
            background: '#00BCD4', border: 'none', borderRadius: 20, width: 28, height: 28,
            color: '#000', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8,
            lineHeight: 1,
          }}
        >+</button>
        {/* Chevron */}
        <span style={{ color: '#555', fontSize: 14, transition: 'transform 0.2s', display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1e1e1e' }}>
          {(items || []).length === 0 && (
            <div style={{ padding: '12px 16px', color: '#555', fontSize: 13 }}>No foods logged yet</div>
          )}
          {(items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g
                </div>
              </div>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginRight: 12 }}>{item.kcal}</span>
              <button
                onClick={() => onDelete(i)}
                style={{ background: 'none', border: 'none', color: '#444', fontSize: 16, cursor: 'pointer', padding: 4 }}
              >×</button>
            </div>
          ))}
          {/* Add Food row */}
          <div
            onClick={onAdd}
            style={{ padding: '12px 16px', color: '#00BCD4', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 16 }}>+</span> Add Food
          </div>
          {/* Footer totals */}
          {(items || []).length > 0 && (
            <div style={{ background: '#0a0a0a', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#555', flex: 1 }}>Totals</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>{totals.kcal}kcal</span>
              <span style={{ fontSize: 11, color: '#888' }}>P:{totals.protein}g</span>
              <span style={{ fontSize: 11, color: '#888' }}>C:{totals.carbs}g</span>
              <span style={{ fontSize: 11, color: '#888' }}>F:{totals.fat}g</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WeeklyBarChart({ weekData, goalKcal }) {
  const maxVal = Math.max(...weekData.map(d => d.kcal), goalKcal, 1);
  const chartH = 60;
  const barW = 28;
  const gap = 8;
  const totalW = weekData.length * (barW + gap) - gap;

  return (
    <svg width={totalW} height={chartH} style={{ overflow: 'visible' }}>
      {weekData.map((d, i) => {
        const barH = Math.max((d.kcal / maxVal) * chartH, 2);
        const x = i * (barW + gap);
        const y = chartH - barH;
        const color = d.kcal <= goalKcal ? '#00BCD4' : '#FF8C42';
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
            <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill="#555" fontSize={9}>{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function NutritionView({ nutrition = {}, nutritionGoals = {}, onSetNutrition, onSetNutritionGoals, workouts = [], isPremium, onShowPremium }) {

  // Merge mock + real data (real wins)
  const allData = useMemo(() => {
    const merged = { ...MOCK_NUTRITION };
    Object.keys(nutrition).forEach(k => {
      merged[k] = nutrition[k];
    });
    return merged;
  }, [nutrition]);

  const goals = useMemo(() => ({
    calories: 2000, protein: 150, carbs: 200, fat: 65,
    ...nutritionGoals,
  }), [nutritionGoals]);

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [addFoodMeal, setAddFoodMeal] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [editGoals, setEditGoals] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(3);

  // Goals editing state
  const [goalsEdit, setGoalsEdit] = useState({ ...goals });

  // Portion picker
  const [selectedFood, setSelectedFood] = useState(null);
  const [portion, setPortion] = useState(1);

  // Exercise kcal (from workouts — simplified: 0 for now)
  const exerciseKcal = 0;

  const dayData = allData[selectedDate] || {};
  const totals = sumMeals(dayData);

  const remaining = goals.calories - totals.kcal + exerciseKcal;
  const netKcal = totals.kcal - exerciseKcal;

  // Navigate dates
  function changeDate(dir) {
    const d = dateKeyToDate(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(dateToKey(d));
  }

  function handleToggleMeal(meal) {
    setExpandedMeal(prev => (prev === meal ? null : meal));
  }

  function handleOpenAddFood(meal) {
    setAddFoodMeal(meal);
    setSearchQuery('');
    setSelectedFood(null);
    setPortion(1);
    setShowAddFood(true);
  }

  function handleDeleteItem(meal, idx) {
    const current = { ...(allData[selectedDate] || {}) };
    const items = [...(current[meal] || [])];
    items.splice(idx, 1);
    current[meal] = items;
    if (onSetNutrition) onSetNutrition(selectedDate, current);
  }

  function handleAddFoodConfirm() {
    if (!selectedFood) return;
    const newItem = {
      name: selectedFood.name,
      kcal:    Math.round(selectedFood.kcal    * portion),
      protein: Math.round(selectedFood.protein * portion * 10) / 10,
      carbs:   Math.round(selectedFood.carbs   * portion * 10) / 10,
      fat:     Math.round(selectedFood.fat     * portion * 10) / 10,
    };
    const current = { ...(allData[selectedDate] || {}) };
    current[addFoodMeal] = [...(current[addFoodMeal] || []), newItem];
    if (onSetNutrition) onSetNutrition(selectedDate, current);
    setShowAddFood(false);
    setSelectedFood(null);
  }

  function handleSaveGoals() {
    if (onSetNutritionGoals) onSetNutritionGoals(goalsEdit);
    setEditGoals(false);
  }

  // Build 7-day week data
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = dateKeyToDate(TODAY);
      d.setDate(d.getDate() - i);
      const key = dateToKey(d);
      const t = sumMeals(allData[key] || {});
      days.push({ day: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2), kcal: t.kcal, key });
    }
    return days;
  }, [allData]);

  const avgKcal = Math.round(weekData.reduce((s, d) => s + d.kcal, 0) / weekData.length);
  const bestDay = weekData.reduce((best, d) => (!best || Math.abs(d.kcal - goals.calories) < Math.abs(best.kcal - goals.calories) ? d : best), null);

  // Filtered recent foods
  const filteredFoods = searchQuery.trim()
    ? RECENT_FOODS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : RECENT_FOODS;

  // Net color
  const netColor = netKcal <= goals.calories ? '#4CAF50' : netKcal <= goals.calories + 200 ? '#FFA726' : '#f44336';

  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingBottom: 100, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Date nav bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: '#000',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#111', borderRadius: 30, padding: '8px 18px',
        }}>
          <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', color: '#00BCD4', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>←</button>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15, minWidth: 180, textAlign: 'center' }}>{formatDateLabel(selectedDate)}</span>
          <button onClick={() => changeDate(1)} style={{ background: 'none', border: 'none', color: selectedDate === TODAY ? '#333' : '#00BCD4', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }} disabled={selectedDate === TODAY}>→</button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── Calorie Summary Card ── */}
        <div style={{ background: '#111111', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <DonutRing eaten={totals.kcal} goal={goals.calories} />
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Goal</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{goals.calories}<span style={{ fontSize: 10, color: '#666' }}>kcal</span></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Food</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{totals.kcal}<span style={{ fontSize: 10, color: '#666' }}>kcal</span></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#888' }}>Exercise</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{exerciseKcal}<span style={{ fontSize: 10, color: '#666' }}>kcal</span></div>
              </div>
            </div>
          </div>

          {/* Macro bars */}
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #1e1e1e', paddingTop: 14 }}>
            <MacroBar label="Carbs"   value={totals.carbs}   goal={goals.carbs}   color="#00BCD4" />
            <div style={{ width: 1, background: '#1e1e1e' }} />
            <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color="#FF8C42" />
            <div style={{ width: 1, background: '#1e1e1e' }} />
            <MacroBar label="Fat"     value={totals.fat}     goal={goals.fat}     color="#FFA726" />
          </div>

          {/* Edit goals */}
          <button
            onClick={() => { setGoalsEdit({ ...goals }); setEditGoals(true); }}
            style={{ marginTop: 12, background: 'none', border: '1px solid #222', borderRadius: 8, color: '#888', fontSize: 12, padding: '5px 12px', cursor: 'pointer', width: '100%' }}
          >
            Edit Goals
          </button>
        </div>

        {/* ── Diary Sections ── */}
        {MEALS_LIST.map(meal => (
          <MealSection
            key={meal}
            mealKey={meal}
            items={dayData[meal] || []}
            expanded={expandedMeal === meal}
            onToggle={() => handleToggleMeal(meal)}
            onAdd={() => handleOpenAddFood(meal)}
            onDelete={(idx) => handleDeleteItem(meal, idx)}
            goals={goals}
          />
        ))}

        {/* ── Net Calories Banner ── */}
        <div style={{ background: '#111111', borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>Food</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{totals.kcal}kcal</span>
          <span style={{ fontSize: 13, color: '#555' }}>−</span>
          <span style={{ fontSize: 13, color: '#aaa' }}>Exercise</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{exerciseKcal}kcal</span>
          <span style={{ fontSize: 13, color: '#555' }}>=</span>
          <span style={{ fontSize: 13, color: '#aaa' }}>Net</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: netColor }}>{netKcal}kcal</span>
        </div>

        {/* ── Water Tracker ── */}
        <div style={{ background: '#111111', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Water</span>
            <span style={{ fontSize: 13, color: '#888' }}>{waterGlasses} / 8 glasses</span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                style={{
                  background: 'none', border: `2px solid ${i < waterGlasses ? '#00BCD4' : '#333'}`,
                  borderRadius: 10, width: 38, height: 44, fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i < waterGlasses ? '#00BCD4' : '#333',
                  transition: 'all 0.2s',
                }}
              >
                💧
              </button>
            ))}
          </div>
        </div>

        {/* ── Weekly Report ── */}
        <div style={{ background: '#111111', borderRadius: 14, padding: '16px', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 4 }}>This Week</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{avgKcal}</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>avg daily kcal</div>
          <div style={{ overflowX: 'auto' }}>
            <WeeklyBarChart weekData={weekData} goalKcal={goals.calories} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>Best Day</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00BCD4' }}>{bestDay?.day || '—'} · {bestDay?.kcal}kcal</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#888' }}>Weekly Avg</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{avgKcal}kcal</div>
            </div>
          </div>
        </div>

      </div>{/* end padding wrapper */}

      {/* ── Edit Goals Modal ── */}
      {editGoals && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setEditGoals(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#111', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: 24, paddingBottom: 40 }}
          >
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 17, marginBottom: 20, textAlign: 'center' }}>Edit Daily Goals</div>
            {['calories', 'protein', 'carbs', 'fat'].map(k => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6, textTransform: 'capitalize' }}>{k} {k === 'calories' ? '(kcal)' : '(g)'}</label>
                <input
                  type="number"
                  value={goalsEdit[k]}
                  onChange={e => setGoalsEdit(p => ({ ...p, [k]: Number(e.target.value) }))}
                  style={{ width: '100%', background: '#1e1e1e', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 16, padding: '10px 14px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button
              onClick={handleSaveGoals}
              style={{ width: '100%', background: '#00BCD4', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 16, padding: 14, cursor: 'pointer', marginTop: 4 }}
            >
              Save Goals
            </button>
          </div>
        </div>
      )}

      {/* ── Add Food Modal ── */}
      {showAddFood && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => { setShowAddFood(false); setSelectedFood(null); }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
              padding: '20px 20px', paddingBottom: 44, maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 16, flex: 1 }}>
                Add to {MEAL_LABELS[addFoodMeal]}
              </span>
              <button onClick={() => { setShowAddFood(false); setSelectedFood(null); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', padding: 0 }}>×</button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#555' }}>🔍</span>
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
                  color: '#fff', fontSize: 15, padding: '11px 14px 11px 40px', boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Food list */}
            {!selectedFood && (
              <>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Foods</div>
                {filteredFoods.map((food, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelectedFood(food); setPortion(1); }}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '12px 0',
                      borderBottom: '1px solid #1e1e1e', cursor: 'pointer',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{food.name}</div>
                      <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                        P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g
                      </div>
                    </div>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{food.kcal} kcal</span>
                  </div>
                ))}
                {filteredFoods.length === 0 && (
                  <div style={{ color: '#555', textAlign: 'center', padding: 24, fontSize: 13 }}>No foods found</div>
                )}
              </>
            )}

            {/* Portion picker */}
            {selectedFood && (
              <div>
                <button onClick={() => setSelectedFood(null)} style={{ background: 'none', border: 'none', color: '#00BCD4', fontSize: 13, cursor: 'pointer', padding: '0 0 12px 0', display: 'block' }}>← Back</button>
                <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: 4 }}>{selectedFood.name}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>
                    {Math.round(selectedFood.kcal * portion)} kcal · P:{Math.round(selectedFood.protein * portion * 10) / 10}g · C:{Math.round(selectedFood.carbs * portion * 10) / 10}g · F:{Math.round(selectedFood.fat * portion * 10) / 10}g
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 8 }}>Servings</label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={portion}
                    onChange={e => setPortion(Math.max(0.25, Number(e.target.value)))}
                    style={{
                      width: '100%', background: '#1e1e1e', border: '1px solid #333', borderRadius: 10,
                      color: '#fff', fontSize: 18, padding: '12px 14px', boxSizing: 'border-box', textAlign: 'center',
                    }}
                  />
                </div>
                <button
                  onClick={handleAddFoodConfirm}
                  style={{ width: '100%', background: '#00BCD4', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 16, padding: 14, cursor: 'pointer', marginBottom: 10 }}
                >
                  Add to {MEAL_LABELS[addFoodMeal]}
                </button>
                <button
                  onClick={() => { setShowAddFood(false); setSelectedFood(null); }}
                  style={{ width: '100%', background: 'none', border: '1px solid #333', borderRadius: 12, color: '#aaa', fontWeight: 600, fontSize: 15, padding: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Cancel button when no food selected */}
            {!selectedFood && (
              <button
                onClick={() => { setShowAddFood(false); setSelectedFood(null); }}
                style={{ width: '100%', background: 'none', border: '1px solid #333', borderRadius: 12, color: '#aaa', fontWeight: 600, fontSize: 15, padding: 13, cursor: 'pointer', marginTop: 16 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
