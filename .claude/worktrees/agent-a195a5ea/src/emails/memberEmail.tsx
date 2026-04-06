import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MemberEmailProps {
  voornaam: string
  subject: string
  body: string // plain text, newlines → paragraphs
}

// ---------------------------------------------------------------------------
// Design tokens (inline — required by email clients)
// ---------------------------------------------------------------------------

const C = {
  bg: '#09090B',
  surface: '#111113',
  border: 'rgba(255,255,255,0.08)',
  text: '#FAFAFA',
  muted: '#6B7280',
  gold: '#F29E18',
  green: '#22C55E',
  blue: '#3B82F6',
  red: '#EF4444',
  mono: "'JetBrains Mono','Fira Code','SF Mono','Courier New',monospace",
} as const

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MemberEmail({ voornaam, subject, body }: MemberEmailProps) {
  // Split body on newlines → array of non-empty paragraph strings
  const paragraphs = body
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return (
    <Html lang="nl">
      <Head />
      <Preview>{subject}</Preview>
      <Body
        style={{
          backgroundColor: C.bg,
          fontFamily: C.mono,
          margin: '0',
          padding: '0',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0',
            backgroundColor: C.bg,
          }}
        >
          {/* ── Top accent bar ── */}
          <Section style={{ padding: '0', margin: '0' }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <tbody>
                <tr>
                  <td style={{ height: '4px', backgroundColor: C.red,  width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.gold, width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.green, width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.blue, width: '25%' }} />
                </tr>
              </tbody>
            </table>
          </Section>

          {/* ── Main card ── */}
          <Section
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: 'none',
              padding: '36px 40px 32px 40px',
            }}
          >
            {/* Logo */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '26px',
                fontWeight: '700',
                letterSpacing: '0.04em',
                color: C.text,
                margin: '0 0 2px 0',
                lineHeight: '1',
              }}
            >
              <span style={{ color: C.gold }}>{`{`}</span>
              SIT
              <span style={{ color: C.gold }}>{`}`}</span>
            </Text>

            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '11px',
                color: C.muted,
                margin: '0 0 0 0',
                letterSpacing: '0.05em',
                lineHeight: '1',
              }}
            >
              Studievereniging ICT
            </Text>

            {/* Divider */}
            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${C.border}`,
                margin: '24px 0 28px 0',
              }}
            />

            {/* Greeting */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '15px',
                fontWeight: '600',
                color: C.text,
                margin: '0 0 20px 0',
                lineHeight: '1.5',
              }}
            >
              Hoi {voornaam},
            </Text>

            {/* Body paragraphs */}
            {paragraphs.map((para, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: C.mono,
                  fontSize: '13px',
                  color: C.text,
                  lineHeight: '1.8',
                  margin: '0 0 16px 0',
                }}
              >
                {para}
              </Text>
            ))}

            {/* Divider */}
            <Hr
              style={{
                border: 'none',
                borderTop: `1px solid ${C.border}`,
                margin: '28px 0 24px 0',
              }}
            />

            {/* Signature */}
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '12px',
                color: C.muted,
                margin: '0 0 4px 0',
                lineHeight: '1.4',
              }}
            >
              Met vriendelijke groet,
            </Text>

            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '13px',
                fontWeight: '600',
                color: C.text,
                margin: '0 0 2px 0',
                lineHeight: '1.4',
              }}
            >
              Bestuur XI —{' '}
              <span style={{ color: C.gold }}>{`{`}</span>
              SIT
              <span style={{ color: C.gold }}>{`}`}</span>
            </Text>

            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '11px',
                color: C.muted,
                margin: '0 0 1px 0',
                lineHeight: '1.6',
              }}
            >
              Studievereniging ICT
            </Text>

            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '11px',
                color: C.muted,
                margin: '0 0 16px 0',
                lineHeight: '1.6',
              }}
            >
              Hogeschool van Amsterdam
            </Text>

            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '11px',
                color: C.muted,
                margin: '0',
                lineHeight: '1.8',
              }}
            >
              <Link
                href="https://svsit.nl"
                style={{ color: C.gold, textDecoration: 'none' }}
              >
                svsit.nl
              </Link>
              {' | '}
              <Link
                href="mailto:bestuur@svsit.nl"
                style={{ color: C.gold, textDecoration: 'none' }}
              >
                bestuur@svsit.nl
              </Link>
              <br />
              Instagram:{' '}
              <Link
                href="https://instagram.com/svsit"
                style={{ color: C.muted, textDecoration: 'none' }}
              >
                @svsit
              </Link>
            </Text>
          </Section>

          {/* ── Bottom accent bar (reversed) ── */}
          <Section style={{ padding: '0', margin: '0' }}>
            <table
              cellPadding={0}
              cellSpacing={0}
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <tbody>
                <tr>
                  <td style={{ height: '4px', backgroundColor: C.blue,  width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.green, width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.gold,  width: '25%' }} />
                  <td style={{ height: '4px', backgroundColor: C.red,   width: '25%' }} />
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Legal footer */}
          <Section style={{ padding: '16px 40px 24px 40px' }}>
            <Text
              style={{
                fontFamily: C.mono,
                fontSize: '10px',
                color: 'rgba(255,255,255,0.18)',
                textAlign: 'center',
                margin: '0',
                lineHeight: '1.7',
                letterSpacing: '0.03em',
              }}
            >
              Dit bericht is verstuurd door SIT — Studievereniging ICT HvA.
              <br />
              Vragen? Mail naar{' '}
              <span style={{ color: C.gold }}>bestuur@svsit.nl</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ---------------------------------------------------------------------------
// Preview export (React Email dev server)
// ---------------------------------------------------------------------------

export function MemberEmailPreview() {
  return (
    <MemberEmail
      voornaam="Matin"
      subject="Welkom bij SIT — het nieuwe jaar is begonnen!"
      body={`Dit jaar gaan we er vol tegenaan. Nieuwe events, nieuwe commissies, en een compleet vernieuwd ledenportaal wachten op je.\n\nCheck svsit.nl voor alle aankomende activiteiten en meld je aan via je dashboard.\n\nWe zien je snel!`}
    />
  )
}
