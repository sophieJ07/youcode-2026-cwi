export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '普通话' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'ja', label: '日本語' },
  ] as const;
  
  export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);
  export type Locale = typeof LANGUAGES[number]['code'];