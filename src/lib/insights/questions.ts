// ─── Opening ─────────────────────────────────────────────────────────────────
// mood_level stored as 1–6

export const MOOD_OPTIONS: Record<number, string> = {
  1: "Content",
  2: "Anxious",
  3: "Tired",
  4: "Okay",
  5: "Great",
  6: "Upset",
};

// ─── Short Survey ─────────────────────────────────────────────────────────────
// All options stored as 1-based indices

export const SQ1_OPTIONS: Record<number, string> = {
  1: "Talking to others",
  2: "Improved sleep or relaxation",
  3: "Setting goals and priorities",
  4: "A short walk or other physical activity",
  5: "A meal or snack",
  6: "None right now",
  7: "Other",
};

export const SQ2_OPTIONS: Record<number, string> = {
  1: "Stretching",
  2: "Light walking",
  3: "Chair-based movement",
  4: "Breathing exercises",
  5: "Dancing or music-based movement",
  6: "Playing with children",
  7: "None right now",
  8: "Other",
};

export const SQ3_OPTIONS: Record<number, string> = {
  1: "Art or creative expression",
  2: "Music, dance, or movement",
  3: "Cultural or spiritual practices",
  4: "Time in nature",
  5: "Reading or writing",
  6: "Connecting with others",
  7: "Caring for children",
  8: "None right now",
  9: "Other",
};

// ─── Long Survey ──────────────────────────────────────────────────────────────

// Mind
export const LQ1_OPTIONS: Record<number, string> = {
  1: "Not at all stressful",
  2: "Not very stressful",
  3: "A bit stressful",
  4: "Quite a bit stressful",
  5: "Extremely stressful",
};

export const LQ2_OPTIONS: Record<number, string> = {
  1: "Never",
  2: "A few days",
  3: "Some days",
  4: "Most days",
  5: "All days",
};

// Body
export const LQ3_OPTIONS: Record<number, string> = {
  1: "Tired",
  2: "Sore",
  3: "Stiff",
  4: "Energetic",
  5: "Comfortable",
};

export const LQ4_OPTIONS: Record<number, string> = {
  1: "Terrible",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

// Soul
export const LQ5_OPTIONS: Record<number, string> = {
  1: "Very strong",
  2: "Somewhat strong",
  3: "Somewhat weak",
  4: "Very weak",
};

export const LQ6_OPTIONS: Record<number, string> = {
  1: "Art or craft workshops",
  2: "Music or movement sessions",
  3: "Cultural celebration days",
  4: "Meditation, prayer, or spiritual circles",
  5: "Activities for mothers & children",
};

// ─── Lookup map ───────────────────────────────────────────────────────────────
// Maps each DB column name to its options dictionary

export const QUESTION_OPTIONS = {
  sq1_answer: SQ1_OPTIONS,
  sq2_answer: SQ2_OPTIONS,
  sq3_answer: SQ3_OPTIONS,
  lq1_answer: LQ1_OPTIONS,
  lq2_answer: LQ2_OPTIONS,
  lq3_answer: LQ3_OPTIONS,
  lq4_answer: LQ4_OPTIONS,
  lq5_answer: LQ5_OPTIONS,
  lq6_answer: LQ6_OPTIONS,
} as const;

export type QuestionKey = keyof typeof QUESTION_OPTIONS;

// ─── Question labels (for display) ───────────────────────────────────────────

export const QUESTION_LABELS: Record<QuestionKey, string> = {
  sq1_answer: "Mind - What would be most helpful right now?",
  sq2_answer: "Body - What movement feels doable?",
  sq3_answer: "Soul - What activities make you feel like you?",
  lq1_answer: "Mind - Stress level over the last two weeks",
  lq2_answer: "Mind - How often felt hopeful over the last two weeks",
  lq3_answer: "Body - How has your body felt this week?",
  lq4_answer: "Body - Access to nutritious food",
  lq5_answer: "Soul - Sense of belonging in the community",
  lq6_answer: "Soul - Programs of interest",
};
