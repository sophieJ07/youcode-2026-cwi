import type { OptionCount } from "./aggregate";

export type StatRow = { label: string; count: number; pct: number };

/** Top `limit` options by count (excluding zeros). */
export function topOptionsFromCounts(
  counts: OptionCount,
  denominator: number,
  limit: number,
): StatRow[] {
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      pct: denominator > 0 ? Math.round((count / denominator) * 100) : 0,
    }));
}

/** Mood tiles: percentage share of all mood selections (multiselect). */
export function moodRowsForDisplay(
  moodCount: OptionCount,
  order: readonly string[],
): StatRow[] {
  const totalSelections = order.reduce(
    (sum, label) => sum + (moodCount[label] ?? 0),
    0,
  );
  return order.map((label) => {
    const count = moodCount[label] ?? 0;
    return {
      label,
      count,
      pct:
        totalSelections > 0
          ? Math.round((count / totalSelections) * 100)
          : 0,
    };
  });
}

/** Pad or trim to exactly `slots` rows for UI placeholders. */
export function padStatSlots(rows: StatRow[], slots: number): (StatRow | null)[] {
  const out: (StatRow | null)[] = rows.slice(0, slots);
  while (out.length < slots) out.push(null);
  return out;
}
