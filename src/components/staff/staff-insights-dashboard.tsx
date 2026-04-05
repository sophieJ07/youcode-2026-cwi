"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { generateStaffActivitySuggestions } from "@/app/actions/staff-ai-activity-suggestions";
import type { ShortInsightsSnapshot } from "@/lib/insights/short-term-insights";
import type { ShortTimeRange } from "@/lib/insights/time-range";
import { padStatSlots, type StatRow } from "@/lib/insights/stats-helpers";

/** Circle fills sampled to match `/public/assets/mood/*.png` icons. */
const MOOD_TILE_STYLES: Record<
  string,
  { box: string; label: string; value: string; sub: string }
> = {
  Content: {
    box: "border-[#7f9d52]",
    label: "text-white/95",
    value: "text-white",
    sub: "text-white/80",
  },
  Anxious: {
    box: "border-[#8f7aa5]",
    label: "text-[#2a1f35]",
    value: "text-[#2a1f35]",
    sub: "text-[#2a1f35]/75",
  },
  Tired: {
    box: "border-[#667a8a]",
    label: "text-white/95",
    value: "text-white",
    sub: "text-white/80",
  },
  Okay: {
    box: "border-[#dcb896]",
    label: "text-[#5c3d28]",
    value: "text-[#4a3228]",
    sub: "text-[#5c3d28]/75",
  },
  Great: {
    box: "border-[#c5a44d]",
    label: "text-[#3d3519]",
    value: "text-[#2e2812]",
    sub: "text-[#3d3519]/80",
  },
  Upset: {
    box: "border-[#5e2b2a]",
    label: "text-white/95",
    value: "text-white",
    sub: "text-white/80",
  },
};

const MOOD_TILE_BG: Record<string, string> = {
  Content: "bg-[#97AF68]",
  Anxious: "bg-[#A898BC]",
  Tired: "bg-[#7B90A0]",
  Okay: "bg-[#efc9a3]",
  Great: "bg-[#dab960]",
  Upset: "bg-[#733432]",
};

/** AI activity rows — softer concrete maroon, white type. */
const AI_SUGGESTION_ROW =
  "rounded-lg border border-[#6b3d40]/25 bg-[#9a6d70] px-3 py-3 text-base font-medium text-white shadow-sm";

type Props = {
  term: "short" | "long";
  range: ShortTimeRange;
  snapshot: ShortInsightsSnapshot | null;
  aiConfigured: boolean;
};

