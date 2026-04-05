'use client';

import { useTransition } from 'react';
import { setLocaleCookie } from '@/app/actions/set-locale';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
];

export function LanguageSwitcher({ current }: { current: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          disabled={isPending || current === code}
          onClick={() => startTransition(() => setLocaleCookie(code))}
          type="button"
          className="min-h-12 rounded-full border-2 border-[var(--kiosk-ink)]/20 bg-white px-5 py-2.5 text-base font-semibold text-[var(--kiosk-ink)] shadow-sm transition hover:border-[var(--kiosk-button)]/40 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:min-h-14 sm:px-7 sm:py-3 sm:text-lg"
        >
          {label}
        </button>
      ))}
    </div>
  );
}