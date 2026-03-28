"use client";

/**
 * HeroBackground — Epic animated background for the Hero section.
 *
 * Layers (back to front):
 *  D0 — Gradient mesh (atmospheric depth)
 *  D1 — Diagonal brand-color streaks with glow + breathing
 *  D2 — Atmospheric glow blobs (pulsing)
 *  D3 — Floating code fragments
 *  D4 — Radial vignette (blends into page)
 *
 * All CSS animations — transform/opacity only for 60fps.
 * No GSAP, no canvas, no particles, no dots.
 */

const STREAKS = [
  { color: "#3B82F6", left: 18, delay: 0, glowColor: "rgba(59,130,246,0.4)" },
  { color: "#22C55E", left: 38, delay: 2, glowColor: "rgba(34,197,94,0.3)" },
  { color: "#EF4444", left: 58, delay: 4, glowColor: "rgba(239,68,68,0.35)" },
  { color: "#F29E18", left: 78, delay: 1, glowColor: "rgba(242,158,24,0.4)" },
] as const;

const GLOW_BLOBS = [
  { color: "rgba(59,130,246,0.12)", size: 500, top: "15%", left: "20%", delay: 0, duration: 12 },
  { color: "rgba(242,158,24,0.10)", size: 600, top: "60%", left: "70%", delay: 3, duration: 15 },
  { color: "rgba(239,68,68,0.08)", size: 400, top: "70%", left: "15%", delay: 6, duration: 18 },
  { color: "rgba(34,197,94,0.07)", size: 350, top: "10%", left: "75%", delay: 9, duration: 14 },
] as const;

const CODE_FRAGMENTS = [
  { text: "// TODO: meer pizza bij events", top: "8%", left: "12%", delay: "0s", duration: "18s", color: "var(--color-accent-green)" },
  { text: "> nmap -sV svsit.nl", top: "14%", left: "65%", delay: "2s", duration: "22s", color: "var(--color-accent-red)" },
  { text: "player.score += 100; // GG", top: "22%", left: "38%", delay: "5s", duration: "20s", color: "var(--color-accent-blue)" },
  { text: "$ npm run borrel", top: "6%", left: "82%", delay: "8s", duration: "24s", color: "var(--color-text-muted)" },
  { text: "ai.generate('study_tips')", top: "18%", left: "5%", delay: "3s", duration: "19s", color: "var(--color-accent-gold)" },
  { text: "SELECT * FROM studenten WHERE motivation = 'high'", top: "12%", left: "48%", delay: "6s", duration: "21s", color: "var(--color-text-muted)" },
  { text: "ERR: cannot read property 'sleep' of student", top: "26%", left: "70%", delay: "10s", duration: "23s", color: "var(--color-accent-red)" },
] as const;

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>

      {/* D0 — Gradient mesh: atmospheric depth */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 25% 40%, rgba(59,130,246,0.06) 0%, transparent 70%)",
            "radial-gradient(ellipse 70% 50% at 75% 60%, rgba(242,158,24,0.05) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(34,197,94,0.04) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 50% at 85% 25%, rgba(239,68,68,0.03) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* D1 — Diagonal brand-color streaks with glow */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {STREAKS.map((streak, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${streak.left}%`,
              top: "-20%",
              width: "2px",
              height: "140%",
              background: `linear-gradient(180deg, transparent 0%, ${streak.color} 20%, ${streak.color} 80%, transparent 100%)`,
              boxShadow: `0 0 15px 3px ${streak.glowColor}, 0 0 40px 8px ${streak.glowColor}`,
              transform: "rotate(-20deg)",
              transformOrigin: "center center",
              opacity: 0,
              willChange: "opacity",
              animation: `heroStreakBreathe 8s ease-in-out ${streak.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* D2 — Atmospheric glow blobs */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {GLOW_BLOBS.map((blob, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: blob.top,
              left: blob.left,
              width: `${blob.size}px`,
              height: `${blob.size}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
              opacity: 0,
              willChange: "transform, opacity",
              animation: `heroGlowFloat ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* D3 — Floating code fragments */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        {CODE_FRAGMENTS.map((frag, i) => (
          <span
            key={i}
            className="absolute font-mono whitespace-nowrap"
            style={{
              top: frag.top,
              left: frag.left,
              color: frag.color,
              fontSize: "10px",
              opacity: 0,
              animation: `floatCode ${frag.duration} ease-in-out ${frag.delay} infinite`,
            }}
          >
            {frag.text}
          </span>
        ))}
      </div>

      {/* D4 — Radial vignette (blends hero into page) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 4,
          background: "radial-gradient(ellipse 70% 60% at center, transparent 0%, var(--color-bg) 100%)",
        }}
      />

      {/* Inline keyframes for hero background animations */}
      <style>{`
        @keyframes heroStreakBreathe {
          0%, 100% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.35;
          }
        }

        @keyframes heroGlowFloat {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(0);
          }
          15% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) translateY(-30px);
          }
          85% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .absolute[aria-hidden="true"] * {
            animation: none !important;
            opacity: 0.15 !important;
          }
        }
      `}</style>
    </div>
  );
}
