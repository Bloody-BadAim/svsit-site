"use client";

import type { SitEvent } from "./types";
import { fDay, fMonth } from "./types";

export default function DateStub({ event, size = "sm" }: { event: SitEvent; size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <div
      className="relative flex-shrink-0 flex flex-col items-center overflow-hidden rounded-md"
      style={{
        width: isLg ? 64 : 48,
        background: `${event.color}0a`,
        border: `1px solid ${event.color}25`,
      }}
    >
      <div
        className="w-full"
        style={{
          height: isLg ? 3 : 2,
          background: event.color,
        }}
      />
      <span
        className="font-display font-bold leading-none"
        style={{
          fontSize: isLg ? 28 : 20,
          color: event.color,
          paddingTop: isLg ? 6 : 4,
        }}
      >
        {fDay(event.date)}
      </span>
      <span
        className="font-mono tracking-[0.15em] uppercase opacity-70 pb-1"
        style={{
          fontSize: isLg ? 10 : 8,
          color: event.color,
        }}
      >
        {fMonth(event.date)}
      </span>
    </div>
  );
}
