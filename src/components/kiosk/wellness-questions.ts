/** Copy for follow-up flows (all optional multiselect). Replace with final copy as needed. */

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

/** Three short questions — shown one at a time. */
export const SHORT_FOLLOWUP_QUESTIONS: WellnessQuestion[] = [
  {
    id: "short-1",
    prompt: "What would help you most today?",
    options: [
      "A quiet space",
      "Someone to talk to",
      "Food or essentials",
      "Help with housing",
      "Medical or mental health support",
      "Other resources",
    ],
  },
  {
    id: "short-2",
    prompt: "How has rest or sleep been for you lately?",
    options: [
      "Sleeping well",
      "Some trouble sleeping",
      "Often tired",
      "Nightmares or unrest",
      "Prefer not to say",
    ],
  },
  {
    id: "short-3",
    prompt: "Is there anything else you want the team to know right now?",
    options: [
      "I feel safe today",
      "I'm worried about safety",
      "I'd like a follow-up",
      "I'm okay for now",
      "Prefer not to say",
    ],
  },
];

/** Six questions — long scrollable form. */
export const LONG_FOLLOWUP_QUESTIONS: WellnessQuestion[] = [
  {
    id: "long-1",
    prompt: "In the past week, what best describes your overall mood?",
    options: [
      "Mostly positive",
      "Mixed up and down",
      "Mostly low or heavy",
      "Numb or shut down",
      "Prefer not to say",
    ],
  },
  {
    id: "long-2",
    prompt: "What has been hardest lately? (Select any that apply.)",
    options: [
      "Housing or stability",
      "Money or work",
      "Family or relationships",
      "Health or substance use",
      "Loneliness or isolation",
      "Something I'd rather not specify",
    ],
  },
  {
    id: "long-3",
    prompt: "How connected do you feel to support here?",
    options: [
      "Very connected",
      "Somewhat connected",
      "Not sure yet",
      "Not very connected",
      "Prefer not to say",
    ],
  },
  {
    id: "long-4",
    prompt: "What helps you feel grounded? (Select any.)",
    options: [
      "Routine or structure",
      "Faith or spiritual practice",
      "Music or art",
      "Exercise or movement",
      "Talking with others",
      "Time alone",
    ],
  },
  {
    id: "long-5",
    prompt: "Any changes in appetite or energy this week?",
    options: [
      "Eating more than usual",
      "Eating less than usual",
      "More energy",
      "Less energy",
      "About the same",
      "Prefer not to say",
    ],
  },
  {
    id: "long-6",
    prompt: "Anything else you want staff to know? (Select any.)",
    options: [
      "I'm grateful for support",
      "I need more help soon",
      "I want to be left alone today",
      "I'd like information about programs",
      "No, not right now",
    ],
  },
];
