import React, { useState } from 'react';
import SleepView from './SleepView';
import NutritionView from './NutritionView';
import WorkoutView from './WorkoutView';
import WellbeingView from './WellbeingView';
import StrainView from './StrainView';

const HEALTH_TABS = [
  { id: 'sleep',     label: 'Sleep',     emoji: '😴' },
  { id: 'nutrition', label: 'Nutrition', emoji: '🥗' },
  { id: 'exercise',  label: 'Gym',       emoji: '💪' },
  { id: 'wellbeing', label: 'Wellbeing', emoji: '🧠' },
  { id: 'strain',    label: 'Strain',    emoji: '📊' },
];

export default function HealthView({
  // Sleep
  sleep, onSetSleep,
  // Nutrition
  nutrition, nutritionGoals, onSetNutrition, onSetNutritionGoals,
  // Workout
  workouts, bodyMeasurements, onAddWorkout, onUpdateWorkout, onDeleteWorkout, onAddMeasurement,
  // Wellbeing
  wellbeing, period, onSetWellbeing, onSetPeriod,
  // Premium
  isPremium, onShowPremium,
  // Bonus XP
  onAddBonusXP,
  // Recipes & meal plans
  recipes, onAddRecipe, onDeleteRecipe, mealPlans, onSetMealPlan,
}) {
  const [tab, setTab] = useState('sleep');

  return (
    <div style={{ background: '#0A0A14', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ overflowX: 'auto', padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, background: '#1A1A2E', borderRadius: 12, padding: 4, width: 'fit-content', minWidth: '100%' }}>
          {HEALTH_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px', borderRadius: 10, border: 'none',
                fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                background: tab === t.id ? '#FFFFFF' : 'transparent',
                color: tab === t.id ? '#0A0A14' : '#8888AA',
                cursor: 'pointer', whiteSpace: 'nowrap',
                minHeight: 36, fontFamily: 'Inter, sans-serif',
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'sleep' && (
          <SleepView sleep={sleep} onSetSleep={onSetSleep} />
        )}
        {tab === 'nutrition' && (
          <NutritionView
            nutrition={nutrition}
            nutritionGoals={nutritionGoals}
            onSetNutrition={onSetNutrition}
            onSetNutritionGoals={onSetNutritionGoals}
            workouts={workouts}
            isPremium={isPremium}
            onShowPremium={onShowPremium}
            recipes={recipes}
            onAddRecipe={onAddRecipe}
            onDeleteRecipe={onDeleteRecipe}
            mealPlans={mealPlans}
            onSetMealPlan={onSetMealPlan}
          />
        )}
        {tab === 'exercise' && (
          <WorkoutView
            workouts={workouts}
            bodyMeasurements={bodyMeasurements}
            onAddWorkout={onAddWorkout}
            onUpdateWorkout={onUpdateWorkout}
            onDeleteWorkout={onDeleteWorkout}
            onAddMeasurement={onAddMeasurement}
            isPremium={isPremium}
            onShowPremium={onShowPremium}
          />
        )}
        {tab === 'wellbeing' && (
          <WellbeingView
            wellbeing={wellbeing}
            period={period}
            onSetWellbeing={onSetWellbeing}
            onSetPeriod={onSetPeriod}
            onAddBonusXP={onAddBonusXP}
          />
        )}
        {tab === 'strain' && <StrainView />}
      </div>
    </div>
  );
}
