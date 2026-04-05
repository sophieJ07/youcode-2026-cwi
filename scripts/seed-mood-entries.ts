/**
 * seed-mood-entries.ts
 *
 * Generates realistic mock mood_entries for 3 shelters to support
 * short-term (1h / 6h / today) and long-term (1w / 2w) dashboard analysis.
 *
 * Shelter profiles:
 *   S093 (75 entries) — high stress, food insecurity, Tired/Anxious heavy
 *   S145 (60 entries) — mixed mood, weak belonging, Okay/Upset heavy
 *   S090 (60 entries) — relatively positive, Content/Great heavy
 *
 * Mood levels (from wellness-questions.ts):
 *   1=Tired  2=Okay  3=Great  4=Content  5=Upset  6=Anxious
 *
 * Survey constraints (from kiosk-wellness-flow.tsx):
 *   Short: SQ1/SQ2/SQ3 — all multiselect, options 1–6
 *   Long:  LQ1/LQ2/LQ4/LQ5 — single select, options 1–5
 *          LQ3/LQ6          — multiselect,   options 1–5
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-mood-entries.ts
 */

import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ─── Shelter config ───────────────────────────────────────────────────────────

const SHELTERS = [
  {
    id: "b5402dcd-7432-4a01-b8ad-9d2bd8786679", // S093
    totalEntries: 75,
    profile: "stressed",   // Tired + Anxious heavy, food poor, stress high
  },
  {
    id: "69dd9297-653a-4db8-b2db-df3326aa583c", // S145
    totalEntries: 60,
    profile: "mixed",      // Okay + Upset, weak belonging
  },
  {
    id: "2fee39e9-ae82-43f0-96ce-450cac06cb85", // S090
    totalEntries: 60,
    profile: "positive",   // Content + Great, stronger community
  },
] as const;

// ─── Time helpers ─────────────────────────────────────────────────────────────

const now = Date.now();
const HOUR = 3600_000;
const DAY = 24 * HOUR;

/**
 * Returns a random timestamp within [from, to] ms ago.
 */
function randomTimeBetween(fromMsAgo: number, toMsAgo: number): string {
  const ms = now - fromMsAgo - Math.random() * (toMsAgo - fromMsAgo);
  return new Date(ms).toISOString();
}

/**
 * Time slots per shelter (10% today, rest spread over 14 days).
 * Returns array of { fromMsAgo, toMsAgo } pairs.
 */
function buildTimeSlots(total: number): { fromMsAgo: number; toMsAgo: number; count: number }[] {
  // Today breakdown (~10%)
  const last1h      = Math.round(total * 0.027); // ~2
  const h1to6       = Math.round(total * 0.033); // ~2-3
  const restToday   = Math.round(total * 0.04);  // ~2-3

  // Past 7 days (days 1–7), roughly 58%
  const per7daySlot = Math.round((total * 0.58) / 7);

  // Days 8–14, roughly 32%
  const per14daySlot = Math.round((total * 0.32) / 7);

  const slots: { fromMsAgo: number; toMsAgo: number; count: number }[] = [
    { fromMsAgo: 0,        toMsAgo: HOUR,         count: Math.max(1, last1h) },
    { fromMsAgo: HOUR,     toMsAgo: 6 * HOUR,     count: Math.max(1, h1to6) },
    { fromMsAgo: 6 * HOUR, toMsAgo: DAY,          count: Math.max(1, restToday) },
    ...Array.from({ length: 7 }, (_, i) => ({
      fromMsAgo: (i + 1) * DAY,
      toMsAgo:   (i + 2) * DAY,
      count: Math.max(1, per7daySlot),
    })),
    ...Array.from({ length: 7 }, (_, i) => ({
      fromMsAgo: (i + 8) * DAY,
      toMsAgo:   (i + 9) * DAY,
      count: Math.max(1, per14daySlot),
    })),
  ];

  return slots;
}

// ─── Random helpers ───────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function maybe(probability: number): boolean {
  return Math.random() < probability;
}

// ─── Mood generators per profile ─────────────────────────────────────────────
// mood_level: 1=Tired 2=Okay 3=Great 4=Content 5=Upset 6=Anxious
// Must be non-empty array.

function generateMood(profile: string): number[] {
  const weights: Record<string, number[][]> = {
    stressed: [
      [1],        // Tired
      [6],        // Anxious
      [1, 6],     // Tired + Anxious
      [5],        // Upset
      [1, 5],     // Tired + Upset
      [2],        // Okay
    ],
    mixed: [
      [2],        // Okay
      [5],        // Upset
      [1],        // Tired
      [2, 5],     // Okay + Upset
      [6],        // Anxious
      [4],        // Content
    ],
    positive: [
      [4],        // Content
      [3],        // Great
      [2],        // Okay
      [3, 4],     // Great + Content
      [1],        // Tired
      [2, 4],     // Okay + Content
    ],
  };
  return pick(weights[profile] ?? weights.mixed);
}

// ─── Short survey generators ──────────────────────────────────────────────────
// SQ1/SQ2/SQ3 all multiselect, options 1–6

function generateSQ1(profile: string): number[] {
  // Mind: what would be most helpful?
  if (profile === "stressed") return pickN([1, 2, 3, 4, 5, 6], maybe(0.4) ? 2 : 1);
  if (profile === "mixed")    return pickN([1, 2, 4, 5, 6], maybe(0.3) ? 2 : 1);
  return pickN([1, 3, 5, 6], maybe(0.3) ? 2 : 1);
}

