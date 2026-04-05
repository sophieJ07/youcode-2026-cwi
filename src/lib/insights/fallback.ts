import type { AggregatedData } from "./aggregate";
import type { InsightResult } from "./parse-response";

// ─── Rule-based insight engine (no AI) ───────────────────────────────────────

export function buildFallbackInsight(
  aggregated: AggregatedData,
): InsightResult {
  const {
    total,
    moodCount,
    sq1Count,
    lq1Count,
    lq2Count,
    lq4Count,
    lq5Count,
  } = aggregated;

  // ── Mood signals ──────────────────────────────────────────────────────────
  const distressed = (moodCount["Anxious"] ?? 0) + (moodCount["Upset"] ?? 0) + (moodCount["Tired"] ?? 0);
  const positive = (moodCount["Content"] ?? 0) + (moodCount["Great"] ?? 0);
  const distressedPct = total > 0 ? distressed / total : 0;
  const positivePct = total > 0 ? positive / total : 0;

  // ── Stress signals (LQ1) ──────────────────────────────────────────────────
  const highStress =
    (lq1Count["Quite a bit stressful"] ?? 0) +
    (lq1Count["Extremely stressful"] ?? 0);
  const highStressPct = total > 0 ? highStress / total : 0;

  // ── Hope signals (LQ2) ────────────────────────────────────────────────────
  const lowHope =
    (lq2Count["Never"] ?? 0) + (lq2Count["A few days"] ?? 0);
  const lowHopePct = total > 0 ? lowHope / total : 0;

  // ── Food signals (LQ4) ────────────────────────────────────────────────────
  const poorFood =
    (lq4Count["Terrible"] ?? 0) + (lq4Count["Bad"] ?? 0);
  const poorFoodPct = total > 0 ? poorFood / total : 0;

  // ── Belonging signals (LQ5) ───────────────────────────────────────────────
  const weakBelonging =
    (lq5Count["Somewhat weak"] ?? 0) + (lq5Count["Very weak"] ?? 0);
  const weakBelongingPct = total > 0 ? weakBelonging / total : 0;

  // ── Priority determination ────────────────────────────────────────────────
  let priority: InsightResult["priority"] = "low";
  let priority_reason = "Most residents appear to be doing reasonably well today.";

  if (distressedPct >= 0.4 || highStressPct >= 0.4 || lowHopePct >= 0.5) {
    priority = "high";
    priority_reason =
      distressedPct >= 0.4
        ? `${Math.round(distressedPct * 100)}% of residents reported feeling Anxious, Upset, or Tired.`
        : highStressPct >= 0.4
        ? `${Math.round(highStressPct * 100)}% of residents reported high or extreme stress.`
        : `${Math.round(lowHopePct * 100)}% of residents reported rarely or never feeling hopeful.`;
  } else if (distressedPct >= 0.25 || highStressPct >= 0.25 || poorFoodPct >= 0.3) {
    priority = "medium";
    priority_reason =
      poorFoodPct >= 0.3
        ? `${Math.round(poorFoodPct * 100)}% of residents rated their food access as poor.`
        : `A notable portion of residents are experiencing stress or low mood.`;
  }

  // ── Situation summary ─────────────────────────────────────────────────────
  const situation_summary =
    total === 0
      ? "No check-ins have been recorded yet. Encourage residents to use the kiosk."
      : `${total} resident(s) checked in today. ` +
        `${Math.round(distressedPct * 100)}% reported low or rough mood, ` +
        `${Math.round(positivePct * 100)}% reported good or great mood. ` +
        (highStressPct > 0
          ? `${Math.round(highStressPct * 100)}% indicated high stress levels.`
          : "Stress levels appear manageable across the group.");

  // ── Suggested actions ─────────────────────────────────────────────────────
  const suggested_actions: InsightResult["suggested_actions"] = [];

  if (distressedPct >= 0.25) {
    suggested_actions.push({
      action: "Check in individually with residents who seem withdrawn or upset",
      reason: `${Math.round(distressedPct * 100)}% of residents reported feeling Anxious, Upset, or Tired today.`,
    });
  }

  const topMindNeed = topKey(sq1Count);
  if (topMindNeed && topMindNeed !== "None right now") {
    suggested_actions.push({
      action: `Prioritise offering: ${topMindNeed}`,
      reason: `This was the most commonly requested support in today's check-ins.`,
    });
  }

  if (poorFoodPct >= 0.25) {
    suggested_actions.push({
      action: "Review food supply and ensure nutritious options are available",
      reason: `${Math.round(poorFoodPct * 100)}% of residents rated food access as poor or terrible.`,
    });
  }

  if (weakBelongingPct >= 0.3) {
    suggested_actions.push({
      action: "Organise a community activity or group check-in session",
      reason: `${Math.round(weakBelongingPct * 100)}% of residents feel a weak sense of community belonging.`,
    });
  }

  if (highStressPct >= 0.3) {
    suggested_actions.push({
      action: "Make calming resources visible (breathing guides, quiet space)",
      reason: `${Math.round(highStressPct * 100)}% of residents reported high or extreme stress.`,
    });
  }

  if (suggested_actions.length === 0) {
    suggested_actions.push({
      action: "Continue regular check-ins and maintain a welcoming environment",
      reason: "Residents appear to be doing relatively well today.",
    });
  }

  // ── Watch out for ─────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (distressedPct >= 0.4) warnings.push("high proportion of residents feeling Anxious, Upset, or Tired");
  if (lowHopePct >= 0.4) warnings.push("many residents reporting low hope");
  if (poorFoodPct >= 0.4) warnings.push("significant food access concerns");
  if (weakBelongingPct >= 0.5) warnings.push("widespread sense of isolation");

  const watch_out_for =
    warnings.length > 0
      ? `Watch for signs of: ${warnings.join(", ")}.`
      : "No major warning signs identified today. Stay attentive to any sudden mood changes.";

  return {
    priority,
    priority_reason,
    situation_summary,
    suggested_actions,
    watch_out_for,
  };
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function topKey(count: Record<string, number>): string | null {
  const entries = Object.entries(count).filter(([, n]) => n > 0);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}
