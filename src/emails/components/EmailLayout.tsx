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
  Hr,
} from "@react-email/components";

// ---------------------------------------------------------------------------
// Design tokens (inline — required by email clients)
// ---------------------------------------------------------------------------

export const C = {
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
} as const;

// ---------------------------------------------------------------------------
// SIT Logo block
// ---------------------------------------------------------------------------

export function SitLogo() {
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

            {/* x x x colour marks */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: "11px",
                letterSpacing: "0.25em",
                margin: "0",
                lineHeight: "1",
              }}
            >
              <span style={{ color: C.red }}>x</span>
              {" "}
              <span style={{ color: C.gold }}>x</span>
              {" "}
              <span style={{ color: C.green }}>x</span>
            </Text>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Shared email layout wrapper
// ---------------------------------------------------------------------------

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export default function EmailLayout({ children, previewText }: EmailLayoutProps) {
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

          {/* Main card */}
          <Section
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: "none",
              padding: "36px 40px 32px 40px",
            }}
          >
            {/* Logo */}
            <SitLogo />

            {/* Divider */}
            <Hr
              style={{
                border: "none",
                borderTop: `1px solid ${C.border}`,
                margin: "20px 0 24px 0",
              }}
            />

            {/* Content slot */}
            {children}
          </Section>

          {/* Footer strip */}
          <Section
            style={{
              backgroundColor: "#0D0D0F",
              padding: "16px 32px",
            }}
          >
            <Row>
              <Column style={{ width: "50%", verticalAlign: "middle" }}>
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
                </Text>
              </Column>
              <Column
                style={{
                  width: "50%",
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
                  Bestuur XI
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Bottom accent bar (reversed) */}
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

          {/* Legal footer */}
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
              Dit is een automatisch bericht van SIT — Studievereniging ICT HvA.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
