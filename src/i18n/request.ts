import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getAppMessages } from "./messages";

/**
 * Bepaalt de actieve taal per request uit de NEXT_LOCALE-cookie.
 * Geen locale in de URL, dus dit is de enige bron van waarheid.
 */
export async function resolveLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: getAppMessages(locale) as Record<string, unknown>,
  };
});
