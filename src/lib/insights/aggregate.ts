import {
  MOOD_OPTIONS,
  QUESTION_OPTIONS,
  type QuestionKey,
} from "./questions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OptionCount = Record<string, number>; // label → count

export type AggregatedData = {
  total: number;

  // Opening mood (label → count, e.g. "Rough" → 3)
  moodCount: OptionCount;

  // Short survey
  sq1Count: OptionCount;
  sq2Count: OptionCount;
  sq3Count: OptionCount;

  // Long survey
  lq1Count: OptionCount;
  lq2Count: OptionCount;
  lq3Count: OptionCount;
  lq4Count: OptionCount;
  lq5Count: OptionCount;
  lq6Count: OptionCount;

  // Completion rates
  shortSurveyCompletions: number;
  longSurveyCompletions: number;
};

// Raw row shape from Supabase query
export type RawMoodEntry = {
  mood_level: number[];
  short_survey_completed: boolean;
  long_survey_completed: boolean;
  sq1_answer: number[] | null;
  sq2_answer: number[] | null;
  sq3_answer: number[] | null;
  lq1_answer: number[] | null;
  lq2_answer: number[] | null;
  lq3_answer: number[] | null;
  lq4_answer: number[] | null;
  lq5_answer: number[] | null;
  lq6_answer: number[] | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyCount(options: Record<number, string>): OptionCount {
  const result: OptionCount = {};
  for (const label of Object.values(options)) {
    result[label] = 0;
  }
  return result;
}

function tallyArray(
  answers: number[] | null,
  options: Record<number, string>,
  accumulator: OptionCount,
): void {
  if (!answers) return;
  for (const idx of answers) {
    const label = options[idx];
    if (label !== undefined) {
      accumulator[label] = (accumulator[label] ?? 0) + 1;
    }
  }
}

// ─── Main aggregation function ────────────────────────────────────────────────

export function aggregateEntries(rows: RawMoodEntry[]): AggregatedData {
  const total = rows.length;

  const moodCount = emptyCount(MOOD_OPTIONS);

  const sq1Count = emptyCount(QUESTION_OPTIONS.sq1_answer);
  const sq2Count = emptyCount(QUESTION_OPTIONS.sq2_answer);
  const sq3Count = emptyCount(QUESTION_OPTIONS.sq3_answer);
  const lq1Count = emptyCount(QUESTION_OPTIONS.lq1_answer);
  const lq2Count = emptyCount(QUESTION_OPTIONS.lq2_answer);
  const lq3Count = emptyCount(QUESTION_OPTIONS.lq3_answer);
  const lq4Count = emptyCount(QUESTION_OPTIONS.lq4_answer);
  const lq5Count = emptyCount(QUESTION_OPTIONS.lq5_answer);
  const lq6Count = emptyCount(QUESTION_OPTIONS.lq6_answer);

  let shortSurveyCompletions = 0;
  let longSurveyCompletions = 0;

  for (const row of rows) {
    // Mood (1–6 level values)
    for (const lvl of row.mood_level) {
      const label = MOOD_OPTIONS[lvl];
      if (label) moodCount[label] = (moodCount[label] ?? 0) + 1;
    }

    // Short survey
    tallyArray(row.sq1_answer, QUESTION_OPTIONS.sq1_answer, sq1Count);
    tallyArray(row.sq2_answer, QUESTION_OPTIONS.sq2_answer, sq2Count);
    tallyArray(row.sq3_answer, QUESTION_OPTIONS.sq3_answer, sq3Count);

    // Long survey
    tallyArray(row.lq1_answer, QUESTION_OPTIONS.lq1_answer, lq1Count);
    tallyArray(row.lq2_answer, QUESTION_OPTIONS.lq2_answer, lq2Count);
    tallyArray(row.lq3_answer, QUESTION_OPTIONS.lq3_answer, lq3Count);
    tallyArray(row.lq4_answer, QUESTION_OPTIONS.lq4_answer, lq4Count);
    tallyArray(row.lq5_answer, QUESTION_OPTIONS.lq5_answer, lq5Count);
    tallyArray(row.lq6_answer, QUESTION_OPTIONS.lq6_answer, lq6Count);

    if (row.short_survey_completed) shortSurveyCompletions++;
    if (row.long_survey_completed) longSurveyCompletions++;
  }

  return {
    total,
    moodCount,
    sq1Count, sq2Count, sq3Count,
    lq1Count, lq2Count, lq3Count, lq4Count, lq5Count, lq6Count,
    shortSurveyCompletions,
    longSurveyCompletions,
  };
}
