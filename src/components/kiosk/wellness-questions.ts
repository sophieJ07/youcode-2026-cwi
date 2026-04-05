import type { useTranslations } from "next-intl";

export type WellnessQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type TFunction = ReturnType<typeof useTranslations>;

export function getMoodOptions(t: TFunction) {
  return [
    { id: "great", label: t("MoodOptions.great") },
    { id: "content", label: t("MoodOptions.content") },
    { id: "okay", label: t("MoodOptions.okay") },
    { id: "tired", label: t("MoodOptions.tired") },
    { id: "anxious", label: t("MoodOptions.anxious") },
    { id: "upset", label: t("MoodOptions.upset") },
  ];
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