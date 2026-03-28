"use client";

const INSTAGRAM_URL = "https://instagram.com/svsit";

const BRAND_COLORS = {
  gold: "var(--color-accent-gold)",
  blue: "var(--color-accent-blue)",
  red: "var(--color-accent-red)",
  green: "var(--color-accent-green)",
} as const;

type BrandColor = keyof typeof BRAND_COLORS;

const SEPARATOR_COLORS: BrandColor[] = ["red", "green", "gold", "blue"];

interface TagItem {
  type: "tag";
  label: string;
  color: BrandColor;
}

interface HandleItem {
  type: "handle";
}

interface CtaItem {
  type: "cta";
}

type TickerItem = TagItem | HandleItem | CtaItem;

const TICKER_ITEMS: TickerItem[] = [
  { type: "handle" },
  { type: "cta" },
  { type: "tag", label: "BORRELS", color: "blue" },
  { type: "tag", label: "HACKATHONS", color: "red" },
  { type: "tag", label: "GAME NIGHTS", color: "green" },
  { type: "tag", label: "TECH TALKS", color: "blue" },
  { type: "tag", label: "KROEGENTOCHTEN", color: "red" },
  { type: "tag", label: "CTF CHALLENGES", color: "green" },
];

function Separator({ colorIndex }: { colorIndex: number }) {
  const color = SEPARATOR_COLORS[colorIndex % SEPARATOR_COLORS.length];

  return (
    <span
      className="font-bold text-lg select-none"
      style={{ opacity: 0.7, color: BRAND_COLORS[color] }}
    >
      &times;
    </span>
  );
}

function TickerContent({ groupIndex }: { groupIndex: number }) {
  const elements: React.ReactNode[] = [];
  let separatorIndex = groupIndex * TICKER_ITEMS.length;

  TICKER_ITEMS.forEach((item, i) => {
    if (i > 0) {
      elements.push(
        <Separator key={`sep-${groupIndex}-${i}`} colorIndex={separatorIndex++} />
      );
    }

    switch (item.type) {
      case "handle":
        elements.push(
          <a
            key={`item-${groupIndex}-${i}`}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-bold text-2xl md:text-4xl whitespace-nowrap hover:opacity-80 transition-opacity"
            style={{ color: BRAND_COLORS.gold }}
          >
            @svsit
          </a>
        );
        break;
      case "cta":
        elements.push(
          <a
            key={`item-${groupIndex}-${i}`}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm tracking-[0.3em] whitespace-nowrap hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            VOLG ONS OP INSTAGRAM
          </a>
        );
        break;
      case "tag":
        elements.push(
          <span
            key={`item-${groupIndex}-${i}`}
            className="font-mono text-sm md:text-lg tracking-wider font-bold whitespace-nowrap"
            style={{ color: BRAND_COLORS[item.color], opacity: 0.6 }}
          >
            {item.label}
          </span>
        );
        break;
    }
  });

  // Trailing separator after the last item in each group
  elements.push(
    <Separator key={`sep-${groupIndex}-trail`} colorIndex={separatorIndex} />
  );

  return <>{elements}</>;
}

function Track({
  direction,
}: {
  direction: "left" | "right";
}) {
  const animationStyle: React.CSSProperties =
    direction === "left"
      ? { animation: "tickerScroll 60s linear infinite" }
      : { animation: "tickerScrollReverse 55s linear infinite" };

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="flex shrink-0" style={animationStyle}>
        {Array.from({ length: 4 }, (_, groupIndex) => (
          <div
            key={groupIndex}
            className="flex items-center gap-10 md:gap-14 shrink-0"
            style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
          >
            <TickerContent groupIndex={groupIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventTicker() {
  return (
    <div
      className="relative select-none"
      style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}
      aria-hidden="true"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          opacity: 0.2,
          background:
            "linear-gradient(to right, var(--color-accent-gold), var(--color-accent-blue), transparent)",
        }}
      />

      {/* Edge fade left */}
      <div
        className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
        style={{
          width: "clamp(3rem, 15vw, 12rem)",
          background:
            "linear-gradient(to right, var(--color-bg), transparent)",
        }}
      />

      {/* Edge fade right */}
      <div
        className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
        style={{
          width: "clamp(3rem, 15vw, 12rem)",
          background:
            "linear-gradient(to left, var(--color-bg), transparent)",
        }}
      />

      {/* Tracks */}
      <div className="flex flex-col" style={{ gap: "1.5rem" }}>
        <Track direction="left" />
        <Track direction="right" />
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          opacity: 0.2,
          background:
            "linear-gradient(to right, var(--color-accent-blue), var(--color-accent-gold), transparent)",
        }}
      />
    </div>
  );
}
