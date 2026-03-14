import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, Tooltip,
} from 'recharts';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
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

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const BG       = '#000000';
const CARD     = '#111111';
const ELEVATED = '#1A1A1A';
const BORDER   = '1px solid rgba(255,255,255,0.08)';
const WHITE    = '#FFFFFF';
const MUTED    = '#888888';

// Macro colors (monochrome shades)
const PROTEIN_COLOR = '#FFFFFF';
const CARBS_COLOR   = 'rgba(255,255,255,0.55)';
const FAT_COLOR     = 'rgba(255,255,255,0.35)';

const cardStyle = {
  background: CARD,
  borderRadius: 16,
  border: BORDER,
  padding: 16,
  boxSizing: 'border-box',
};

// ─── MACRO RING SVG ───────────────────────────────────────────────────────────
function MacroRing({ label, value, goal, color }) {
  const pct = Math.min(value / (goal || 1), 1);
  const circ = 188.5; // 2*π*30 ≈ 188.5
  const dash = pct * circ;
  const diff = goal - value;
  const over = diff < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 70, height: 70 }}>
        <svg width={70} height={70} style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle cx={35} cy={35} r={30} fill="none"
            stroke={color} strokeWidth={7} opacity={0.2} />
          {/* progress */}
          <circle cx={35} cy={35} r={30} fill="none"
            stroke={color} strokeWidth={7}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round" />
        </svg>
        {/* center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>{Math.round(value)}g</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: MUTED }}>/ {goal}g {label}</span>
      <span style={{ fontSize: 11, color: over ? '#FF4444' : 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
        {over ? `${Math.abs(Math.round(diff))}g over` : `${Math.round(diff)}g left`}
      </span>
    </div>
  );
}

// ─── DOT GRID ────────────────────────────────────────────────────────────────
function DotGrid({ pct, color, label }) {
  const filled = Math.round(Math.min(pct, 1) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 8px)',
        gap: 3,
      }}>
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < filled ? color : 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: WHITE }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

// ─── ADD FOOD MODAL ───────────────────────────────────────────────────────────
function AddFoodModal({ mealKey, onClose, onConfirm }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [portion, setPortion] = useState(1);

  const filtered = query.trim()
    ? RECENT_FOODS.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : RECENT_FOODS;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: CARD, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
          padding: '20px 20px', paddingBottom: 44, maxHeight: '80vh', overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: WHITE, fontSize: 16, flex: 1 }}>
            Add to {MEAL_LABELS[mealKey]}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, fontSize: 22, cursor: 'pointer', padding: 0 }}>×</button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: MUTED }}>🔍</span>
          <input
            type="text"
            placeholder="Search foods..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', background: ELEVATED, border: BORDER, borderRadius: 12,
              color: WHITE, fontSize: 15, padding: '11px 14px 11px 40px',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Food list or portion picker */}
        {!selected ? (
          <>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Foods</div>
            {filtered.map((food, i) => (
              <div
                key={i}
                onClick={() => { setSelected(food); setPortion(1); }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: WHITE, fontWeight: 600, fontSize: 14 }}>{food.name}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                    P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g
                  </div>
                </div>
                <span style={{ color: WHITE, fontWeight: 700, fontSize: 14 }}>{food.kcal} kcal</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ color: MUTED, textAlign: 'center', padding: 24, fontSize: 13 }}>No foods found</div>
            )}
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'none', border: BORDER, borderRadius: 12, color: MUTED, fontWeight: 600, fontSize: 15, padding: 13, cursor: 'pointer', marginTop: 16 }}
            >Cancel</button>
          </>
        ) : (
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', color: WHITE, fontSize: 13, cursor: 'pointer', padding: '0 0 12px 0', display: 'block' }}
            >← Back</button>
            <div style={{ background: ELEVATED, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: WHITE, fontSize: 15, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ color: MUTED, fontSize: 13 }}>
                {Math.round(selected.kcal * portion)} kcal · P:{Math.round(selected.protein * portion * 10) / 10}g · C:{Math.round(selected.carbs * portion * 10) / 10}g · F:{Math.round(selected.fat * portion * 10) / 10}g
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: MUTED, display: 'block', marginBottom: 8 }}>Servings</label>
              <input
                type="number" min="0.25" step="0.25" value={portion}
                onChange={e => setPortion(Math.max(0.25, Number(e.target.value)))}
                style={{
                  width: '100%', background: ELEVATED, border: BORDER, borderRadius: 10,
                  color: WHITE, fontSize: 18, padding: '12px 14px', boxSizing: 'border-box', textAlign: 'center',
                }}
              />
            </div>
            <button
              onClick={() => onConfirm(selected, portion)}
              style={{ width: '100%', background: '#FFFFFF', border: 'none', borderRadius: 12, color: '#000000', fontWeight: 700, fontSize: 16, padding: 14, cursor: 'pointer', marginBottom: 10 }}
            >Add to {MEAL_LABELS[mealKey]}</button>
            <button
              onClick={onClose}
              style={{ width: '100%', background: 'none', border: BORDER, borderRadius: 12, color: MUTED, fontWeight: 600, fontSize: 15, padding: 13, cursor: 'pointer' }}
            >Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function NutritionView({
  nutrition = {},
  nutritionGoals = {},
  onSetNutrition,
  onSetNutritionGoals,
  workouts = [],
  isPremium,
  onShowPremium,
  recipes = [],
  onAddRecipe,
  onDeleteRecipe,
  mealPlans = {},
  onSetMealPlan,
}) {
  // Merge mock + real (real wins)
  const allData = useMemo(() => {
    const merged = { ...MOCK_NUTRITION };
    Object.keys(nutrition).forEach(k => { merged[k] = nutrition[k]; });
    return merged;
  }, [nutrition]);

  const goals = useMemo(() => ({
    calories: 2100, protein: 120, carbs: 250, fat: 66,
    ...nutritionGoals,
  }), [nutritionGoals]);

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [expandedMeals, setExpandedMeals] = useState(new Set());
  const [addFoodModal, setAddFoodModal] = useState(null); // null | mealKey string
  const [waterCount, setWaterCount] = useState(5);
  const [editGoals, setEditGoals] = useState(false);
  const [goalsEdit, setGoalsEdit] = useState({ ...goals });

  const dayData = allData[selectedDate] || {};
  const totals  = sumMeals(dayData);

  // ── Date navigation ─────────────────────────────────────────────────────────
  function changeDate(dir) {
    const d = dateKeyToDate(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(dateToKey(d));
  }

  function toggleMeal(meal) {
    setExpandedMeals(prev => {
      const next = new Set(prev);
      next.has(meal) ? next.delete(meal) : next.add(meal);
      return next;
    });
  }

  function handleDeleteItem(meal, idx) {
    const current = { ...(allData[selectedDate] || {}) };
    const items = [...(current[meal] || [])];
    items.splice(idx, 1);
    current[meal] = items;
    if (onSetNutrition) onSetNutrition(selectedDate, current);
  }

  function handleAddFoodConfirm(food, portion) {
    const newItem = {
      name:    food.name,
      kcal:    Math.round(food.kcal    * portion),
      protein: Math.round(food.protein * portion * 10) / 10,
      carbs:   Math.round(food.carbs   * portion * 10) / 10,
      fat:     Math.round(food.fat     * portion * 10) / 10,
    };
    const current = { ...(allData[selectedDate] || {}) };
    current[addFoodModal] = [...(current[addFoodModal] || []), newItem];
    if (onSetNutrition) onSetNutrition(selectedDate, current);
    setAddFoodModal(null);
  }

  function handleSaveGoals() {
    if (onSetNutritionGoals) onSetNutritionGoals(goalsEdit);
    setEditGoals(false);
  }

  // ── Week data for bar chart ──────────────────────────────────────────────────
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = dateKeyToDate(TODAY);
      d.setDate(d.getDate() - i);
      const key = dateToKey(d);
      const t = sumMeals(allData[key] || {});
      days.push({
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2),
        kcal: t.kcal,
        key,
      });
    }
    return days;
  }, [allData]);

  // ── Macro values for selected date ──────────────────────────────────────────
  const carbsPct    = totals.carbs   / (goals.carbs   || 1);
  const proteinPct  = totals.protein / (goals.protein || 1);
  const fatPct      = totals.fat     / (goals.fat     || 1);

  const kcalLeft    = goals.calories - totals.kcal;
  const carbsLeft   = goals.carbs    - totals.carbs;
  const proteinLeft = goals.protein  - totals.protein;
  const fatLeft     = goals.fat      - totals.fat;

  // ── Formatted date label e.g. "← Mar 13, 2026 →" ───────────────────────────
  const dateObj = dateKeyToDate(selectedDate);
  const shortLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{
      background: BG, minHeight: '100vh', paddingBottom: 120,
      fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', overflowX: 'hidden',
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: WHITE, marginBottom: 10 }}>
          Nutrition
        </div>

        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => changeDate(-1)}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 18, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}
          >←</button>
          <span style={{ fontSize: 14, color: MUTED, flex: 1, textAlign: 'center' }}>{shortLabel}</span>
          <button
            onClick={() => changeDate(1)}
            style={{ background: 'none', border: 'none', color: MUTED, fontSize: 18, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}
          >→</button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* ── AI FOOD LOG CARD ──────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 12 }}>
            Log your food
          </div>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[
              { icon: '📷', label: 'Photo' },
              { icon: '🤖', label: 'Describe' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setAddFoodModal('breakfast')}
                style={{
                  background: '#1A1A1A', borderRadius: 10, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 13, color: WHITE, border: BORDER,
                  cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Camera viewfinder placeholder */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{
              width: 60, height: 60, border: `2px dashed rgba(255,255,255,0.7)`, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>📷</div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[
              { icon: '🔍', label: 'Search' },
              { icon: '📱', label: 'Scan Barcode' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setAddFoodModal('breakfast')}
                style={{
                  background: '#1A1A1A', borderRadius: 10, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 13, color: WHITE, border: BORDER,
                  cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '📋', label: 'Recipe' },
              { icon: '📥', label: 'Import' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setAddFoodModal('breakfast')}
                style={{
                  background: '#1A1A1A', borderRadius: 10, height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 13, color: WHITE, border: BORDER,
                  cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── MACRO RINGS ROW ───────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-around', padding: '8px 0',
          }}>
            <MacroRing label="Carbs"   value={totals.carbs}   goal={goals.carbs}   color={CARBS_COLOR}   />
            <MacroRing label="Protein" value={totals.protein} goal={goals.protein} color={PROTEIN_COLOR} />
            <MacroRing label="Fat"     value={totals.fat}     goal={goals.fat}     color={FAT_COLOR}     />
          </div>
        </div>

        {/* ── CALORIE GOAL CARD ─────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>Calories</span>
            <span style={{ fontSize: 13, color: WHITE }}>
              {kcalLeft >= 0 ? `${kcalLeft} kcal left` : `${Math.abs(kcalLeft)} kcal over`}
            </span>
          </div>

          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="kcal" radius={[4, 4, 0, 0]}>
                {weekData.map((d, i) => (
                  <Cell key={i} fill={d.kcal > goals.calories ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'} />
                ))}
              </Bar>
              <ReferenceLine y={goals.calories} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ background: CARD, border: BORDER, borderRadius: 8, color: WHITE, fontSize: 12 }}
                labelStyle={{ color: MUTED }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Below chart: macro left labels */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: FAT_COLOR }}>
              Fat: {fatLeft >= 0 ? `${Math.round(fatLeft)}g left` : `${Math.round(Math.abs(fatLeft))}g over`}
            </span>
            <span style={{ fontSize: 11, color: CARBS_COLOR }}>
              Carbs: {carbsLeft >= 0 ? `${Math.round(carbsLeft)}g left` : `${Math.round(Math.abs(carbsLeft))}g over`}
            </span>
            <span style={{ fontSize: 11, color: PROTEIN_COLOR }}>
              Protein: {proteinLeft >= 0 ? `${Math.round(proteinLeft)}g left` : `${Math.round(Math.abs(proteinLeft))}g over`}
            </span>
          </div>
        </div>

        {/* ── NUTRITIONAL DOT GRID ─────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>Nutritional Details</span>
            <span style={{ fontSize: 14, color: MUTED, cursor: 'pointer' }}>→</span>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <DotGrid pct={carbsPct}   color={CARBS_COLOR}   label="Carbs"   />
            <DotGrid pct={proteinPct} color={PROTEIN_COLOR} label="Protein" />
            <DotGrid pct={fatPct}     color={FAT_COLOR}     label="Fat"     />
          </div>
        </div>

        {/* ── MEAL DIARY ───────────────────────────────────────────────────── */}
        {MEALS_LIST.map(meal => {
          const items    = dayData[meal] || [];
          const expanded = expandedMeals.has(meal);
          const mealTotals = items.reduce(
            (a, it) => ({
              kcal:    a.kcal    + it.kcal,
              protein: a.protein + it.protein,
              carbs:   a.carbs   + it.carbs,
              fat:     a.fat     + it.fat,
            }),
            { kcal: 0, protein: 0, carbs: 0, fat: 0 }
          );

          return (
            <div key={meal} style={{ ...cardStyle, marginBottom: 8 }}>
              {/* Meal header */}
              <div
                onClick={() => toggleMeal(meal)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
              >
                <span style={{ fontSize: 18, marginRight: 10 }}>{MEAL_ICONS[meal]}</span>
                <span style={{ fontWeight: 700, color: WHITE, flex: 1, fontSize: 15 }}>{MEAL_LABELS[meal]}</span>
                <span style={{ fontSize: 13, color: MUTED, marginRight: 12 }}>
                  {mealTotals.kcal} kcal
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setAddFoodModal(meal); }}
                  style={{
                    background: 'none', border: 'none', color: WHITE,
                    fontSize: 13, cursor: 'pointer', padding: '0 8px 0 0', fontWeight: 600,
                  }}
                >+ Add</button>
                <span style={{
                  color: MUTED, fontSize: 12,
                  display: 'inline-block',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>▼</span>
              </div>

              {/* Expanded */}
              {expanded && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  {items.length === 0 && (
                    <div style={{ color: MUTED, fontSize: 13, padding: '4px 0 8px' }}>No foods logged yet</div>
                  )}
                  {items.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', paddingBottom: 10,
                      borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: WHITE, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                          P: {item.protein}g &nbsp; C: {item.carbs}g &nbsp; F: {item.fat}g
                        </div>
                      </div>
                      <span style={{ fontSize: 14, color: WHITE, fontWeight: 600, marginRight: 10 }}>
                        {item.kcal}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(meal, i)}
                        style={{ background: 'none', border: 'none', color: MUTED, fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}

                  {/* Add food row */}
                  <div
                    onClick={() => setAddFoodModal(meal)}
                    style={{ color: WHITE, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}
                  >
                    <span style={{ fontSize: 16 }}>+</span> Add Food
                  </div>

                  {/* Totals row */}
                  {items.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
                      paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <span style={{ fontSize: 12, color: MUTED, flex: 1 }}>Totals</span>
                      <span style={{ fontSize: 12, color: WHITE }}>{mealTotals.kcal} kcal</span>
                      <span style={{ fontSize: 11, color: MUTED }}>P:{mealTotals.protein}g</span>
                      <span style={{ fontSize: 11, color: MUTED }}>C:{mealTotals.carbs}g</span>
                      <span style={{ fontSize: 11, color: MUTED }}>F:{mealTotals.fat}g</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ── WATER TRACKER ────────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: WHITE }}>💧 Water</span>
            <span style={{ fontSize: 13, color: WHITE }}>{waterCount} / 8</span>
          </div>

          {/* Droplet buttons */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'nowrap', marginBottom: 10 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => setWaterCount(i < waterCount ? i : i + 1)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  width: 40, height: 40, fontSize: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {i < waterCount ? '💧' : '🤍'}
              </button>
            ))}
          </div>

          {/* Thin progress bar */}
          <div style={{ background: ELEVATED, borderRadius: 2, height: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${(waterCount / 8) * 100}%`, height: '100%',
              background: '#FFFFFF', borderRadius: 2,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

      </div>{/* end padding wrapper */}

      {/* ── ADD FOOD MODAL ───────────────────────────────────────────────────── */}
      {addFoodModal && (
        <AddFoodModal
          mealKey={addFoodModal}
          onClose={() => setAddFoodModal(null)}
          onConfirm={handleAddFoodConfirm}
        />
      )}

      {/* ── EDIT GOALS MODAL ─────────────────────────────────────────────────── */}
      {editGoals && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 400,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setEditGoals(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CARD, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
              padding: 24, paddingBottom: 40, boxSizing: 'border-box',
            }}
          >
            <div style={{ fontWeight: 700, color: WHITE, fontSize: 17, marginBottom: 20, textAlign: 'center' }}>Edit Daily Goals</div>
            {['calories', 'protein', 'carbs', 'fat'].map(k => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: MUTED, display: 'block', marginBottom: 6, textTransform: 'capitalize' }}>
                  {k} {k === 'calories' ? '(kcal)' : '(g)'}
                </label>
                <input
                  type="number"
                  value={goalsEdit[k]}
                  onChange={e => setGoalsEdit(p => ({ ...p, [k]: Number(e.target.value) }))}
                  style={{
                    width: '100%', background: ELEVATED, border: BORDER, borderRadius: 10,
                    color: WHITE, fontSize: 16, padding: '10px 14px', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleSaveGoals}
              style={{ width: '100%', background: '#FFFFFF', border: 'none', borderRadius: 12, color: '#000000', fontWeight: 700, fontSize: 16, padding: 14, cursor: 'pointer', marginTop: 4 }}
            >Save Goals</button>
          </div>
        </div>
      )}

    </div>
  );
}
