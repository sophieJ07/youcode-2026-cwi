// ─── Types ────────────────────────────────────────────────────────────────────

export type SuggestedAction = {
  action: string;
  reason: string;
};

export type InsightResult = {
  priority: "high" | "medium" | "low";
  priority_reason: string;
  situation_summary: string;
  suggested_actions: SuggestedAction[];
  watch_out_for: string;
};

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseInsightResponse(raw: string): InsightResult {
  // Claude sometimes wraps JSON in markdown code blocks — strip them
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

  const priority = obj["priority"];
  if (priority !== "high" && priority !== "medium" && priority !== "low") {
    throw new Error(`Invalid priority value: ${String(priority)}`);
  }

  return {
    priority,
    priority_reason: String(obj["priority_reason"] ?? ""),
    situation_summary: String(obj["situation_summary"] ?? ""),
    suggested_actions: parseActions(obj["suggested_actions"]),
    watch_out_for: String(obj["watch_out_for"] ?? ""),
  };
}

function parseActions(raw: unknown): SuggestedAction[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const i = item as Record<string, unknown>;
      return {
        action: String(i["action"] ?? ""),
        reason: String(i["reason"] ?? ""),
      };
    });
}
