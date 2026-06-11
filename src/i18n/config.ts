/**
 * i18n config — cookie-based locale, geen locale in de URL.
 * De taalknop zet de cookie NEXT_LOCALE en refresht de route.
 */
export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "nl";

/** Cookie waarin de gekozen taal staat. 1 jaar geldig. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Labels voor de taalknop. */
export const localeNames: Record<Locale, string> = {
  nl: "NL",
  en: "EN",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "nl" || value === "en";
}
