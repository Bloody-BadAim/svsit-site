import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "{SIT} — Studievereniging ICT | Hogeschool van Amsterdam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle gold gradient glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top comment line */}
        <div
          style={{
            color: "#22C55E",
            fontSize: 20,
            marginBottom: 40,
            opacity: 0.7,
            display: "flex",
          }}
        >
          // studievereniging HBO-ICT — Hogeschool van Amsterdam
        </div>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#F59E0B" }}>{"{"}</span>
          <span style={{ color: "#FAFAFA" }}>SIT</span>
          <span style={{ color: "#F59E0B" }}>{"}"}</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#A1A1AA",
            fontSize: 28,
            marginTop: 32,
            display: "flex",
          }}
        >
          Door studenten. Voor studenten.
          <span style={{ color: "#F59E0B", marginLeft: 8 }}>In tech.</span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(to right, #F59E0B, #3B82F6, #EF4444, #22C55E)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
