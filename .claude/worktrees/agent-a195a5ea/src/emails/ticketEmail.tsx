import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Img,
  Hr,
} from "@react-email/components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TicketEmailProps {
  eventTitle: string;
  eventDate: string; // e.g. "27 MAART 2026"
  eventTime: string; // e.g. "17:00 — 21:00"
  eventLocation: string;
  buyerName: string;
  buyerEmail: string;
  isMember: boolean;
  ticketNumber: string; // e.g. "#SIT-2026-0001"
  price: string; // "€10" or "GRATIS"
  qrCodeDataUrl: string; // base64 data URL
}

// ---------------------------------------------------------------------------
// Design tokens (inline — required by email clients)
// ---------------------------------------------------------------------------

const C = {
  bg: "#09090B",
  surface: "#111113",
  surfaceAlt: "#18181B",
  border: "rgba(255,255,255,0.08)",
  text: "#FAFAFA",
  muted: "#6B7280",
  gold: "#F29E18",
  green: "#22C55E",
  blue: "#3B82F6",
  red: "#EF4444",
  mono: "'JetBrains Mono','Fira Code','SF Mono','Courier New',monospace",
  heading:
    "'Big Shoulders Display','Impact','Arial Black',sans-serif",
} as const;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SitLogo() {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td>
            {/* {SIT} wordmark */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "28px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                color: C.text,
                margin: "0 0 4px 0",
                lineHeight: "1",
              }}
            >
              <span style={{ color: C.gold }}>{`{`}</span>
              SIT
              <span style={{ color: C.gold }}>{`}`}</span>
            </Text>

            {/* × × × colour marks */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "11px",
                letterSpacing: "0.25em",
                margin: "0",
                lineHeight: "1",
              }}
            >
              <span style={{ color: C.red }}>×</span>
              {" "}
              <span style={{ color: C.gold }}>×</span>
              {" "}
              <span style={{ color: C.green }}>×</span>
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function TerminalDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: color,
        marginRight: "5px",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TicketEmail({
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  buyerName,
  buyerEmail,
  isMember,
  ticketNumber,
  price,
  qrCodeDataUrl,
}: TicketEmailProps) {
  const previewText = `Jouw ticket voor ${eventTitle} — ${eventDate}`;

  return (
    <Html lang="nl">
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: C.bg,
          fontFamily: C.mono,
          margin: "0",
          padding: "0",
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Outer wrapper — centres content */}
        {/* ---------------------------------------------------------------- */}
        <Container
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "0",
            backgroundColor: C.bg,
          }}
        >
          {/* Top accent bar */}
          <Section style={{ padding: "0", margin: "0" }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td style={{ height: "4px", backgroundColor: C.red, width: "25%" }} />
                  <td style={{ height: "4px", backgroundColor: C.gold, width: "25%" }} />
                  <td style={{ height: "4px", backgroundColor: C.green, width: "25%" }} />
                  <td style={{ height: "4px", backgroundColor: C.blue, width: "25%" }} />
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ---------------------------------------------------------------- */}
          {/* Main card */}
          {/* ---------------------------------------------------------------- */}
          <Section
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: "none",
              overflow: "hidden",
            }}
          >
            {/* Two-column ticket layout */}
            <Row style={{ margin: "0" }}>
              {/* ============================================================
                  LEFT COLUMN — event info
                  ============================================================ */}
              <Column
                style={{
                  width: "55%",
                  padding: "36px 28px 36px 32px",
                  verticalAlign: "top",
                  borderRight: `1px dashed ${C.border}`,
                  position: "relative",
                }}
              >
                {/* Logo */}
                <SitLogo />

                {/* Divider */}
                <Hr
                  style={{
                    border: "none",
                    borderTop: `1px solid ${C.border}`,
                    margin: "20px 0 16px 0",
                  }}
                />

                {/* // event ticket */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "11px",
                    color: C.muted,
                    margin: "0 0 14px 0",
                    letterSpacing: "0.06em",
                  }}
                >
                  // event ticket
                </Text>

                {/* Event title — BIG */}
                <Text
                  style={{
                    fontFamily: C.heading,
                    fontSize: "32px",
                    fontWeight: "900",
                    color: C.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    lineHeight: "1.05",
                    margin: "0 0 20px 0",
                  }}
                >
                  {eventTitle}
                </Text>

                {/* Date */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "13px",
                    fontWeight: "700",
                    color: C.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 6px 0",
                  }}
                >
                  {eventDate}
                </Text>

                {/* Time */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "13px",
                    color: C.gold,
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    margin: "0 0 6px 0",
                  }}
                >
                  {eventTime}
                </Text>

                {/* Location */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "12px",
                    color: C.muted,
                    letterSpacing: "0.04em",
                    margin: "0",
                  }}
                >
                  {eventLocation}
                </Text>

                {/* Spacer */}
                <div style={{ height: "40px" }} />

                {/* ticket = lidmaatschap */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.18)",
                    letterSpacing: "0.06em",
                    margin: "0",
                  }}
                >
                  ticket = lidmaatschap
                </Text>
              </Column>

              {/* ============================================================
                  RIGHT COLUMN — code block, QR, ticket nr, price
                  ============================================================ */}
              <Column
                style={{
                  width: "45%",
                  padding: "36px 28px 36px 24px",
                  verticalAlign: "top",
                  backgroundColor: C.surfaceAlt,
                }}
              >
                {/* Terminal window — code block */}
                <table
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: "#0D0D0F",
                    border: `1px solid rgba(255,255,255,0.1)`,
                    borderRadius: "6px",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <tbody>
                    {/* Traffic lights header */}
                    <tr>
                      <td
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <TerminalDot color={C.red} />
                        <TerminalDot color={C.gold} />
                        <TerminalDot color={C.green} />
                      </td>
                    </tr>

                    {/* Code body */}
                    <tr>
                      <td style={{ padding: "14px 16px" }}>
                        <Text
                          style={{
                            fontFamily: C.mono,
                            fontSize: "11px",
                            lineHeight: "1.8",
                            margin: "0",
                            color: C.text,
                            whiteSpace: "pre" as const,
                          }}
                        >
                          {/* Line 1 */}
                          <span style={{ color: C.blue }}>const </span>
                          <span style={{ color: C.text }}>ticket</span>
                          <span style={{ color: C.muted }}> = </span>
                          <span style={{ color: C.text }}>{"{"}</span>
                          {"\n"}

                          {/* naam */}
                          <span style={{ color: C.text }}>{"  naam"}</span>
                          <span style={{ color: C.muted }}>: </span>
                          <span style={{ color: C.gold }}>{`"${buyerName}"`}</span>
                          <span style={{ color: C.muted }}>,</span>
                          {"\n"}

                          {/* email */}
                          <span style={{ color: C.text }}>{"  email"}</span>
                          <span style={{ color: C.muted }}>: </span>
                          <span style={{ color: C.gold }}>{`"${buyerEmail}"`}</span>
                          <span style={{ color: C.muted }}>,</span>
                          {"\n"}

                          {/* lid */}
                          <span style={{ color: C.text }}>{"  lid"}</span>
                          <span style={{ color: C.muted }}>: </span>
                          <span style={{ color: C.blue }}>
                            {isMember ? "true" : "false"}
                          </span>
                          <span style={{ color: C.muted }}>,</span>
                          {"\n"}

                          {/* type */}
                          <span style={{ color: C.text }}>{"  type"}</span>
                          <span style={{ color: C.muted }}>: </span>
                          <span style={{ color: C.green }}>&quot;student&quot;</span>
                          <span style={{ color: C.muted }}>,</span>
                          {"\n"}

                          {/* closing */}
                          <span style={{ color: C.text }}>{"}"}</span>
                          <span style={{ color: C.muted }}>;</span>
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* QR code */}
                <table
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "16px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "4px",
                        }}
                      >
                        <Img
                          src={qrCodeDataUrl}
                          alt={`QR code voor ticket ${ticketNumber}`}
                          width="140"
                          height="140"
                          style={{
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Ticket number */}
                <Text
                  style={{
                    fontFamily: C.mono,
                    fontSize: "12px",
                    color: C.gold,
                    letterSpacing: "0.12em",
                    textAlign: "center",
                    margin: "0 0 10px 0",
                    fontWeight: "600",
                  }}
                >
                  {ticketNumber}
                </Text>

                {/* Price */}
                <Text
                  style={{
                    fontFamily: C.heading,
                    fontSize: "36px",
                    fontWeight: "900",
                    color: price === "GRATIS" ? C.green : C.green,
                    textAlign: "center",
                    letterSpacing: "0.02em",
                    margin: "0",
                    lineHeight: "1",
                  }}
                >
                  {price}
                </Text>
              </Column>
            </Row>

            {/* ---------------------------------------------------------------- */}
            {/* Perforation / tear line between ticket and footer strip         */}
            {/* ---------------------------------------------------------------- */}
            <Section style={{ padding: "0", margin: "0" }}>
              <table
                cellPadding={0}
                cellSpacing={0}
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        borderTop: `2px dashed rgba(255,255,255,0.1)`,
                        padding: "0",
                      }}
                    />
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* ---------------------------------------------------------------- */}
            {/* Footer strip — instructions + association info                  */}
            {/* ---------------------------------------------------------------- */}
            <Section
              style={{
                backgroundColor: "#0D0D0F",
                padding: "16px 32px",
              }}
            >
              <Row>
                <Column style={{ width: "60%", verticalAlign: "middle" }}>
                  <Text
                    style={{
                      fontFamily: C.mono,
                      fontSize: "10px",
                      color: C.muted,
                      margin: "0",
                      letterSpacing: "0.04em",
                      lineHeight: "1.6",
                    }}
                  >
                    Toon dit ticket bij de ingang.
                    <br />
                    Geldig voor één persoon.
                  </Text>
                </Column>
                <Column
                  style={{
                    width: "40%",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: C.mono,
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.2)",
                      margin: "0",
                      letterSpacing: "0.04em",
                      lineHeight: "1.6",
                    }}
                  >
                    svsit.nl
                    <br />
                    Bestuur XI
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Bottom accent bar — reversed order */}
          <Section style={{ padding: "0", margin: "0" }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td style={{ height: "2px", backgroundColor: C.blue, width: "25%" }} />
                  <td style={{ height: "2px", backgroundColor: C.green, width: "25%" }} />
                  <td style={{ height: "2px", backgroundColor: C.gold, width: "25%" }} />
                  <td style={{ height: "2px", backgroundColor: C.red, width: "25%" }} />
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Legal / email footer */}
          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "10px",
                color: "rgba(255,255,255,0.18)",
                textAlign: "center",
                margin: "0",
                lineHeight: "1.7",
                letterSpacing: "0.03em",
              }}
            >
              Dit is een automatisch gegenereerd ticket van SIT — Studievereniging ICT HvA.
              <br />
              Bewaar dit ticket. Vragen? Mail naar{" "}
              <span style={{ color: C.gold }}>bestuur@svsit.nl</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Preview export with dummy data (used by React Email dev server)
// ---------------------------------------------------------------------------

export function TicketEmailPreview() {
  return (
    <TicketEmail
      eventTitle="Get Together"
      eventDate="27 MAART 2026"
      eventTime="17:00 — 21:00"
      eventLocation="Keizersgracht 424, Amsterdam"
      buyerName="Matin Khajehfard"
      buyerEmail="matin@svsit.nl"
      isMember={true}
      ticketNumber="#SIT-2026-0001"
      price="GRATIS"
      qrCodeDataUrl="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=SIT-2026-0001&bgcolor=ffffff"
    />
  );
}
