/**
 * parseNaturalLanguage(text)
 * Parses a free-text workout description and returns a structured object, or null.
 */
export function parseNaturalLanguage(text) {
  if (!text || !text.trim()) return null;

  const t = text.trim();

  // Helper: parse optional duration from "in X min/minutes/hours" or "for X min/minutes"
  function parseDuration(str) {
    const minMatch = str.match(/(?:in|for)\s+(\d+(?:\.\d+)?)\s*(?:min(?:utes?)?)/i);
    if (minMatch) return parseFloat(minMatch[1]);
    const hrMatch = str.match(/(?:in|for)\s+(\d+(?:\.\d+)?)\s*hours?/i);
    if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60);
    return null;
  }

  // ── Cardio: Run ─────────────────────────────────────────────────────────────
  {
    const m = t.match(/^(?:ran|jogged|jogging)\s+(\d+(?:\.\d+)?)\s*(km|mi)\b(.*)/i);
    if (m) {
      return {
        type: 'Cardio',
        name: 'Run',
        distance: parseFloat(m[1]),
        distanceUnit: m[2].toLowerCase(),
        duration: parseDuration(m[3]),
      };
    }
  }

  // ── Cardio: Walk ────────────────────────────────────────────────────────────
  {
    const m = t.match(/^(?:walked|walking)\s+(\d+(?:\.\d+)?)\s*(km|mi)\b(.*)/i);
    if (m) {
      return {
        type: 'Cardio',
        name: 'Walk',
        distance: parseFloat(m[1]),
        distanceUnit: m[2].toLowerCase(),
        duration: parseDuration(m[3]),
      };
    }
  }

  // ── Cardio: Cycle ───────────────────────────────────────────────────────────
  {
    const m = t.match(/^(?:cycled|cycling|biked)\s+(\d+(?:\.\d+)?)\s*(km|mi)\b(.*)/i);
    if (m) {
      return {
        type: 'Cardio',
        name: 'Cycle',
        distance: parseFloat(m[1]),
        distanceUnit: m[2].toLowerCase(),
        duration: parseDuration(m[3]),
      };
    }
  }

  // ── Cardio: Swim ────────────────────────────────────────────────────────────
  {
    const m = t.match(/^(?:swam|swimming)\s+(\d+(?:\.\d+)?)\s*(laps?|km)\b(.*)/i);
    if (m) {
      const unit = /laps?/i.test(m[2]) ? 'laps' : 'km';
      return {
        type: 'Cardio',
        name: 'Swim',
        distance: parseFloat(m[1]),
        distanceUnit: unit,
        duration: parseDuration(m[3]),
      };
    }
  }

  // ── Flexibility: Yoga / Pilates / Stretching ────────────────────────────────
  {
    const m = t.match(/^(?:did|completed)\s+(\d+(?:\.\d+)?)\s*(?:min(?:utes?)?\s+of\s+)(yoga|pilates|stretching)\b/i);
    if (m) {
      return {
        type: 'Flexibility',
        name: 'Yoga',
        duration: parseFloat(m[1]),
      };
    }
  }

  // ── HIIT: HIIT / circuit / crossfit ─────────────────────────────────────────
  {
    const m = t.match(/^(?:did|completed)\s+(\d+(?:\.\d+)?)\s*(?:min(?:utes?)?\s+of\s+)(hiit|circuit|crossfit)\b/i);
    if (m) {
      return {
        type: 'HIIT',
        name: 'HIIT',
        duration: parseFloat(m[1]),
      };
    }
  }

  // ── Other: did/completed X minutes of [anything] ────────────────────────────
  {
    const m = t.match(/^(?:did|completed)\s+(\d+(?:\.\d+)?)\s*(?:min(?:utes?)?\s+of\s+)(.+)/i);
    if (m) {
      return {
        type: 'Other',
        name: m[2].trim(),
        duration: parseFloat(m[1]),
      };
    }
  }

  // ── Strength: bench pressed / squatted / deadlifted / pressed ───────────────
  {
    const m = t.match(
      /^(bench\s*pressed?|squatted?|deadlifted?|pressed?)\s+(\d+(?:\.\d+)?)\s*(kg|lbs?)\b(.*)/i
    );
    if (m) {
      const rawVerb = m[1].toLowerCase().replace(/\s+/g, ' ');
      let exerciseName;
      if (/bench/.test(rawVerb))      exerciseName = 'Bench Press';
      else if (/squat/.test(rawVerb)) exerciseName = 'Squat';
      else if (/dead/.test(rawVerb))  exerciseName = 'Deadlift';
      else                            exerciseName = 'Press';

      const weight = parseFloat(m[2]);
      const unit   = /lbs?/i.test(m[3]) ? 'lbs' : 'kg';
      const rest   = m[4];

      // Parse optional "for N sets of M reps"
      const setsMatch = rest.match(/for\s+(\d+)\s+sets?\s+of\s+(\d+)\s+reps?/i);
      const nSets = setsMatch ? parseInt(setsMatch[1], 10) : 1;
      const nReps = setsMatch ? parseInt(setsMatch[2], 10) : null;

      const sets = Array(nSets).fill({ weight, unit, reps: nReps, done: true });

      return {
        type: 'Strength',
        exercises: [
          {
            name: exerciseName,
            sets,
          },
        ],
      };
    }
  }

  return null;
}