function generateSQ2(profile: string): number[] {
  // Body: what movement feels doable?
  if (profile === "stressed") return pickN([2, 3, 4], 1); // light/chair/breathing
  if (profile === "mixed")    return pickN([1, 2, 4, 5], maybe(0.3) ? 2 : 1);
  return pickN([1, 2, 5, 6], maybe(0.4) ? 2 : 1); // more active
}

function generateSQ3(profile: string): number[] {
  // Soul: activities that help you feel like you?
  if (profile === "stressed") return pickN([1, 3, 5], maybe(0.3) ? 2 : 1);
  if (profile === "mixed")    return pickN([1, 2, 4, 6], maybe(0.4) ? 2 : 1);
  return pickN([2, 4, 5, 6], maybe(0.4) ? 2 : 1);
}

// ─── Long survey generators ───────────────────────────────────────────────────
// LQ1/LQ2/LQ4/LQ5 → single select (array of 1)
// LQ3/LQ6         → multiselect

function generateLQ1(profile: string): number[] {
  // Stress level: 1=Not at all ... 5=Extremely
  if (profile === "stressed") return [pick([4, 4, 5])];
  if (profile === "mixed")    return [pick([2, 3, 3, 4])];
  return [pick([1, 2, 2, 3])];
}

function generateLQ2(profile: string): number[] {
  // Hopefulness: 1=Never ... 5=All days
  if (profile === "stressed") return [pick([1, 2, 2])];
  if (profile === "mixed")    return [pick([2, 3, 3])];
  return [pick([3, 4, 4, 5])];
}

function generateLQ3(profile: string): number[] {
  // Body feeling (multiselect): 1=Tired 2=Sore 3=Stiff 4=Energetic 5=Comfortable
  if (profile === "stressed") return pickN([1, 2, 3], maybe(0.5) ? 2 : 1);
  if (profile === "mixed")    return pickN([1, 2, 3, 5], maybe(0.4) ? 2 : 1);
  return pickN([4, 5, 5], maybe(0.3) ? 2 : 1);
}

function generateLQ4(profile: string): number[] {
  // Food access: 1=Terrible ... 5=Excellent
  if (profile === "stressed") return [pick([1, 1, 2, 2])];
  if (profile === "mixed")    return [pick([2, 3, 3])];
  return [pick([3, 4, 4])];
}

function generateLQ5(profile: string): number[] {
  // Belonging: 1=Very strong ... 5=Very weak
  if (profile === "stressed") return [pick([3, 4, 4, 5])];
  if (profile === "mixed")    return [pick([3, 4, 4])];
  return [pick([1, 2, 2, 3])];
}

function generateLQ6(): number[] {
  // Programs interested in (multiselect): 1–5
  return pickN([1, 2, 3, 4, 5], maybe(0.5) ? 2 : 1);
}

// ─── Entry builder ────────────────────────────────────────────────────────────

type MoodEntry = {
  shelter_id: string;
  created_at: string;
  mood_level: number[];
  short_survey_completed: boolean;
  long_survey_completed: boolean;
  sq1_answer: number[] | null;
  sq2_answer: number[] | null;
  sq3_answer: number[] | null;
  lq1_answer: number[] | null;
  lq2_answer: number[] | null;
  lq3_answer: number[] | null;
  lq4_answer: number[] | null;
  lq5_answer: number[] | null;
  lq6_answer: number[] | null;
};

function buildEntry(
  shelterId: string,
  profile: string,
  createdAt: string,
): MoodEntry {
  // Survey completion: ~40% short only, ~20% short+long, ~40% mood only
  const roll = Math.random();
  const doShort = roll < 0.6;
  const doLong  = roll < 0.2;

  return {
    shelter_id: shelterId,
    created_at: createdAt,
    mood_level: generateMood(profile),
    short_survey_completed: doShort,
    long_survey_completed: doLong,
    sq1_answer: doShort ? generateSQ1(profile) : null,
    sq2_answer: doShort ? generateSQ2(profile) : null,
    sq3_answer: doShort ? generateSQ3(profile) : null,
    lq1_answer: doLong  ? generateLQ1(profile) : null,
    lq2_answer: doLong  ? generateLQ2(profile) : null,
    lq3_answer: doLong  ? generateLQ3(profile) : null,
    lq4_answer: doLong  ? generateLQ4(profile) : null,
    lq5_answer: doLong  ? generateLQ5(profile) : null,
    lq6_answer: doLong  ? generateLQ6()        : null,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const allEntries: MoodEntry[] = [];

  for (const shelter of SHELTERS) {
    const slots = buildTimeSlots(shelter.totalEntries);
    let built = 0;

    for (const slot of slots) {
      for (let i = 0; i < slot.count; i++) {
        const createdAt = randomTimeBetween(slot.fromMsAgo, slot.toMsAgo);
        allEntries.push(buildEntry(shelter.id, shelter.profile, createdAt));
        built++;
      }
    }
    console.log(`✓ ${shelter.id.slice(0, 8)}... (${shelter.profile}): ${built} entries prepared`);
  }

  console.log(`\nInserting ${allEntries.length} entries into Supabase...`);

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < allEntries.length; i += BATCH) {
    const batch = allEntries.slice(i, i + BATCH);
    const { error } = await supabase.from("mood_entries").insert(batch);
    if (error) {
      console.error(`❌ Batch ${i / BATCH + 1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted}/${allEntries.length} inserted...`);
  }

  console.log(`\n✅ Done! ${inserted} mood entries inserted across 3 shelters.`);
  console.log("\nBreakdown by time window (approximate):");
  console.log("  Last 1h:   ~18 entries");
  console.log("  Last 6h:   ~45 entries");
  console.log("  Today:     ~60 entries (10%)");
  console.log("  Last 7d:   ~345 entries");
  console.log("  Last 14d:  ~195 total");
}

main();
