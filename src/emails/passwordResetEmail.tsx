import { Text, Link } from "@react-email/components";
import EmailLayout, { C } from "./components/EmailLayout";
import type { Locale } from "./i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  locale?: Locale;
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const copy = {
  nl: {
    preview: "Stel je wachtwoord in voor SIT",
    tag: "// wachtwoord instellen",
    greeting: (name: string) => `Hoi ${name},`,
    explanation:
      "We hebben de SIT website vernieuwd. Klik hieronder om je wachtwoord in te stellen en toegang te krijgen tot je account, events en je member card.",
    button: "WACHTWOORD INSTELLEN",
    validity: "Deze link is 7 dagen geldig.",
  },
  en: {
    preview: "Set your password for SIT",
    tag: "// set password",
    greeting: (name: string) => `Hi ${name},`,
    explanation:
      "We have updated the SIT website. Click below to set your password and get access to your account, events and your member card.",
    button: "SET PASSWORD",
    validity: "This link is valid for 7 days.",
  },
} as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PasswordResetEmail({
  firstName,
  resetUrl,
  locale = "nl",
}: PasswordResetEmailProps) {
  const t = copy[locale];
  return (
    <EmailLayout previewText={t.preview} locale={locale}>
      {/* // wachtwoord instellen */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          color: C.muted,
          margin: "0 0 20px 0",
          letterSpacing: "0.06em",
        }}
      >
        {t.tag}
      </Text>

      {/* Greeting */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "15px",
          fontWeight: "600",
          color: C.text,
          margin: "0 0 16px 0",
          lineHeight: "1.5",
        }}
      >
        {t.greeting(firstName)}
      </Text>

      {/* Explanation */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "13px",
          color: C.text,
          lineHeight: "1.8",
          margin: "0 0 28px 0",
        }}
      >
        {t.explanation}
      </Text>

      {/* CTA button */}
      <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: C.gold,
                borderRadius: "4px",
              }}
            >
              <Link
                href={resetUrl}
                style={{
                  display: "inline-block",
                  padding: "14px 28px",
                  fontFamily: C.mono,
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: C.bg,
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                }}
              >
                {t.button}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Validity note */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "12px",
          color: C.muted,
          margin: "24px 0 0 0",
          lineHeight: "1.6",
        }}
      >
        {t.validity}
      </Text>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// Preview export (React Email dev server)
// ---------------------------------------------------------------------------

export function PasswordResetEmailPreview() {
  return (
    <PasswordResetEmail
      firstName="Matin"
      resetUrl="https://svsit.nl/wachtwoord-instellen?token=preview-token-123"
    />
  );
}
