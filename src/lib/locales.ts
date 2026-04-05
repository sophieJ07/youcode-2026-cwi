export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "zh", label: "普通话" },
  { code: "tl", label: "Tagalog" },
  { code: "yue", label: "廣州話" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "hi", label: "हिंदी" },
  { code: "vi", label: "tiếng việt" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "ko", label: "한국인" },
  { code: "so", label: "Soomaali" },
  { code: "ja", label: "日本語" },
] as const;

export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);
export type Locale = (typeof LANGUAGES)[number]["code"];
