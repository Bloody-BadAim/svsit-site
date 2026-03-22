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
            className="font-mono text-lg tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors duration-200"
            onMouseEnter={handleLogoHover}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="text-[var(--color-accent-gold)]">{"{"}</span>
            SIT
            <span className="text-[var(--color-accent-gold)]">{"}"}</span>
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
            className="hover:text-[var(--color-text)] transition-colors duration-200"
          >
            over_sit
          </a>
          <a
            href="#events"
            className="hover:text-[var(--color-text)] transition-colors duration-200"
          >
            events
          </a>
          <a
            href="#bestuur"
            className="hover:text-[var(--color-text)] transition-colors duration-200"
          >
            bestuur
          </a>
          <a
            href="#join"
            className="px-4 py-2 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg)] transition-all duration-200"
          >
            word_lid()
          </a>
        </div>
      </div>
    </nav>
  );
}
