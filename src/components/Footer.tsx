"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Footer() {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !preRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && preRef.current) {
            gsap.fromTo(
              preRef.current,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const footerEl = preRef.current.closest("footer");
    if (footerEl) observer.observe(footerEl);

    return () => observer.disconnect();
  }, []);

  const year = new Date().getFullYear();

  // Link style: underline + brighter color + cursor pointer
  const linkClass = "text-[var(--color-text)] underline decoration-[var(--color-accent-gold)]/40 underline-offset-2 hover:decoration-[var(--color-accent-gold)] hover:text-[var(--color-accent-gold)] transition-colors duration-200 cursor-pointer";

  return (
    <footer
      id="footer"
      className="relative z-[1] border-t border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <pre
          ref={preRef}
          className="font-mono text-sm md:text-base leading-loose overflow-x-auto"
        >
          <span className="text-[var(--color-text-muted)]">{"{"}</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;name&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <span className="text-[var(--color-accent-gold)]">&quot;@hva/sit&quot;</span>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;version&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <span className="text-[var(--color-accent-gold)]">&quot;11.0.0&quot;</span>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;description&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <span className="text-[var(--color-accent-gold)]">&quot;Studievereniging ICT — Hogeschool van Amsterdam&quot;</span>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;homepage&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <a href="https://svsit.nl" className={linkClass}>&quot;svsit.nl&quot;</a>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;contact&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <a href="mailto:bestuur@svsit.nl" className={linkClass}>&quot;bestuur@svsit.nl&quot;</a>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;socials&quot;</span>
          <span className="text-[var(--color-text-muted)]">: {"{"}</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"    "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;instagram&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <a href="https://www.instagram.com/sv.sit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className={linkClass}>&quot;@svsit&quot;</a>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"    "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;linkedin&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <a href="https://linkedin.com/company/svsit-hbo-ict" target="_blank" rel="noopener noreferrer" className={linkClass}>&quot;/company/svsit&quot;</a>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  }"}</span>
          <span className="text-[var(--color-text-muted)]">,</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"  "}</span>
          <span className="text-[var(--color-accent-blue)]">&quot;license&quot;</span>
          <span className="text-[var(--color-text-muted)]">: </span>
          <span className="text-[var(--color-accent-gold)]">&quot;FDMCI&quot;</span>{"\n"}

          <span className="text-[var(--color-text-muted)]">{"}"}</span>
        </pre>

        <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-40 mt-8">
          &copy; {year} SIT — Hogeschool van Amsterdam — FDMCI
        </p>
      </div>
    </footer>
  );
}
