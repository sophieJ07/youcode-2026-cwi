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
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          disabled={isPending || current === code}
          onClick={() => startTransition(() => setLocaleCookie(code))}
          className="rounded-full border px-3 py-1 text-sm disabled:opacity-40"
        >
          {label}
        </button>
      ))}
    </div>
  );
}