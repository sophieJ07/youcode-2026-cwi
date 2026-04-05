import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  aggregateEntries,
  type AggregatedData,
  type RawMoodEntry,
} from "./aggregate";
import { getRangeBounds, type ShortTimeRange } from "./time-range";
import {
  moodRowsForDisplay,
  topOptionsFromCounts,
  type StatRow,
} from "./stats-helpers";

/** Same order as kiosk mood tiles (`wellness-questions` levels 1–6). */
export const MOOD_GRID_ORDER = [
  "Tired",
  "Okay",
  "Great",
  "Content",
  "Upset",
  "Anxious",
] as const;

export type ShortInsightsSnapshot = {
  total: number;
  rangeKey: ShortTimeRange;
  rangeLabel: string;
  moodRows: StatRow[];
  shortQuestions: {
    mind: StatRow[];
    movement: StatRow[];
    soul: StatRow[];
  };
};

export type ShortTermInsightsData = {
  snapshot: ShortInsightsSnapshot;
  aggregated: AggregatedData;
};

export async function fetchShortTermInsightsInner(
  range: ShortTimeRange,
): Promise<ShortTermInsightsData> {
  const supabase = await createServerSupabaseClient();
  const { since, until, label } = getRangeBounds(range);

  const { data, error } = await supabase
    .from("mood_entries")
    .select(
      "mood_level, short_survey_completed, long_survey_completed, sq1_answer, sq2_answer, sq3_answer, lq1_answer, lq2_answer, lq3_answer, lq4_answer, lq5_answer, lq6_answer",
    )
    .gte("created_at", since)
    .lte("created_at", until);

  if (error) throw new Error(error.message);

  const aggregated = aggregateEntries((data ?? []) as RawMoodEntry[]);
  const { total, moodCount, sq1Count, sq2Count, sq3Count } = aggregated;

  const snapshot: ShortInsightsSnapshot = {
    total,
    rangeKey: range,
    rangeLabel: label,
    moodRows: moodRowsForDisplay(moodCount, MOOD_GRID_ORDER),
    shortQuestions: {
      mind: topOptionsFromCounts(sq1Count, total, 3),
      movement: topOptionsFromCounts(sq2Count, total, 3),
      soul: topOptionsFromCounts(sq3Count, total, 3),
    },
  };

  return { snapshot, aggregated };
}

/** Deduped per request for the dashboard RSC tree. */
export const getShortTermInsightsData = cache(fetchShortTermInsightsInner);
