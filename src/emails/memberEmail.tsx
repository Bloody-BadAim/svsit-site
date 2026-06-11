import { Text, Link, Hr } from "@react-email/components";
import EmailLayout, { C } from "./components/EmailLayout";
import { SITE_CONFIG } from "@/lib/constants";
import type { Locale } from "./i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MemberEmailProps {
  voornaam: string;
  subject: string;
  body: string; // plain text, newlines -> paragraphs
  locale?: Locale;
}

// ---------------------------------------------------------------------------
// Copy (the subject + body are supplied by the caller and stay as-is)
// ---------------------------------------------------------------------------

const copy = {
  nl: {
    greeting: (name: string) => `Hoi ${name},`,
    signOff: "Met vriendelijke groet,",
    association: "Studievereniging ICT",
    instagramLabel: "Instagram:",
  },
  en: {
    greeting: (name: string) => `Hi ${name},`,
    signOff: "Kind regards,",
    association: "ICT Student Association",
    instagramLabel: "Instagram:",
  },
} as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MemberEmail({
  voornaam,
  subject,
  body,
  locale = "nl",
}: MemberEmailProps) {
  const t = copy[locale];
  // Split body on newlines -> array of non-empty paragraph strings
  const paragraphs = body
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <EmailLayout previewText={subject} locale={locale}>
      {/* Greeting */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "15px",
          fontWeight: "600",
          color: C.text,
          margin: "0 0 20px 0",
          lineHeight: "1.5",
        }}
      >
        {t.greeting(voornaam)}
      </Text>

      {/* Body paragraphs */}
      {paragraphs.map((para, i) => (
        <Text
          key={i}
          style={{
            fontFamily: C.mono,
            fontSize: "13px",
            color: C.text,
            lineHeight: "1.8",
            margin: "0 0 16px 0",
          }}
        >
          {para}
        </Text>
      ))}

      {/* Divider */}
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${C.border}`,
          margin: "28px 0 24px 0",
        }}
      />

      {/* Signature */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "12px",
          color: C.muted,
          margin: "0 0 4px 0",
          lineHeight: "1.4",
        }}
      >
        {t.signOff}
      </Text>

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "13px",
          fontWeight: "600",
          color: C.text,
          margin: "0 0 2px 0",
          lineHeight: "1.4",
        }}
      >
        Bestuur XII -{" "}
        <span style={{ color: C.gold }}>{`{`}</span>
        SIT
        <span style={{ color: C.gold }}>{`}`}</span>
      </Text>

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          color: C.muted,
          margin: "0 0 1px 0",
          lineHeight: "1.6",
        }}
      >
        {t.association}
      </Text>

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          color: C.muted,
          margin: "0 0 16px 0",
          lineHeight: "1.6",
        }}
      >
        Hogeschool van Amsterdam
      </Text>

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          color: C.muted,
          margin: "0",
          lineHeight: "1.8",
        }}
      >
        <Link
          href="https://svsit.nl"
          style={{ color: C.gold, textDecoration: "none" }}
        >
          svsit.nl
        </Link>
        {" | "}
        <Link
          href={`mailto:${SITE_CONFIG.email}`}
          style={{ color: C.gold, textDecoration: "none" }}
        >
          {SITE_CONFIG.email}
        </Link>
        <br />
        {t.instagramLabel}{" "}
        <Link
          href={SITE_CONFIG.socials.instagram.url}
          style={{ color: C.muted, textDecoration: "none" }}
        >
          {SITE_CONFIG.socials.instagram.handle}
        </Link>
      </Text>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// Preview export (React Email dev server)
// ---------------------------------------------------------------------------

export function MemberEmailPreview() {
  return (
    <MemberEmail
      voornaam="Matin"
      subject="Welkom bij SIT - het nieuwe jaar is begonnen!"
      body={`Dit jaar gaan we er vol tegenaan. Nieuwe events, nieuwe commissies, en een compleet vernieuwd ledenportaal wachten op je.\n\nCheck svsit.nl voor alle aankomende activiteiten en meld je aan via je dashboard.\n\nWe zien je snel!`}
    />
  );
}
