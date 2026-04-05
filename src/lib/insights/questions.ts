// ─── Opening ─────────────────────────────────────────────────────────────────
// mood_level ints 1–6: same order as `MOOD_OPTIONS` in `wellness-questions.ts` (kiosk tiles).

export const MOOD_OPTIONS: Record<number, string> = {
  1: "Tired",
  2: "Okay",
  3: "Great",
  4: "Content",
  5: "Upset",
  6: "Anxious",
};

// ─── Short Survey ─────────────────────────────────────────────────────────────
// All options stored as 1-based indices

export const SQ1_OPTIONS: Record<number, string> = {
  1: "Talking to others like me",
  2: "Advice and guidance",
  3: "Improved sleep or relaxation",
  4: "A meal or snacks",
  5: "Setting goals and priorities",
  6: "A short walk or other physical activity",
};

export const SQ2_OPTIONS: Record<number, string> = {
  1: "Stretching or yoga",
  2: "Light walking",
  3: "Chair\u2011based movement",
  4: "Breathing exercises",
  5: "Dancing or music\u2011based movement",
  6: "Games or playing",
};

export const SQ3_OPTIONS: Record<number, string> = {
  1: "Art or creative expression",
  2: "Music, dance, or movement",
  3: "Cultural or spiritual practices",
  4: "Time in nature",
  5: "Reading or writing",
  6: "Connecting with others",
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
  3: "Neutral",
  4: "Somewhat weak",
  5: "Very weak",
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
  sq1_answer:
    "Which of these would be most helpful to you right now?",
  sq2_answer:
    "What kind of movement feels good or doable for you right now?",
  sq3_answer: "Which activities help you feel like you?",
  lq1_answer:
    "Thinking about your stress levels over the last two weeks, would you say that most days are…",
  lq2_answer: "How often have you felt hopeful over the last two weeks?",
  lq3_answer: "How has your body felt this week? (Select all that apply)",
  lq4_answer:
    "How would you rate your current access to nutritious food that suits your needs?",
  lq5_answer:
    "How would you rate your sense of belonging in your local community?",
  lq6_answer:
    "Which types of programs would you be interested in? (Select all that apply)",
};
