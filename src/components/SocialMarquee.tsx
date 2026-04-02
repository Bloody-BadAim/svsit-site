"use client";

const marqueeItems = [
  // { text: "@svsit", accent: "var(--color-accent-gold)", type: "handle" },
  { text: "×", accent: "var(--color-accent-red)", type: "separator" },
  { text: "VOLG ONS OP INSTAGRAM", accent: "var(--color-text-muted)", type: "cta" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "BORRELS", accent: "var(--color-accent-blue)", type: "tag" },
  { text: "×", accent: "var(--color-accent-gold)", type: "separator" },
  { text: "HACKATHONS", accent: "var(--color-accent-red)", type: "tag" },
  { text: "×", accent: "var(--color-accent-blue)", type: "separator" },
  // { text: "@svsit", accent: "var(--color-accent-gold)", type: "handle" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "GAME NIGHTS", accent: "var(--color-accent-green)", type: "tag" },
  { text: "×", accent: "var(--color-accent-red)", type: "separator" },
  { text: "TECH TALKS", accent: "var(--color-accent-blue)", type: "tag" },
  { text: "×", accent: "var(--color-accent-gold)", type: "separator" },
  { text: "KROEGENTOCHTEN", accent: "var(--color-accent-red)", type: "tag" },
  { text: "×", accent: "var(--color-accent-green)", type: "separator" },
  { text: "CTF CHALLENGES", accent: "var(--color-accent-green)", type: "tag" },
  { text: "×", accent: "var(--color-accent-blue)", type: "separator" },
];

function MarqueeContent({ groupIndex }: { groupIndex: number }) {
  return (
    <div className="flex items-center gap-10 md:gap-14 shrink-0 px-6">
      {marqueeItems.map((item, i) => {
        const key = `${groupIndex}-${i}`;

        if (item.type === "separator") {
          return (
            <span
              key={key}
              className="text-lg font-bold opacity-50"
              style={{ color: item.accent }}
            >
              {item.text}
            </span>
          );
        }

        if (item.type === "handle") {
          return (
            <a
              key={key}
              href="https://www.instagram.com/sv.sit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-2xl md:text-4xl font-bold tracking-tight hover:scale-110 transition-transform duration-200"
              style={{ color: item.accent }}
            >
              {item.text}
            </a>
          );
        }

        if (item.type === "cta") {
          return (
            <a
              key={key}
              href="https://www.instagram.com/sv.sit"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm md:text-base tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity duration-200"
              style={{ color: item.accent }}
            >
              {item.text}
            </a>
          );
        }

        return (
          <span
            key={key}
            className="font-mono text-sm md:text-lg tracking-[0.15em] font-bold opacity-25"
            style={{ color: item.accent }}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
}

function Track({ direction }: { direction: "left" | "right" }) {
  const style: React.CSSProperties =
    direction === "left"
      ? { animation: "tickerScroll 60s linear infinite" }
      : { animation: "tickerScrollReverse 55s linear infinite", transform: "translateX(-50%)" };

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="flex shrink-0" style={style}>
        {Array.from({ length: 4 }, (_, i) => (
          <MarqueeContent key={i} groupIndex={i} />
        ))}
      </div>
    </div>
  );
}

export default function SocialMarquee() {
  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}
      aria-hidden="true"
    >
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: "clamp(3rem, 15vw, 12rem)",
          background: "linear-gradient(to right, var(--color-bg), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: "clamp(3rem, 15vw, 12rem)",
          background: "linear-gradient(to left, var(--color-bg), transparent)",
        }}
      />

      {/* Accent lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-accent-gold), var(--color-accent-blue), transparent)",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-accent-blue), var(--color-accent-gold), transparent)",
          opacity: 0.2,
        }}
      />

      {/* Tracks */}
      <div className="flex flex-col" style={{ gap: "1.5rem" }}>
        <Track direction="left" />
        <Track direction="right" />
      </div>
    </div>
  );
}
