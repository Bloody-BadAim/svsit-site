"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  locales,
  localeNames,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "@/i18n/config";

/**
 * Taalknop NL / EN. Zet de NEXT_LOCALE-cookie en refresht de route zodat de
 * server-componenten opnieuw renderen in de gekozen taal. Geen URL-wissel.
 *
 * Stijl sluit aan op de terminal-look van de navbar (mono, segmented toggle).
 */
export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const active = useLocale() as Locale;
  const t = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === active) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`inline-flex items-center font-mono text-xs border border-[var(--color-border)] overflow-hidden ${className}`}
      data-pending={isPending ? "" : undefined}
    >
      {locales.map((loc, i) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-pressed={isActive}
            aria-label={loc === "en" ? t("switchToEnglish") : t("switchToDutch")}
            className={`px-2.5 py-1 transition-colors duration-200 cursor-pointer ${
              i > 0 ? "border-l border-[var(--color-border)]" : ""
            } ${
              isActive
                ? "bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-bold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {localeNames[loc]}
          </button>
        );
      })}
    </div>
  );
}
