"use client";

import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";

const BRAND_COLORS = {
  gold: "var(--color-accent-gold)",
  blue: "var(--color-accent-blue)",
  red: "var(--color-accent-red)",
  green: "var(--color-accent-green)",
} as const;

type BrandColor = keyof typeof BRAND_COLORS;

const TICKER_ITEMS: { label: string; color: BrandColor }[] = [
  { label: "@svsit", color: "gold" },
  { label: "BORRELS", color: "blue" },
  { label: "HACKATHONS", color: "red" },
  { label: "GAME NIGHTS", color: "green" },
  { label: "TECH TALKS", color: "blue" },
  { label: "KROEGENTOCHTEN", color: "red" },
  { label: "CTF CHALLENGES", color: "green" },
  { label: "WORKSHOPS", color: "gold" },
];

const SEPARATOR_COLORS: BrandColor[] = ["red", "green", "gold", "blue"];

export default function EventTicker() {
  return (
    <div
      className="relative select-none"
      style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem" }}
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

      <div className="relative h-[60px] w-full overflow-hidden">
        <InfiniteSlider
          className="flex h-full w-full items-center"
          gap={0}
          speed={40}
          speedOnHover={20}
        >
          {TICKER_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-8 md:gap-12 shrink-0 px-4 md:px-6">
              {i > 0 && (
                <span
                  className="font-bold text-lg select-none"
                  style={{
                    opacity: 0.7,
                    color: BRAND_COLORS[SEPARATOR_COLORS[i % SEPARATOR_COLORS.length]],
                  }}
                >
                  &times;
                </span>
              )}
              {item.label === "@svsit" ? (
                <a
                  href="https://instagram.com/sv.sit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-2xl md:text-4xl whitespace-nowrap hover:opacity-80 transition-opacity"
                  style={{ color: BRAND_COLORS[item.color] }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="font-mono text-base md:text-xl tracking-wider font-bold whitespace-nowrap"
                  style={{ color: BRAND_COLORS[item.color], opacity: 0.7 }}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </InfiniteSlider>

        <ProgressiveBlur
          className="pointer-events-none absolute top-0 left-0 h-full w-[100px] md:w-[200px]"
          direction="left"
          blurIntensity={1}
        />
        <ProgressiveBlur
          className="pointer-events-none absolute top-0 right-0 h-full w-[100px] md:w-[200px]"
          direction="right"
          blurIntensity={1}
        />
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
