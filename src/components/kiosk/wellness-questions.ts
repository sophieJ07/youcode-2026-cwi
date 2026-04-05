import type { useTranslations } from "next-intl";

export type WellnessQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

/** First check-in moods — order defines stable level 1–6 for `mood_level` int[]. */
export type MoodOption = {
  id: string;
  label: string;
  /** Public URL under /public */
  imageSrc: string;
  /** Stored in DB (1-based index in this array). */
  level: number;
};

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "tired",
    label: "Tired",
    imageSrc: "/assets/mood/tired.png",
    level: 1,
  },
  {
    id: "okay",
    label: "Okay",
    imageSrc: "/assets/mood/okay.png",
    level: 2,
  },
  {
    id: "great",
    label: "Great",
    imageSrc: "/assets/mood/great.png",
    level: 3,
  },
  {
    id: "content",
    label: "Content",
    imageSrc: "/assets/mood/content.png",
    level: 4,
  },
  {
    id: "upset",
    label: "Upset",
    imageSrc: "/assets/mood/upset.png",
    level: 5,
  },
  {
    id: "anxious",
    label: "Anxious",
    imageSrc: "/assets/mood/anxious.png",
    level: 6,
  },
];

const moodLevelById = new Map(MOOD_OPTIONS.map((m) => [m.id, m.level]));

/** Map selected mood tile ids to DB mood_level ints (multiselect). */
export function moodLevelsFromSelection(selectedIds: string[]): number[] {
  const levels = selectedIds
    .map((id) => moodLevelById.get(id))
    .filter((n): n is number => n != null);
  return [...new Set(levels)].sort((a, b) => a - b);
}

type TFunction = ReturnType<typeof useTranslations>;

export function getMoodOptions(t: TFunction): MoodOption[] {
  return MOOD_OPTIONS.map((m) => ({
    ...m,
    label: t(`MoodOptions.${m.id}` as Parameters<TFunction>[0]),
  }));
}

const SHORT_IDS = ["short-1", "short-2", "short-3"];
const SHORT_OPT_COUNTS: Record<string, number> = {
  "short-1": 6,
  "short-2": 6,
  "short-3": 6,
};

export function getShortQuestions(t: TFunction): WellnessQuestion[] {
  return SHORT_IDS.map((id) => ({
    id,
    prompt: t(`ShortQuestions.${id}-prompt` as Parameters<TFunction>[0]),
    options: Array.from({ length: SHORT_OPT_COUNTS[id] }, (_, i) =>
      t(`ShortQuestions.${id}-opt-${i}` as Parameters<TFunction>[0]),
    ),
  }));
}

const LONG_IDS = ["long-1", "long-2", "long-3", "long-4", "long-5", "long-6"];
const LONG_OPT_COUNTS: Record<string, number> = {
  "long-1": 5,
  "long-2": 5,
  "long-3": 5,
  "long-4": 5,
  "long-5": 5,
  "long-6": 5,
};

export function getLongQuestions(t: TFunction): WellnessQuestion[] {
  return LONG_IDS.map((id) => ({
    id,
    prompt: t(`LongQuestions.${id}-prompt` as Parameters<TFunction>[0]),
    options: Array.from({ length: LONG_OPT_COUNTS[id] }, (_, i) =>
      t(`LongQuestions.${id}-opt-${i}` as Parameters<TFunction>[0]),
    ),
  }));
}