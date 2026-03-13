import React, { useState } from 'react';
import SleepView from './SleepView';
import NutritionView from './NutritionView';
import WorkoutView from './WorkoutView';
import WellbeingView from './WellbeingView';

const HEALTH_TABS = [
  { id: 'sleep',     label: '😴 Sleep',     icon: '😴' },
  { id: 'nutrition', label: '🥗 Nutrition',  icon: '🥗' },
  { id: 'exercise',  label: '💪 Exercise',   icon: '💪' },
  { id: 'wellbeing', label: '🧠 Wellbeing',  icon: '🧠' },
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
    <div className="health-view-container">
      {/* Top sub-tab nav */}
      <div className="health-main-tabs">
        {HEALTH_TABS.map(t => (
          <button
            key={t.id}
            className={`health-main-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="health-main-tab-icon">{t.icon}</span>
            <span className="health-main-tab-label">{t.id.charAt(0).toUpperCase() + t.id.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="health-tab-content">
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
      </div>
    </div>
  );
}
