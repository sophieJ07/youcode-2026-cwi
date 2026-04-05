import type { AggregatedData, OptionCount } from "./aggregate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topOptions(
  count: OptionCount,
  total: number,
  minPct = 0.1,
  maxItems = 5,
): string {
  const lines = Object.entries(count)
    .filter(([, n]) => n > 0 && n / total >= minPct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([label, n]) => {
      const pct = Math.round((n / total) * 100);
      return `- ${label}: ${n} residents (${pct}%)`;
    });

  return lines.length > 0 ? lines.join("\n") : "- No responses above threshold";
}

function allOptions(count: OptionCount, total: number): string {
  return Object.entries(count)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => {
      const pct = Math.round((n / total) * 100);
      return `- ${label}: ${n} residents (${pct}%)`;
    })
    .join("\n") || "- No responses";
}

// ─── Main prompt builder ───────────────────────────────────────────────────────

export function buildGroupPrompt(
  aggregated: AggregatedData,
  timeContext: string,
): string {
  const {
    total,
    moodCount,
    sq1Count, sq2Count, sq3Count,
    lq1Count, lq2Count, lq3Count, lq4Count, lq5Count, lq6Count,
    shortSurveyCompletions,
    longSurveyCompletions,
  } = aggregated;

  const shortPct = Math.round((shortSurveyCompletions / total) * 100);
  const longPct = Math.round((longSurveyCompletions / total) * 100);

  return `
You are an assistant helping staff at a homeless shelter make informed,
compassionate decisions about resident support.

CONTEXT:
- Time of check-in: ${timeContext}
- Total residents who checked in: ${total}
- Short survey completed: ${shortSurveyCompletions} residents (${shortPct}%)
- Long survey completed: ${longSurveyCompletions} residents (${longPct}%)
- All data below is fully anonymized and aggregated (no individual data)

═══════════════════════════════
OPENING — HOW ARE YOU DOING?
═══════════════════════════════
(Scale: Rough → Low → Okay → Good → Great)
${allOptions(moodCount, total)}

═══════════════════════════════
SHORT SURVEY RESPONSES
═══════════════════════════════

MIND — What would be most helpful right now?
${topOptions(sq1Count, total)}

BODY — What movement feels doable?
${topOptions(sq2Count, total)}

SOUL — What activities make you feel like yourself?
${topOptions(sq3Count, total)}

═══════════════════════════════
LONG SURVEY RESPONSES
═══════════════════════════════

MIND — Stress level over the last two weeks:
${allOptions(lq1Count, total)}

MIND — How often felt hopeful over the last two weeks:
${allOptions(lq2Count, total)}

BODY — How has your body felt this week?
${topOptions(lq3Count, total)}

BODY — Access to nutritious food:
${allOptions(lq4Count, total)}

SOUL — Sense of belonging in the community:
${allOptions(lq5Count, total)}

SOUL — Programs of interest:
${topOptions(lq6Count, total)}

═══════════════════════════════
TASK
═══════════════════════════════
Based on the above aggregated data, provide a staff briefing in the
following JSON format. Do not include any text outside the JSON.

{
  "priority": "high" | "medium" | "low",
  "priority_reason": "one sentence explaining why this priority level",
  "situation_summary": "2-3 sentences describing the overall resident situation today",
  "suggested_actions": [
    {
      "action": "specific thing staff can do right now",
      "reason": "why this is relevant based on the data"
    }
  ],
  "watch_out_for": "any specific warning signs staff should monitor today"
}

GUIDELINES:
- Include 3-5 suggested actions
- Be specific and practical, not generic
- Actions must be realistic for shelter staff to actually do
- If survey completion is low, note that data may not be fully representative
- Do not reference any individual resident
- Focus on what staff can do in the next few hours
`.trim();
}
