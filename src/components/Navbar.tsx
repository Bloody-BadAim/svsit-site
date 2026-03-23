"use client";

import { useEffect, useState } from "react";

const jokes = [
  "Geen bugs, alleen features",
  "Works on my machine \u00AF\\_(\u30C4)_/\u00AF",
  "// dit is geen comment, dit is een schreeuw om hulp",
  "git commit -m 'fix: everything'",
  "404: social life not found",
  "while(true) { study(); code(); borrel(); }",
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [joke, setJoke] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoHover = () => {
    setJoke(jokes[Math.floor(Math.random() * jokes.length)]);
    setShowTooltip(true);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="relative">
          <a
            href="/"
            className="group/logo font-mono text-lg tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-all duration-300"
            onMouseEnter={handleLogoHover}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-block text-[var(--color-accent-gold)] transition-transform duration-300 group-hover/logo:-translate-x-1">{"{"}</span>
            SIT
            <span className="inline-block text-[var(--color-accent-gold)] transition-transform duration-300 group-hover/logo:translate-x-1">{"}"}</span>
          </a>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-accent-gold)] whitespace-nowrap opacity-0 animate-[fadeIn_0.2s_ease_forwards] pointer-events-none">
              {joke}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-sm text-[var(--color-text-muted)]">
          <a
            href="#about"
            className="relative hover:text-[var(--color-text)] hover:-translate-y-0.5 transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-accent-gold)] after:transition-all after:duration-300 hover:after:w-full"
          >
            over_sit
          </a>
          <a
            href="#events"
            className="relative hover:text-[var(--color-text)] hover:-translate-y-0.5 transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-accent-gold)] after:transition-all after:duration-300 hover:after:w-full"
          >
            events
          </a>
          <a
            href="#bestuur"
            className="relative hover:text-[var(--color-text)] hover:-translate-y-0.5 transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-accent-gold)] after:transition-all after:duration-300 hover:after:w-full"
          >
            bestuur
          </a>
          <a
            href="#join"
            className="group/lid relative px-4 py-2 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] overflow-hidden hover:text-[var(--color-bg)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <div className="absolute inset-0 bg-[var(--color-accent-gold)] translate-y-full group-hover/lid:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10">
              <span className="group-hover/lid:opacity-0 transition-opacity duration-200">word_lid()</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/lid:opacity-100 transition-opacity duration-200">word_lid(true)</span>
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
