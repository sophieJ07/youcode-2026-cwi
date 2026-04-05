"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  fetchShortTermInsightsInner,
} from "@/lib/insights/short-term-insights";
import { getRangeBounds, type ShortTimeRange } from "@/lib/insights/time-range";
import { runActivitySuggestionsModel } from "@/lib/insights/ai-activity-suggestions";

function isAiEnabled(): boolean {
  return (
    process.env.AI_PROVIDER === "claude" && Boolean(process.env.ANTHROPIC_API_KEY)
  );
}

export type ActivitySuggestionsActionState =
  | { ok: true; data: Awaited<ReturnType<typeof runActivitySuggestionsModel>> }
  | { ok: false; error: string };

export async function generateStaffActivitySuggestions(
  range: ShortTimeRange,
): Promise<ActivitySuggestionsActionState> {
  if (!isAiEnabled()) {
    return {
      ok: false,
      error:
        "AI suggestions are not configured. Set AI_PROVIDER=claude and ANTHROPIC_API_KEY.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  const { count, error: accessErr } = await supabase
    .from("user_shelter_access")
    .select("*", { count: "exact", head: true });

  if (!accessErr && (count == null || count < 1)) {
    return { ok: false, error: "No shelter access." };
  }

  try {
    const { aggregated } = await fetchShortTermInsightsInner(range);
    if (aggregated.total === 0) {
      return {
        ok: false,
        error: "No check-ins in this time range — nothing to analyze.",
      };
    }

    const { label } = getRangeBounds(range);
    const timeContext = new Date().toLocaleString("en-CA", {
      timeZone: "America/Vancouver",
      dateStyle: "full",
      timeStyle: "short",
    });

    const data = await runActivitySuggestionsModel(
      aggregated,
      timeContext,
      label,
    );
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed.";
    return { ok: false, error: msg };
  }
}
