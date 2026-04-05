"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { WellnessBrandLogo } from "@/components/wellness-brand-logo";
import {
  getMoodOptions,
  getShortQuestions,
  getLongQuestions,
  type WellnessQuestion,
} from "./wellness-questions";
import { LanguageSwitcher } from "./language-switcher";

/** Thanks screen visible time before fade-out (ms). */
const THANKS_VISIBLE_MS = 2400;
const THANKS_FADE_MS = 500;

const SHORT_SURVEY_ICON_SRC = "/assets/survey/short-survey.png";
const LONG_SURVEY_ICON_SRC = "/assets/survey/long-survey.png";

function FollowupOptionIcon({ src }: { src: string }) {
  return (
    <span
      className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-[var(--kiosk-ink)]/10 sm:h-20 sm:w-20"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local raster assets */}
      <img
        src={src}
        alt=""
        width={160}
        height={160}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

type Phase =
  | "access"
  | "mood"
  | "pick-followup"
  | "short"
  | "long"
  | "post-followup"
  | "thanks";

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function MultiselectQuestion({
  question,
  selected,
  onToggle,
  optionalLabel,
}: {
  question: WellnessQuestion;
  selected: string[];
  onToggle: (option: string) => void;
  optionalLabel: string;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-lg font-bold leading-snug text-[var(--kiosk-ink)]">
        {question.prompt}
      </legend>
      <p className="sr-only">{optionalLabel}</p>
      <ul className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const isOn = selected.includes(opt);
          return (
            <li key={opt}>
              <label
                className={`flex cursor-pointer items-center rounded-[1.25rem] border-2 bg-white px-4 py-4 shadow-sm transition-colors ${
                  isOn
                    ? "border-[var(--kiosk-button)] bg-white ring-2 ring-[var(--kiosk-button)]/25"
                    : "border-transparent hover:border-[var(--kiosk-ink)]/15"
                }`}
              >
                <span className="text-base font-medium text-[var(--kiosk-ink)]">
                  {opt}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isOn}
                  onChange={() => onToggle(opt)}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/** Short-question options in the same 2-column tile style as the mood step. */
function ShortQuestionMoodGrid({
  question,
  selected,
  onToggle,
  anonymousLine,
}: {
  question: WellnessQuestion;
  selected: string[];
  onToggle: (option: string) => void;
  anonymousLine: string;
}) {
  return (
    <>
      <h1 className="text-center text-2xl font-bold leading-tight">
        {question.prompt}
      </h1>
      <p className="mt-3 text-center text-base opacity-90">{anonymousLine}</p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {question.options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 bg-white px-2 py-3 text-center shadow-sm transition-colors sm:min-h-[7rem] sm:px-3 ${
                on
                  ? "border-[var(--kiosk-button)] ring-2 ring-[var(--kiosk-button)]/25"
                  : "border-transparent hover:border-[var(--kiosk-ink)]/10"
              }`}
            >
              <span
                className="h-11 w-11 shrink-0 rounded-full bg-neutral-300/80"
                aria-hidden
              />
              <span className="text-sm font-semibold leading-snug sm:text-base">
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function KioskWellnessFlow({ locale }: { locale: string }) {
  const t = useTranslations();

  const MOOD_OPTIONS = getMoodOptions(t);
  const SHORT_FOLLOWUP_QUESTIONS = getShortQuestions(t);
  const LONG_FOLLOWUP_QUESTIONS = getLongQuestions(t);

  const [phase, setPhase] = useState<Phase>("access");
  const [accessInput, setAccessInput] = useState("");

  const [moodSelected, setMoodSelected] = useState<string[]>([]);
  const [shortIndex, setShortIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const [completedShort, setCompletedShort] = useState(false);
  const [completedLong, setCompletedLong] = useState(false);
  const completedShortRef = useRef(false);
  const completedLongRef = useRef(false);
  useEffect(() => {
    completedShortRef.current = completedShort;
  }, [completedShort]);
  useEffect(() => {
    completedLongRef.current = completedLong;
  }, [completedLong]);

  const toggleAnswer = useCallback((qid: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: toggleInList(prev[qid] ?? [], option),
    }));
  }, []);

  const currentShortQ = SHORT_FOLLOWUP_QUESTIONS[shortIndex];

  const [thanksFadeOut, setThanksFadeOut] = useState(false);
  const [moodEnter, setMoodEnter] = useState(true);
  const skipMoodFadeInRef = useRef(false);

  useEffect(() => {
    if (phase !== "thanks") {
      queueMicrotask(() => setThanksFadeOut(false));
      return;
    }
    queueMicrotask(() => setThanksFadeOut(false));
    const timer = window.setTimeout(() => setThanksFadeOut(true), THANKS_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "mood") return;
    if (skipMoodFadeInRef.current) {
      skipMoodFadeInRef.current = false;
      queueMicrotask(() => setMoodEnter(true));
      return;
    }
    queueMicrotask(() => setMoodEnter(false));
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMoodEnter(true));
    });
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const onThanksOpacityTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (phase !== "thanks" || e.propertyName !== "opacity") return;
      if (!thanksFadeOut) return;
      setMoodSelected([]);
      setShortIndex(0);
      setAnswers({});
      setCompletedShort(false);
      setCompletedLong(false);
      setPhase("mood");
      setThanksFadeOut(false);
    },
    [phase, thanksFadeOut],
  );

  const finishShortFlow = useCallback(() => {
    setCompletedShort(true);
    if (completedLongRef.current) setPhase("thanks");
    else setPhase("post-followup");
  }, []);

  const finishLongFlow = useCallback(() => {
    setCompletedLong(true);
    if (completedShortRef.current) setPhase("thanks");
    else setPhase("post-followup");
  }, []);

  const goToTellUsMore = useCallback(() => {
    setCompletedShort(false);
    setCompletedLong(false);
    setShortIndex(0);
    setPhase("pick-followup");
  }, []);

  const header = useMemo(
    () => (
      <header className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <WellnessBrandLogo />
        <span className="text-lg font-bold tracking-tight text-[var(--kiosk-ink)]">
          {t("WellnessFlow.headerTitle")}
        </span>
      </header>
    ),
    [t],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--kiosk-bg)] text-[var(--kiosk-ink)]">
      {header}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-6">

        {phase === "access" && (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
            <h1 className="text-center text-2xl font-bold">
              {t("WellnessFlow.enterAccessCode")}
            </h1>
            <p className="mt-3 text-center text-base opacity-90">
              {t("WellnessFlow.accessCodeSubtitle")}
            </p>
            <label className="mt-8">
              <span className="sr-only">{t("WellnessFlow.enterAccessCode")}</span>
              <input
                type="text"
                value={accessInput}
                onChange={(e) => setAccessInput(e.target.value)}
                placeholder={t("WellnessFlow.accessCodePlaceholder")}
                className="w-full rounded-[1.25rem] border-2 border-transparent bg-white px-5 py-4 text-lg text-[var(--kiosk-ink)] shadow-md placeholder:text-[var(--kiosk-ink)]/40 focus:border-[var(--kiosk-button)] focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const code = accessInput.trim();
                if (!code) return;
                skipMoodFadeInRef.current = true;
                setPhase("mood");
              }}
              className="mx-auto mt-8 min-h-14 w-full max-w-xs rounded-[1.25rem] bg-[var(--kiosk-button)] text-lg font-semibold text-white shadow-md active:scale-[0.99]"
            >
              {t("WellnessFlow.enter")}
            </button>
          </div>
        )}

        {phase === "mood" && (
          <div
            className={`mx-auto w-full max-w-lg flex-1 py-3 transition-opacity ease-out ${
              moodEnter ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: `${THANKS_FADE_MS}ms` }}
          >
            <h1 className="text-center text-2xl font-bold leading-tight">
              {t("WellnessFlow.moodQuestion")}
            </h1>
            <p className="mt-3 text-center text-base opacity-90">
              {t("WellnessFlow.anonymousLine")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {MOOD_OPTIONS.map((m) => {
                const on = moodSelected.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setMoodSelected((prev) => toggleInList(prev, m.id))
                    }
                    className={`flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-[1.25rem] border-2 bg-white px-3 py-4 shadow-sm transition-colors ${
                      on
                        ? "border-[var(--kiosk-button)] ring-2 ring-[var(--kiosk-button)]/25"
                        : "border-transparent hover:border-[var(--kiosk-ink)]/10"
                    }`}
                  >
                    <span className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element -- local raster mood assets */}
                      <img
                        src={m.imageSrc}
                        alt=""
                        width={136}
                        height={136}
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-row gap-3">
              <button
                type="button"
                onClick={() => setPhase("thanks")}
                className="min-h-14 min-w-0 flex-1 rounded-[1.25rem] bg-[var(--kiosk-button)] text-base font-semibold text-white shadow-md sm:text-lg"
              >
                {t("WellnessFlow.sendResponse")}
              </button>
              <button
                type="button"
                onClick={goToTellUsMore}
                className="min-h-14 min-w-0 flex-1 rounded-[1.25rem] bg-[var(--kiosk-button-2)] text-base font-semibold text-white shadow-md sm:text-lg"
              >
                {t("WellnessFlow.tellUsMore")}
              </button>
            </div>
          </div>
        )}

        {phase === "pick-followup" && (
          <div className="mx-auto w-full max-w-lg flex-1 py-4">
            <h1 className="text-center text-2xl font-bold">
              {t("WellnessFlow.tellUsMoreTitle")}
            </h1>
            <p className="mt-3 text-center text-base opacity-90">
              {t("WellnessFlow.anonymousLine")}
            </p>
            <div className="mt-8 flex flex-col gap-5">
              <button
                type="button"
                onClick={() => {
                  setShortIndex(0);
                  setPhase("short");
                }}
                className="flex min-h-[7.5rem] w-full items-center gap-5 rounded-[1.75rem] border-2 border-transparent bg-white px-6 py-5 text-left shadow-md transition hover:border-[var(--kiosk-button)]/25 sm:min-h-[8.5rem]"
              >
                <FollowupOptionIcon src={SHORT_SURVEY_ICON_SRC} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight text-[var(--kiosk-ink)] sm:text-xl">
                    {t("WellnessFlow.shortQuestionsLabel")}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-snug text-[var(--kiosk-ink)]/90 sm:text-base">
                    {t("WellnessFlow.shortQuestionsSubtitle")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPhase("long")}
                className="flex min-h-[7.5rem] w-full items-center gap-5 rounded-[1.75rem] border-2 border-transparent bg-white px-6 py-5 text-left shadow-md transition hover:border-[var(--kiosk-button)]/25 sm:min-h-[8.5rem]"
              >
                <FollowupOptionIcon src={LONG_SURVEY_ICON_SRC} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight text-[var(--kiosk-ink)] sm:text-xl">
                    {t("WellnessFlow.longQuestionsLabel")}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-snug text-[var(--kiosk-ink)]/90 sm:text-base">
                    {t("WellnessFlow.longQuestionsSubtitle")}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {phase === "post-followup" && (
          <div className="mx-auto w-full max-w-lg flex-1 py-4">
            <h1 className="text-center text-2xl font-bold">
              {t("WellnessFlow.almostDone")}
            </h1>
            <p className="mt-3 text-center text-base opacity-90">
              {t("WellnessFlow.anonymousLine")}
            </p>
            <p className="mt-4 text-center text-sm leading-relaxed opacity-80">
              {t("WellnessFlow.almostDoneSubtitle")}
            </p>
            <button
              type="button"
              onClick={() => setPhase("thanks")}
              className="mt-8 w-full min-h-16 rounded-[1.25rem] bg-[var(--kiosk-button)] text-lg font-semibold text-white shadow-md"
            >
              {t("WellnessFlow.submitResponses")}
            </button>
            <div className="mt-6">
              {completedShort && !completedLong && (
                <button
                  type="button"
                  onClick={() => setPhase("long")}
                  className="flex min-h-[7.5rem] w-full items-center gap-5 rounded-[1.75rem] border-2 border-transparent bg-white px-6 py-5 text-left shadow-md transition hover:border-[var(--kiosk-button)]/25 sm:min-h-[8.5rem]"
                >
                  <FollowupOptionIcon src={LONG_SURVEY_ICON_SRC} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-tight text-[var(--kiosk-ink)] sm:text-xl">
                      {t("WellnessFlow.longQuestionsLabel")}
                    </p>
                    <p className="mt-2 text-sm font-normal leading-snug text-[var(--kiosk-ink)]/90 sm:text-base">
                      {t("WellnessFlow.longQuestionsSubtitle")}
                    </p>
                  </div>
                </button>
              )}
              {completedLong && !completedShort && (
                <button
                  type="button"
                  onClick={() => {
                    setShortIndex(0);
                    setPhase("short");
                  }}
                  className="flex min-h-[7.5rem] w-full items-center gap-5 rounded-[1.75rem] border-2 border-transparent bg-white px-6 py-5 text-left shadow-md transition hover:border-[var(--kiosk-button)]/25 sm:min-h-[8.5rem]"
                >
                  <FollowupOptionIcon src={SHORT_SURVEY_ICON_SRC} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-tight text-[var(--kiosk-ink)] sm:text-xl">
                      {t("WellnessFlow.shortQuestionsLabel")}
                    </p>
                    <p className="mt-2 text-sm font-normal leading-snug text-[var(--kiosk-ink)]/90 sm:text-base">
                      {t("WellnessFlow.shortQuestionsSubtitle")}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "short" && currentShortQ && (
          <div className="mx-auto w-full max-w-lg flex-1 py-5">
            <ShortQuestionMoodGrid
              question={currentShortQ}
              selected={answers[currentShortQ.id] ?? []}
              onToggle={(opt) => toggleAnswer(currentShortQ.id, opt)}
              anonymousLine={t("WellnessFlow.anonymousLine")}
            />
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (shortIndex < SHORT_FOLLOWUP_QUESTIONS.length - 1) {
                    setShortIndex((i) => i + 1);
                  } else {
                    finishShortFlow();
                  }
                }}
                className="min-h-12 flex-1 rounded-[1.25rem] bg-[var(--kiosk-button-2)] px-6 font-semibold text-white"
              >
                {t("WellnessFlow.skip")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (shortIndex < SHORT_FOLLOWUP_QUESTIONS.length - 1) {
                    setShortIndex((i) => i + 1);
                  } else {
                    finishShortFlow();
                  }
                }}
                className="min-h-12 flex-1 rounded-[1.25rem] bg-[var(--kiosk-button)] px-6 font-semibold text-white"
              >
                {shortIndex < SHORT_FOLLOWUP_QUESTIONS.length - 1
                  ? t("WellnessFlow.next")
                  : t("WellnessFlow.finish")}
              </button>
            </div>
          </div>
        )}

        {phase === "long" && (
          <div className="mx-auto w-full max-w-lg flex-1 pb-6">
            <h1 className="text-2xl font-bold">
              {t("WellnessFlow.aFewMoreQuestions")}
            </h1>
            <p className="mt-2 text-base opacity-90">
              {t("WellnessFlow.longFormSubtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-12 rounded-[1.25rem] border border-[var(--kiosk-ink)]/10 bg-white/40 p-6 shadow-inner">
              {LONG_FOLLOWUP_QUESTIONS.map((q) => (
                <MultiselectQuestion
                  key={q.id}
                  question={q}
                  selected={answers[q.id] ?? []}
                  onToggle={(opt) => toggleAnswer(q.id, opt)}
                  optionalLabel={t("WellnessFlow.optionalSelectAny")}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={finishLongFlow}
              className="mt-8 w-full min-h-14 rounded-[1.25rem] bg-[var(--kiosk-button)] text-lg font-semibold text-white shadow-md"
            >
              {t("WellnessFlow.submitResponses")}
            </button>
          </div>
        )}

        {phase === "thanks" && (
          <div
            className={`mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 text-center transition-opacity ease-out ${
              thanksFadeOut ? "opacity-0" : "opacity-100"
            }`}
            style={{ transitionDuration: `${THANKS_FADE_MS}ms` }}
            onTransitionEnd={onThanksOpacityTransitionEnd}
          >
            <h1 className="text-2xl font-bold">{t("WellnessFlow.thanks")}</h1>
            <p className="mt-4 text-lg opacity-90">
              {t("WellnessFlow.responseRecorded")}
            </p>
          </div>
        )}

      </main>

      <footer className="shrink-0 border-t border-[var(--kiosk-ink)]/10 bg-[var(--kiosk-bg)]/95 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-5">
        <nav className="flex flex-wrap items-center justify-center">
          <LanguageSwitcher current={locale} />
        </nav>
      </footer>
    </div>
  );
}
