import { Text, Link, Hr, Section, Row, Column } from "@react-email/components";
import EmailLayout, { C } from "./components/EmailLayout";
import { SITE_CONFIG } from "@/lib/constants";
import type { Locale } from "./i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventItem {
  title: string;
  date: string; // formatted, e.g. "Dinsdag 8 april"
  time: string; // e.g. "17:00"
  location: string;
}

interface LeaderboardEntry {
  position: number;
  name: string;
  xp: number;
}

export interface WeeklyDigestEmailProps {
  voornaam: string;
  events: EventItem[];
  leaderboard: LeaderboardEntry[];
  newMemberCount: number;
  funFact?: string;
  locale?: Locale;
}

// ---------------------------------------------------------------------------
// Copy (events, leaderboard and funFact are caller-supplied and stay as-is)
// ---------------------------------------------------------------------------

const copy = {
  nl: {
    preview: (count: number, hasEvents: boolean) =>
      `Weekoverzicht SIT${hasEvents ? ` - ${count} event${count === 1 ? "" : "s"} deze week` : ""}`,
    greeting: (name: string) => `Hoi ${name},`,
    tag: "// weekoverzicht",
    upcomingEvents: "Aankomende events",
    at: "om",
    noEvents: "Geen events deze week. Stay tuned!",
    leaderboardTitle: "Top 5 leaderboard",
    noLeaderboard: "Nog geen leaderboard data.",
    xpLocale: "nl-NL",
    newMembers: "Nieuwe leden deze week",
    didYouKnow: "Wist je dat?",
    cta: "Ga naar dashboard",
    signOff: "Tot volgende week,",
  },
  en: {
    preview: (count: number, hasEvents: boolean) =>
      `SIT weekly digest${hasEvents ? ` - ${count} event${count === 1 ? "" : "s"} this week` : ""}`,
    greeting: (name: string) => `Hi ${name},`,
    tag: "// weekly digest",
    upcomingEvents: "Upcoming events",
    at: "at",
    noEvents: "No events this week. Stay tuned!",
    leaderboardTitle: "Top 5 leaderboard",
    noLeaderboard: "No leaderboard data yet.",
    xpLocale: "en-US",
    newMembers: "New members this week",
    didYouKnow: "Did you know?",
    cta: "Go to dashboard",
    signOff: "See you next week,",
  },
} as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WeeklyDigestEmail({
  voornaam,
  events,
  leaderboard,
  newMemberCount,
  funFact,
  locale = "nl",
}: WeeklyDigestEmailProps) {
  const t = copy[locale];
  const hasEvents = events.length > 0;
  const hasLeaderboard = leaderboard.length > 0;

  return (
    <EmailLayout previewText={t.preview(events.length, hasEvents)} locale={locale}>
      {/* Greeting */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "15px",
          fontWeight: "600",
          color: C.text,
          margin: "0 0 6px 0",
          lineHeight: "1.5",
        }}
      >
        {t.greeting(voornaam)}
      </Text>

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "12px",
          color: C.muted,
          margin: "0 0 24px 0",
          lineHeight: "1.6",
          letterSpacing: "0.04em",
        }}
      >
        {t.tag}
      </Text>

      {/* ── Upcoming events ─────────────────────────────────────── */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          fontWeight: "700",
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: "0 0 12px 0",
        }}
      >
        {t.upcomingEvents}
      </Text>

      {hasEvents ? (
        events.map((event, i) => (
          <Section
            key={i}
            style={{
              backgroundColor: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              padding: "14px 16px",
              marginBottom: "8px",
            }}
          >
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "14px",
                fontWeight: "700",
                color: C.text,
                margin: "0 0 6px 0",
                lineHeight: "1.4",
              }}
            >
              {event.title}
            </Text>
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "12px",
                color: C.muted,
                margin: "0",
                lineHeight: "1.6",
              }}
            >
              <span style={{ color: C.gold }}>{event.date}</span>
              {" "}
              <span style={{ color: C.muted }}>{t.at} {event.time}</span>
              {event.location ? (
                <>
                  {" "}
                  <span style={{ color: C.muted }}>- {event.location}</span>
                </>
              ) : null}
            </Text>
          </Section>
        ))
      ) : (
        <Text
          style={{
            fontFamily: C.mono,
            fontSize: "13px",
            color: C.muted,
            margin: "0 0 8px 0",
            lineHeight: "1.6",
          }}
        >
          {t.noEvents}
        </Text>
      )}

      {/* ── Leaderboard ─────────────────────────────────────────── */}
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${C.border}`,
          margin: "20px 0",
        }}
      />

      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          fontWeight: "700",
          color: C.blue,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: "0 0 12px 0",
        }}
      >
        {t.leaderboardTitle}
      </Text>

      {hasLeaderboard ? (
        <table
          cellPadding={0}
          cellSpacing={0}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "4px",
          }}
        >
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr key={i}>
                <td
                  style={{
                    fontFamily: C.mono,
                    fontSize: "12px",
                    color: i === 0 ? C.gold : C.muted,
                    padding: "6px 0",
                    width: "28px",
                    fontWeight: i === 0 ? "700" : "400",
                  }}
                >
                  {entry.position}.
                </td>
                <td
                  style={{
                    fontFamily: C.mono,
                    fontSize: "12px",
                    color: C.text,
                    padding: "6px 0",
                    fontWeight: i === 0 ? "700" : "400",
                  }}
                >
                  {entry.name}
                </td>
                <td
                  style={{
                    fontFamily: C.mono,
                    fontSize: "12px",
                    color: C.gold,
                    padding: "6px 0",
                    textAlign: "right",
                    fontWeight: "600",
                  }}
                >
                  {entry.xp.toLocaleString(t.xpLocale)} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Text
          style={{
            fontFamily: C.mono,
            fontSize: "13px",
            color: C.muted,
            margin: "0 0 4px 0",
            lineHeight: "1.6",
          }}
        >
          {t.noLeaderboard}
        </Text>
      )}

      {/* ── New members ─────────────────────────────────────────── */}
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${C.border}`,
          margin: "20px 0",
        }}
      />

      <Section
        style={{
          backgroundColor: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          padding: "14px 16px",
          marginBottom: "4px",
        }}
      >
        <Row>
          <Column style={{ verticalAlign: "middle" }}>
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "12px",
                color: C.muted,
                margin: "0",
                lineHeight: "1.4",
              }}
            >
              {t.newMembers}
            </Text>
          </Column>
          <Column style={{ textAlign: "right", verticalAlign: "middle" }}>
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "20px",
                fontWeight: "700",
                color: newMemberCount > 0 ? C.green : C.muted,
                margin: "0",
                lineHeight: "1",
              }}
            >
              +{newMemberCount}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* ── Fun fact ──────────────────────────────────────────────── */}
      {funFact ? (
        <>
          <Hr
            style={{
              border: "none",
              borderTop: `1px solid ${C.border}`,
              margin: "20px 0",
            }}
          />
          <Text
            style={{
              fontFamily: C.mono,
              fontSize: "11px",
              fontWeight: "700",
              color: C.green,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: "0 0 8px 0",
            }}
          >
            {t.didYouKnow}
          </Text>
          <Text
            style={{
              fontFamily: C.mono,
              fontSize: "12px",
              color: C.muted,
              margin: "0",
              lineHeight: "1.6",
              fontStyle: "italic",
            }}
          >
            {funFact}
          </Text>
        </>
      ) : null}

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${C.border}`,
          margin: "20px 0",
        }}
      />

      <table
        cellPadding={0}
        cellSpacing={0}
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>
              <Link
                href="https://svsit.nl/dashboard"
                style={{
                  display: "inline-block",
                  fontFamily: C.mono,
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#09090B",
                  backgroundColor: C.gold,
                  padding: "12px 28px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                {t.cta}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Signature ───────────────────────────────────────────── */}
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${C.border}`,
          margin: "28px 0 24px 0",
        }}
      />

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
          margin: "0 0 12px 0",
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
      </Text>

      {/* ── Socials ───────────────────────────────────────────── */}
      <Text
        style={{
          fontFamily: C.mono,
          fontSize: "11px",
          color: C.muted,
          margin: "0",
          lineHeight: "1.8",
        }}
      >
        <Link href={SITE_CONFIG.socials.instagram.url} style={{ color: C.muted, textDecoration: "none" }}>Instagram</Link>
        {" · "}
        <Link href={SITE_CONFIG.socials.discord.url} style={{ color: C.muted, textDecoration: "none" }}>Discord</Link>
        {" · "}
        <Link href={SITE_CONFIG.socials.linkedin.url} style={{ color: C.muted, textDecoration: "none" }}>LinkedIn</Link>
        {" · "}
        <Link href={SITE_CONFIG.socials.whatsapp.url} style={{ color: C.muted, textDecoration: "none" }}>WhatsApp</Link>
        {" · "}
        <Link href={SITE_CONFIG.socials.tiktok.url} style={{ color: C.muted, textDecoration: "none" }}>TikTok</Link>
      </Text>
    </EmailLayout>
  );
}

// ---------------------------------------------------------------------------
// Preview export (React Email dev server)
// ---------------------------------------------------------------------------

export function WeeklyDigestEmailPreview() {
  return (
    <WeeklyDigestEmail
      voornaam="Matin"
      events={[
        {
          title: "Tech Talk: AI in 2026",
          date: "Dinsdag 8 april",
          time: "17:00",
          location: "WBH 04A20",
        },
        {
          title: "Borrel",
          date: "Donderdag 10 april",
          time: "16:30",
          location: "Cafe De Balie",
        },
      ]}
      leaderboard={[
        { position: 1, name: "matin.khajehfard", xp: 2450 },
        { position: 2, name: "jan.devries", xp: 1820 },
        { position: 3, name: "sara.bakker", xp: 1650 },
        { position: 4, name: "lucas.jansen", xp: 1200 },
        { position: 5, name: "emma.smit", xp: 980 },
      ]}
      newMemberCount={7}
      funFact="JavaScript is in 10 dagen geschreven door Brendan Eich in 1995."
    />
  );
}
