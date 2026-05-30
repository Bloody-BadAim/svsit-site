"use client";

import { useEffect, useRef, useState } from "react";

const FEED_DATA = [
  { who: "Idil", act: "pushte een nieuwe Kroegentocht", tag: "events", color: "var(--color-accent-gold)" },
  { who: "GameIT", act: "merged D&D-avond #14", tag: "gameit", color: "var(--color-accent-red)" },
  { who: "AI4HvA", act: "deployde AI Marathon 2026", tag: "ai", color: "var(--color-accent-blue)" },
  { who: "Hugo", act: "scheduled tech talk: Clean Code", tag: "educo", color: "var(--color-accent-green)" },
  { who: "Matin", act: "signed sponsor - ChipSoft", tag: "sponsoring", color: "var(--color-accent-gold)" },
  { who: "Community", act: "onboardde 12 nieuwe leden", tag: "community", color: "var(--color-accent-blue)" },
  { who: "ServCo", act: "shipped svsit.nl v11", tag: "servco", color: "var(--color-accent-blue)" },
  { who: "Thijmen", act: "boekte Thuishaven feest", tag: "events", color: "var(--color-accent-gold)" },
  { who: "Wesley", act: "won de CTF challenge", tag: "ctf", color: "var(--color-accent-green)" },
  { who: "Rosa", act: "organiseerde LAN party", tag: "gameit", color: "var(--color-accent-red)" },
];

const MAX_ROWS = 5;

interface FeedRow {
  id: number;
  hash: string;
  who: string;
  act: string;
  tag: string;
  color: string;
}

function generateHash() {
  return Math.random().toString(16).slice(2, 9);
}

function daysUntilIntroweek(): number {
  const target = new Date("2026-08-31T10:00:00+02:00").getTime();
  return Math.max(Math.floor((target - Date.now()) / 86400000), 0);
}

export default function CommunityLog() {
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [days, setDays] = useState<number | null>(null);
  const indexRef = useRef(0);
  const idRef = useRef(0);

  // Bereken pas na mount: Date.now() in render geeft anders hydration mismatch (React #418).
  useEffect(() => {
    setDays(daysUntilIntroweek());
  }, []);

  // Initial fill
  useEffect(() => {
    const initial: FeedRow[] = [];
    for (let i = 0; i < MAX_ROWS; i++) {
      const d = FEED_DATA[i % FEED_DATA.length];
      initial.push({
        id: idRef.current++,
        hash: generateHash(),
        ...d,
      });
    }
    indexRef.current = MAX_ROWS;
    setRows(initial);
  }, []);

  // Auto-scroll new entries
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      const d = FEED_DATA[indexRef.current % FEED_DATA.length];
      indexRef.current++;
      setRows((prev) => {
        const next = [
          ...prev.slice(-(MAX_ROWS - 1)),
          {
            id: idRef.current++,
            hash: generateHash(),
            ...d,
          },
        ];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="hidden lg:flex flex-col border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm overflow-hidden opacity-0 animate-[fadeIn_0.8s_ease_1.2s_forwards]"
      style={{ maxWidth: 420 }}
    >
      {/* Terminal chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)]">
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-red)] opacity-60" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] opacity-60" />
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2">
          community.log
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px]">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]"
            style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}
          />
          <span className="text-[var(--color-accent-green)]">live</span>
        </span>
      </div>

      {/* Command line */}
      <div className="px-4 pt-3 pb-1 font-mono text-[11px]">
        <span className="text-[var(--color-accent-green)]">$</span>{" "}
        <span className="text-[var(--color-text)]">sit --watch</span>{" "}
        <span className="text-[var(--color-text-muted)] opacity-50">// wat er nu gebeurt</span>
      </div>

      {/* Feed rows */}
      <div className="px-4 py-2 flex flex-col gap-1.5 min-h-[140px]">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-2 font-mono text-[11px] animate-[fadeIn_0.3s_ease_forwards]"
          >
            <span className="text-[var(--color-text-muted)] opacity-30 shrink-0">
              {row.hash}
            </span>
            <span className="text-[var(--color-text)] font-medium shrink-0">
              {row.who}
            </span>
            <span className="text-[var(--color-text-muted)] truncate">
              {row.act}
            </span>
            <span
              className="ml-auto shrink-0 px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded-sm border"
              style={{
                color: row.color,
                borderColor: row.color,
              }}
            >
              {row.tag}
            </span>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--color-border)] font-mono text-[10px] text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="text-[var(--color-accent-green)]">●</span>
          <span>
            <strong className="text-[var(--color-text)]">100+</strong> leden &amp; groeit
          </span>
        </span>
        <span>
          introweek in{" "}
          <strong className="text-[var(--color-accent-gold)]">
            {days ?? "-"}
          </strong>{" "}
          dagen
        </span>
      </div>
    </div>
  );
}
