import type { AggregatedData } from "./aggregate";
import { claudeChat } from "@/lib/claude";

export type ActivitySuggestionsResult = {
  high_level_summary: string;
  suggested_activities: string[];
};

export function buildActivitySuggestionsPrompt(
  aggregated: AggregatedData,
  timeContext: string,
  rangeLabel: string,
): string {
  const {
    total,
    moodCount,
    sq1Count,
    sq2Count,
    sq3Count,
    shortSurveyCompletions,
  } = aggregated;

  const moodLines = Object.entries(moodCount)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([l, n]) => `- ${l}: ${n}`)
    .join("\n");

  const topBlock = (counts: Record<string, number>) =>
    Object.entries(counts)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([l, n]) => `- ${l}: ${n}`)
      .join("\n") || "- (no selections)";

  return `
You help shelter staff choose practical, safe group activities based on anonymous kiosk data.

CONTEXT
- Local time: ${timeContext}
- Time window label: ${rangeLabel}
- Check-ins in window: ${total}
- Short survey completions: ${shortSurveyCompletions}

MOOD SELECTIONS (multiselect tallies)
${moodLines || "- (none)"}

SHORT — What would help most (mind)?
${topBlock(sq1Count)}

SHORT — Movement that feels doable?
${topBlock(sq2Count)}

SHORT — Activities that help residents feel like themselves?
${topBlock(sq3Count)}

TASK
Return ONLY valid JSON (no markdown):
{
  "high_level_summary": "2-3 sentences on how residents seem to be doing and what themes stand out",
  "suggested_activities": [ "4-5 specific activity ideas staff could run soon", "..."]
}

Rules:
- Activities must be realistic in a shelter (low cost, inclusive, trauma-informed tone).
- Do not reference any individual; this is aggregate data only.
- If data is sparse, say so briefly and still offer gentle, generic activities.
`.trim();
}

export function parseActivitySuggestionsResponse(raw: string): ActivitySuggestionsResult {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI response was not valid JSON:\n${raw}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("AI response JSON was not an object");
  }

  const obj = parsed as Record<string, unknown>;
  const activities = obj["suggested_activities"];
  const list = Array.isArray(activities)
    ? activities.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean)
    : [];

  return {
    high_level_summary: String(obj["high_level_summary"] ?? ""),
    suggested_activities: list,
  };
}

export async function runActivitySuggestionsModel(
  aggregated: AggregatedData,
  timeContext: string,
  rangeLabel: string,
): Promise<ActivitySuggestionsResult> {
  const prompt = buildActivitySuggestionsPrompt(
    aggregated,
    timeContext,
    rangeLabel,
  );
  const systemPrompt =
    "You assist shelter staff. Reply with valid JSON only — no other text.";
  const raw = await claudeChat(systemPrompt, prompt);
  return parseActivitySuggestionsResponse(raw);
}