function SlotList({ rows }: { rows: (StatRow | null)[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-2">
      {rows.map((row, i) => (
        <li
          key={i}
          className="rounded-lg border border-white/80 bg-white/90 px-3 py-2.5 text-base text-[var(--staff-ink)] shadow-sm"
        >
          {row ? (
            <span>
              <span className="font-medium">{row.label}</span>
              <span className="text-[var(--staff-ink)]/50">
                {" "}
                · {row.count} ({row.pct}%)
              </span>
            </span>
          ) : (
            <span className="text-[var(--staff-ink)]/35">—</span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function StaffInsightsDashboard({
  term,
  range,
  snapshot,
  aiConfigured,
}: Props) {
  const [aiOn, setAiOn] = useState(false);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    activities: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const runAi = useCallback(() => {
    setAiError(null);
    startTransition(async () => {
      const res = await generateStaffActivitySuggestions(range);
      if (!res.ok) {
        setAiResult(null);
        setAiError(res.error);
        return;
      }
      setAiResult({
        summary: res.data.high_level_summary,
        activities: res.data.suggested_activities,
      });
    });
  }, [range]);

  const onToggleAi = (next: boolean) => {
    setAiOn(next);
    setAiError(null);
    if (!next) {
      setAiResult(null);
      return;
    }
    if (aiConfigured && term === "short" && snapshot && snapshot.total > 0) {
      runAi();
    }
  };

  const qs = (t: "short" | "long", r?: ShortTimeRange) => {
    if (t === "long") return "/staff/dashboard?term=long";
    return `/staff/dashboard?term=short&range=${r ?? range}`;
  };

  return (
    <>
      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-[var(--staff-ink)]/10 pb-3">
        <Link
          href={qs("short", range)}
          className={`rounded-full px-5 py-2.5 text-base font-semibold transition ${
            term === "short"
              ? "bg-[var(--staff-accent)] text-white shadow-sm"
              : "bg-[var(--staff-input-bg)] text-[var(--staff-ink)] hover:opacity-90"
          }`}
        >
          Short term
        </Link>
        <Link
          href={qs("long")}
          className={`rounded-full px-5 py-2.5 text-base font-semibold transition ${
            term === "long"
              ? "bg-[var(--staff-accent)] text-white shadow-sm"
              : "bg-[var(--staff-input-bg)] text-[var(--staff-ink)] hover:opacity-90"
          }`}
        >
          Long term
        </Link>
      </div>

      {term === "short" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["1h", "Last hour"],
              ["6h", "Last 6 hours"],
              ["today", "Today"],
            ] as const
          ).map(([key, label]) => (
            <Link
              key={key}
              href={qs("short", key)}
              className={`rounded-full border-2 px-4 py-2 text-base font-medium transition sm:px-5 sm:py-2.5 ${
                range === key
                  ? "border-[var(--staff-accent)] bg-[var(--staff-card)] text-[var(--staff-accent)]"
                  : "border-transparent bg-[var(--staff-input-bg)] text-[var(--staff-ink)] hover:border-[var(--staff-ink)]/15"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {term === "long" && (
        <section className="mt-8 rounded-2xl border border-dashed border-[var(--staff-ink)]/20 bg-[var(--staff-card)]/80 p-10 text-center shadow-inner">
          <h2 className="text-xl font-bold text-[var(--staff-ink)]">
            Long-term insights
          </h2>
          <p className="mt-3 text-base text-[var(--staff-ink)]/60">
            Longer windows and trends will appear here in a future update.
          </p>
        </section>
      )}

      {term === "short" && snapshot && (
        <>
          <section className="mt-8 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:p-8">
            <h2 className="text-xl font-bold text-[var(--staff-ink)]">
              Wellness Summary ({snapshot.total} total{" "}
              {snapshot.total === 1 ? "response" : "responses"})
            </h2>

            {snapshot.total === 0 ? (
              <p className="mt-8 py-6 text-center text-base text-[var(--staff-ink)]/50">
                No check-ins in this range yet.
              </p>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                  {snapshot.moodRows.map(({ label, count, pct }) => {
                    const sfx = MOOD_TILE_STYLES[label];
                    const bg = MOOD_TILE_BG[label] ?? "bg-[var(--staff-input-bg)]";
                    const box = sfx
                      ? sfx.box
                      : "border-[var(--staff-ink)]/15";
                    return (
                      <div
                        key={label}
                        className={`rounded-xl border-2 p-3 text-center shadow-sm ${bg} ${box}`}
                      >
                        <p
                          className={`text-sm font-semibold ${sfx?.label ?? "text-[var(--staff-ink)]"}`}
                        >
                          {label}
                        </p>
                        <p
                          className={`mt-1 text-2xl font-bold ${sfx?.value ?? "text-[var(--staff-ink)]"}`}
                        >
                          {count}
                        </p>
                        <p
                          className={`text-sm font-medium ${sfx?.sub ?? "text-[var(--staff-ink)]/55"}`}
                        >
                          {pct}%
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--staff-ink)]/10 bg-[#f0d6dc]/50 px-4 py-4 shadow-sm">
                    <h3 className="text-base font-bold text-[var(--staff-ink)]">
                      Most helpful mind activities
                    </h3>
                    <SlotList
                      rows={padStatSlots(snapshot.shortQuestions.mind, 3)}
                    />
                  </div>
                  <div className="rounded-2xl border border-[var(--staff-ink)]/10 bg-[#f0d6dc]/50 px-4 py-4 shadow-sm">
                    <h3 className="text-base font-bold text-[var(--staff-ink)]">
                      Popular feel-good / doable movements
                    </h3>
                    <SlotList
                      rows={padStatSlots(snapshot.shortQuestions.movement, 3)}
                    />
                  </div>
                  <div className="rounded-2xl border border-[var(--staff-ink)]/10 bg-[#f0d6dc]/50 px-4 py-4 shadow-sm">
                    <h3 className="text-base font-bold text-[var(--staff-ink)]">
                      Top activities to help residents feel like themselves
                    </h3>
                    <SlotList
                      rows={padStatSlots(snapshot.shortQuestions.soul, 3)}
                    />
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-[var(--staff-ink)]/10 bg-[var(--staff-card)] p-6 shadow-md sm:mt-8 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-[var(--staff-ink)]">
                Enable AI-powered activity suggestions
              </h2>
              <button
                type="button"
                role="switch"
                aria-checked={aiOn}
                disabled={!aiConfigured || snapshot.total === 0 || pending}
                onClick={() => onToggleAi(!aiOn)}
                className={`relative inline-flex h-9 w-[3.25rem] shrink-0 rounded-full border-2 transition ${
                  aiOn
                    ? "border-[var(--staff-accent)] bg-[var(--staff-accent)]"
                    : "border-[var(--staff-ink)]/20 bg-[var(--staff-input-bg)]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  className={`pointer-events-none absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow transition ${
                    aiOn ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--staff-ink)]/55">
              This involves sending some high level summary data to a generative
              AI. While the data is anonymous, we cannot guarantee that it will not
              be used for training AI models.
            </p>
            {!aiConfigured && (
              <p className="mt-2 text-sm font-medium text-amber-800">
                AI is off: set{" "}
                <code className="rounded bg-amber-100/80 px-1">AI_PROVIDER=claude</code>{" "}
                and an Anthropic API key on the server.
              </p>
            )}
            {aiConfigured && snapshot.total === 0 && (
              <p className="mt-2 text-sm text-[var(--staff-ink)]/55">
                Run check-ins in this range to enable suggestions.
              </p>
            )}
            {aiError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-base text-red-900">
                {aiError}
              </p>
            )}
            {aiOn && pending && (
              <p className="mt-4 text-base text-[var(--staff-ink)]/60">
                Generating suggestions…
              </p>
            )}
            {aiOn && !pending && aiResult && (
              <div className="mt-6 space-y-6 border-t border-[var(--staff-ink)]/10 pt-6">
                <div>
                  <h3 className="text-base font-semibold uppercase tracking-wide text-[var(--staff-ink)]/70">
                    Summary
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[var(--staff-ink)]/85">
                    {aiResult.summary}
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[var(--staff-ink)]">
                    Based on recent responses, we suggest the following
                    activities…
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {aiResult.activities.map((line, i) => (
                      <li key={i} className={AI_SUGGESTION_ROW}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-[var(--staff-ink)]/45">
                  Generated by Claude · {snapshot.rangeLabel}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}