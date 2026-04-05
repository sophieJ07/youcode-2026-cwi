import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { aggregateEntries, type RawMoodEntry, type AggregatedData } from "./aggregate";
import { buildGroupPrompt } from "./build-prompt";
import { parseInsightResponse, type InsightResult } from "./parse-response";
import { buildFallbackInsight } from "./fallback";
import { claudeChat } from "@/lib/claude";

// React.cache deduplicates this call within a single render —
// both slots (wellness + actions) share one fetch + one AI call.
export const getInsightResult = cache(async (): Promise<{
  result: InsightResult;
  aggregated: AggregatedData;
}> => {
  const supabase = await createServerSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("mood_entries")
    .select(
      "mood_level, short_survey_completed, long_survey_completed, sq1_answer, sq2_answer, sq3_answer, lq1_answer, lq2_answer, lq3_answer, lq4_answer, lq5_answer, lq6_answer",
    )
    .gte("created_at", since);

  if (error) throw new Error(error.message);

  const aggregated = aggregateEntries((data ?? []) as RawMoodEntry[]);

  const useAI = process.env.AI_PROVIDER === "claude";

  if (useAI && aggregated.total > 0) {
    const timeContext = new Date().toLocaleString("en-CA", {
      timeZone: "America/Vancouver",
      dateStyle: "full",
      timeStyle: "short",
    });
    const prompt = buildGroupPrompt(aggregated, timeContext);
    const systemPrompt =
      "You are an assistant helping shelter staff make compassionate, informed decisions. Always respond with valid JSON only — no extra text.";
    const raw = await claudeChat(systemPrompt, prompt);
    const result = parseInsightResponse(raw);
    return { result, aggregated };
  }

  return { result: buildFallbackInsight(aggregated), aggregated };
});
