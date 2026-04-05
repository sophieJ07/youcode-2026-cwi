import { getInsightResult } from "@/lib/insights/get-insight-result";

const PRIORITY_STYLES = {
  high:   { badge: "bg-red-100 text-red-800",    dot: "bg-red-500",    label: "High Priority" },
  medium: { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500",  label: "Medium Priority" },
  low:    { badge: "bg-green-100 text-green-800", dot: "bg-green-500",  label: "Low Priority" },
};

export async function InsightsWellnessSlot() {
  const { result, aggregated } = await getInsightResult();
  const { total, moodCount, shortSurveyCompletions, longSurveyCompletions } = aggregated;
  const style = PRIORITY_STYLES[result.priority];

  if (total === 0) {
    return (
      <p className="text-sm text-[var(--staff-ink)]/50 text-center py-8">
        No check-ins in the past 24 hours yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Priority badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          {style.label}
        </span>
        <span className="text-xs text-[var(--staff-ink)]/50">{result.priority_reason}</span>
      </div>

      {/* Mood snapshot */}
      <div className="grid grid-cols-6 gap-2">
        {(["Content", "Anxious", "Tired", "Okay", "Great", "Upset"] as const).map((label) => {
          const count = moodCount[label] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label} className="rounded-xl border border-[var(--staff-ink)]/10 bg-[var(--staff-input-bg)]/50 p-2 text-center">
              <p className="text-xs text-[var(--staff-ink)]/60">{label}</p>
              <p className="text-xl font-bold text-[var(--staff-ink)]">{count}</p>
              <p className="text-xs text-[var(--staff-ink)]/40">{pct}%</p>
            </div>
          );
        })}
      </div>

      {/* Summary text */}
      <p className="text-sm leading-relaxed text-[var(--staff-ink)]/80">
        {result.situation_summary}
      </p>

      {/* Footer */}
      <p className="text-xs text-[var(--staff-ink)]/40">
        {total} check-ins · {shortSurveyCompletions} short survey · {longSurveyCompletions} long survey · past 24 hours
      </p>
    </div>
  );
}
