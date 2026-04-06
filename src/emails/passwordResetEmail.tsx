import { Text, Link } from "@react-email/components";
import EmailLayout, { C } from "./components/EmailLayout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PasswordResetEmail({
  firstName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout previewText="Stel je wachtwoord in voor SIT">
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
        // wachtwoord instellen
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
        Hoi {firstName},
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
        We hebben de SIT website vernieuwd. Klik hieronder om je wachtwoord in
        te stellen en toegang te krijgen tot je account, events en je member
        card.
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
                WACHTWOORD INSTELLEN
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
        Deze link is 7 dagen geldig.
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
