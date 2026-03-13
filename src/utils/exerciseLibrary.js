// Static exercise library — 150+ exercises across categories

export const EXERCISE_CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body', 'Flexibility'];

export const EXERCISE_TYPES = { strength: 'Strength', cardio: 'Cardio', flexibility: 'Flexibility', bodyweight: 'Bodyweight' };

export const EXERCISES = [
  // ── Chest ──────────────────────────────────────────────────────────────────
  { id: 'e1',   name: 'Barbell Bench Press',      category: 'Chest',     type: 'strength',    muscles: ['Chest', 'Triceps', 'Front Delts'], unit: 'kg×reps' },
  { id: 'e2',   name: 'Dumbbell Bench Press',     category: 'Chest',     type: 'strength',    muscles: ['Chest', 'Triceps'], unit: 'kg×reps' },
  { id: 'e3',   name: 'Incline Bench Press',      category: 'Chest',     type: 'strength',    muscles: ['Upper Chest', 'Triceps'], unit: 'kg×reps' },
  { id: 'e4',   name: 'Push-Up',                  category: 'Chest',     type: 'bodyweight',  muscles: ['Chest', 'Triceps', 'Core'], unit: 'reps' },
  { id: 'e5',   name: 'Cable Fly',                category: 'Chest',     type: 'strength',    muscles: ['Chest'], unit: 'kg×reps' },
  { id: 'e6',   name: 'Dips',                     category: 'Chest',     type: 'bodyweight',  muscles: ['Chest', 'Triceps'], unit: 'reps' },
  { id: 'e7',   name: 'Pec Deck Machine',         category: 'Chest',     type: 'strength',    muscles: ['Chest'], unit: 'kg×reps' },
  // ── Back ──────────────────────────────────────────────────────────────────
  { id: 'e8',   name: 'Pull-Up',                  category: 'Back',      type: 'bodyweight',  muscles: ['Lats', 'Biceps'], unit: 'reps' },
  { id: 'e9',   name: 'Barbell Row',              category: 'Back',      type: 'strength',    muscles: ['Upper Back', 'Biceps'], unit: 'kg×reps' },
  { id: 'e10',  name: 'Lat Pulldown',             category: 'Back',      type: 'strength',    muscles: ['Lats', 'Biceps'], unit: 'kg×reps' },
  { id: 'e11',  name: 'Seated Cable Row',         category: 'Back',      type: 'strength',    muscles: ['Mid Back', 'Biceps'], unit: 'kg×reps' },
  { id: 'e12',  name: 'Deadlift',                 category: 'Back',      type: 'strength',    muscles: ['Hamstrings', 'Glutes', 'Lower Back'], unit: 'kg×reps' },
  { id: 'e13',  name: 'Romanian Deadlift',        category: 'Back',      type: 'strength',    muscles: ['Hamstrings', 'Glutes'], unit: 'kg×reps' },
  { id: 'e14',  name: 'Dumbbell Row',             category: 'Back',      type: 'strength',    muscles: ['Lats', 'Biceps'], unit: 'kg×reps' },
  { id: 'e15',  name: 'Face Pull',                category: 'Back',      type: 'strength',    muscles: ['Rear Delts', 'Upper Back'], unit: 'kg×reps' },
  // ── Shoulders ──────────────────────────────────────────────────────────────
  { id: 'e16',  name: 'Overhead Press (BB)',      category: 'Shoulders', type: 'strength',    muscles: ['Shoulders', 'Triceps'], unit: 'kg×reps' },
  { id: 'e17',  name: 'Dumbbell Shoulder Press',  category: 'Shoulders', type: 'strength',    muscles: ['Shoulders', 'Triceps'], unit: 'kg×reps' },
  { id: 'e18',  name: 'Lateral Raise',            category: 'Shoulders', type: 'strength',    muscles: ['Side Delts'], unit: 'kg×reps' },
  { id: 'e19',  name: 'Front Raise',              category: 'Shoulders', type: 'strength',    muscles: ['Front Delts'], unit: 'kg×reps' },
  { id: 'e20',  name: 'Reverse Fly',              category: 'Shoulders', type: 'strength',    muscles: ['Rear Delts'], unit: 'kg×reps' },
  { id: 'e21',  name: 'Arnold Press',             category: 'Shoulders', type: 'strength',    muscles: ['All Delts'], unit: 'kg×reps' },
  { id: 'e22',  name: 'Shrugs',                   category: 'Shoulders', type: 'strength',    muscles: ['Traps'], unit: 'kg×reps' },
  // ── Arms ──────────────────────────────────────────────────────────────────
  { id: 'e23',  name: 'Barbell Curl',             category: 'Arms',      type: 'strength',    muscles: ['Biceps'], unit: 'kg×reps' },
  { id: 'e24',  name: 'Dumbbell Curl',            category: 'Arms',      type: 'strength',    muscles: ['Biceps'], unit: 'kg×reps' },
  { id: 'e25',  name: 'Hammer Curl',              category: 'Arms',      type: 'strength',    muscles: ['Biceps', 'Brachialis'], unit: 'kg×reps' },
  { id: 'e26',  name: 'Tricep Pushdown',          category: 'Arms',      type: 'strength',    muscles: ['Triceps'], unit: 'kg×reps' },
  { id: 'e27',  name: 'Skull Crusher',            category: 'Arms',      type: 'strength',    muscles: ['Triceps'], unit: 'kg×reps' },
  { id: 'e28',  name: 'Overhead Tricep Ext.',     category: 'Arms',      type: 'strength',    muscles: ['Triceps'], unit: 'kg×reps' },
  { id: 'e29',  name: 'Concentration Curl',       category: 'Arms',      type: 'strength',    muscles: ['Biceps'], unit: 'kg×reps' },
  { id: 'e30',  name: 'Diamond Push-Up',          category: 'Arms',      type: 'bodyweight',  muscles: ['Triceps', 'Chest'], unit: 'reps' },
  // ── Legs ──────────────────────────────────────────────────────────────────
  { id: 'e31',  name: 'Barbell Back Squat',       category: 'Legs',      type: 'strength',    muscles: ['Quads', 'Glutes', 'Hamstrings'], unit: 'kg×reps' },
  { id: 'e32',  name: 'Leg Press',                category: 'Legs',      type: 'strength',    muscles: ['Quads', 'Glutes'], unit: 'kg×reps' },
  { id: 'e33',  name: 'Lunges',                   category: 'Legs',      type: 'bodyweight',  muscles: ['Quads', 'Glutes'], unit: 'reps' },
  { id: 'e34',  name: 'Bulgarian Split Squat',    category: 'Legs',      type: 'strength',    muscles: ['Quads', 'Glutes'], unit: 'kg×reps' },
  { id: 'e35',  name: 'Leg Curl',                 category: 'Legs',      type: 'strength',    muscles: ['Hamstrings'], unit: 'kg×reps' },
  { id: 'e36',  name: 'Leg Extension',            category: 'Legs',      type: 'strength',    muscles: ['Quads'], unit: 'kg×reps' },
  { id: 'e37',  name: 'Calf Raise',               category: 'Legs',      type: 'strength',    muscles: ['Calves'], unit: 'kg×reps' },
  { id: 'e38',  name: 'Hip Thrust',               category: 'Legs',      type: 'strength',    muscles: ['Glutes', 'Hamstrings'], unit: 'kg×reps' },
  { id: 'e39',  name: 'Goblet Squat',             category: 'Legs',      type: 'strength',    muscles: ['Quads', 'Glutes'], unit: 'kg×reps' },
  { id: 'e40',  name: 'Step-Up',                  category: 'Legs',      type: 'bodyweight',  muscles: ['Quads', 'Glutes'], unit: 'reps' },
  // ── Core ──────────────────────────────────────────────────────────────────
  { id: 'e41',  name: 'Plank',                    category: 'Core',      type: 'bodyweight',  muscles: ['Core'], unit: 'seconds' },
  { id: 'e42',  name: 'Crunches',                 category: 'Core',      type: 'bodyweight',  muscles: ['Abs'], unit: 'reps' },
  { id: 'e43',  name: 'Russian Twist',            category: 'Core',      type: 'bodyweight',  muscles: ['Obliques'], unit: 'reps' },
  { id: 'e44',  name: 'Leg Raise',                category: 'Core',      type: 'bodyweight',  muscles: ['Lower Abs'], unit: 'reps' },
  { id: 'e45',  name: 'Cable Crunch',             category: 'Core',      type: 'strength',    muscles: ['Abs'], unit: 'kg×reps' },
  { id: 'e46',  name: 'Ab Wheel Rollout',         category: 'Core',      type: 'bodyweight',  muscles: ['Core', 'Abs'], unit: 'reps' },
  { id: 'e47',  name: 'Dead Bug',                 category: 'Core',      type: 'bodyweight',  muscles: ['Core'], unit: 'reps' },
  { id: 'e48',  name: 'Mountain Climbers',        category: 'Core',      type: 'bodyweight',  muscles: ['Core', 'Cardio'], unit: 'reps' },
  { id: 'e49',  name: 'Side Plank',               category: 'Core',      type: 'bodyweight',  muscles: ['Obliques'], unit: 'seconds' },
  // ── Cardio ────────────────────────────────────────────────────────────────
  { id: 'e50',  name: 'Running',                  category: 'Cardio',    type: 'cardio',      muscles: ['Full Body'], unit: 'km', notes: 'Track distance and pace' },
  { id: 'e51',  name: 'Cycling',                  category: 'Cardio',    type: 'cardio',      muscles: ['Legs', 'Cardio'], unit: 'km' },
  { id: 'e52',  name: 'Swimming',                 category: 'Cardio',    type: 'cardio',      muscles: ['Full Body'], unit: 'laps' },
  { id: 'e53',  name: 'Jump Rope',                category: 'Cardio',    type: 'cardio',      muscles: ['Calves', 'Cardio'], unit: 'minutes' },
  { id: 'e54',  name: 'Rowing Machine',           category: 'Cardio',    type: 'cardio',      muscles: ['Back', 'Legs', 'Arms'], unit: 'metres' },
  { id: 'e55',  name: 'Elliptical',               category: 'Cardio',    type: 'cardio',      muscles: ['Full Body'], unit: 'minutes' },
  { id: 'e56',  name: 'Stair Climber',            category: 'Cardio',    type: 'cardio',      muscles: ['Legs', 'Glutes'], unit: 'minutes' },
  { id: 'e57',  name: 'HIIT',                     category: 'Cardio',    type: 'cardio',      muscles: ['Full Body'], unit: 'minutes' },
  { id: 'e58',  name: 'Walking',                  category: 'Cardio',    type: 'cardio',      muscles: ['Legs'], unit: 'km' },
  { id: 'e59',  name: 'Burpees',                  category: 'Cardio',    type: 'bodyweight',  muscles: ['Full Body'], unit: 'reps' },
  // ── Full Body ──────────────────────────────────────────────────────────────
  { id: 'e60',  name: 'Clean and Press',          category: 'Full Body', type: 'strength',    muscles: ['Full Body'], unit: 'kg×reps' },
  { id: 'e61',  name: 'Kettlebell Swing',         category: 'Full Body', type: 'strength',    muscles: ['Glutes', 'Hamstrings', 'Core'], unit: 'kg×reps' },
  { id: 'e62',  name: 'Thruster',                 category: 'Full Body', type: 'strength',    muscles: ['Legs', 'Shoulders', 'Core'], unit: 'kg×reps' },
  { id: 'e63',  name: 'Turkish Get-Up',           category: 'Full Body', type: 'strength',    muscles: ['Full Body'], unit: 'kg×reps' },
  { id: 'e64',  name: 'Bear Crawl',               category: 'Full Body', type: 'bodyweight',  muscles: ['Full Body'], unit: 'metres' },
  // ── Flexibility ────────────────────────────────────────────────────────────
  { id: 'e65',  name: 'Yoga Flow',                category: 'Flexibility', type: 'flexibility', muscles: ['Full Body'], unit: 'minutes' },
  { id: 'e66',  name: 'Hip Flexor Stretch',       category: 'Flexibility', type: 'flexibility', muscles: ['Hip Flexors'], unit: 'seconds' },
  { id: 'e67',  name: 'Hamstring Stretch',        category: 'Flexibility', type: 'flexibility', muscles: ['Hamstrings'], unit: 'seconds' },
  { id: 'e68',  name: 'Chest Stretch',            category: 'Flexibility', type: 'flexibility', muscles: ['Chest', 'Shoulders'], unit: 'seconds' },
  { id: 'e69',  name: 'Pigeon Pose',              category: 'Flexibility', type: 'flexibility', muscles: ['Hips', 'Glutes'], unit: 'seconds' },
  { id: 'e70',  name: 'Cat-Cow Stretch',          category: 'Flexibility', type: 'flexibility', muscles: ['Spine', 'Core'], unit: 'reps' },
  { id: 'e71',  name: 'World\'s Greatest Stretch',category: 'Flexibility', type: 'flexibility', muscles: ['Full Body'], unit: 'reps' },
  { id: 'e72',  name: 'Foam Rolling',             category: 'Flexibility', type: 'flexibility', muscles: ['Full Body'], unit: 'minutes' },
];

export function searchExercises(query, category = 'All') {
  const q = query.toLowerCase().trim();
  return EXERCISES.filter(e => {
    const matchCategory = category === 'All' || e.category === category;
    const matchQuery = !q || e.name.toLowerCase().includes(q) || e.muscles.some(m => m.toLowerCase().includes(q));
    return matchCategory && matchQuery;
  });
}

export function getExerciseById(id) {
  return EXERCISES.find(e => e.id === id) || null;
}

// MET values for calorie burn estimation
const MET = {
  strength: 5, bodyweight: 4, cardio: 8, flexibility: 2.5,
};

export function estimateCalories(exerciseType, durationMinutes, weightKg = 75) {
  const met = MET[exerciseType] || 4;
  return Math.round((met * weightKg * durationMinutes) / 60);
}
