// ---------------------------------------------------------------------------
// Shared i18n for transactional emails.
//
// These React Email components are rendered SERVER-SIDE (via @react-email/render
// inside SMTP send code), NOT in the Next.js request/render tree. next-intl's
// useTranslations/getTranslations rely on request context that is not available
// here, so they are unreliable. Instead each email takes an optional
// `locale?: Locale` prop (default "nl") and reads its copy from a plain object.
// ---------------------------------------------------------------------------

export type Locale = "nl" | "en";

// Strings shared by the EmailLayout wrapper (footer).
export const layoutCopy: Record<Locale, { boardLabel: string; autoNotice: string }> = {
  nl: {
    boardLabel: "Bestuur XII",
    autoNotice: "Dit is een automatisch bericht van SIT - Studievereniging ICT HvA.",
  },
  en: {
    boardLabel: "Board XII",
    autoNotice: "This is an automated message from SIT - ICT Student Association HvA.",
  },
};
