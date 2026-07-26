export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers an explicit language choice across visits. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/** Label shown in the language switcher, written in the language itself. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/** Language name the model is told to write in. */
export const localeOutputLanguage: Record<Locale, string> = {
  en: "English",
  ar: "Arabic (العربية), using Modern Standard Arabic",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return localeDirections[locale];
}

/**
 * Picks the best supported locale from an `Accept-Language` header,
 * falling back to `defaultLocale`.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) || 0 : 1 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}
