"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SitLogo from "@/components/SitLogo";

const NAV_LINKS = [
  { href: "/#about", label: "Over SIT" },
  { href: "/#events", label: "Events" },
  { href: "/organisatie", label: "Organisatie" },
  { href: "/over-ons", label: "Het Bestuur" },
  { href: "/login", label: "Word Lid" },
];

const SOCIALS = [
  {
    href: "https://www.instagram.com/sv.sit",
    ariaLabel: "Instagram: @svsit",
    hoverBorder: "#F59E0B",
    hoverGlow: "0 0 16px rgba(245, 158, 11, 0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/company/svsit-hbo-ict",
    ariaLabel: "LinkedIn: /company/svsit",
    hoverBorder: "#3B82F6",
    hoverGlow: "0 0 16px rgba(59, 130, 246, 0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: "mailto:bestuur@svsit.nl",
    ariaLabel: "E-mail: bestuur@svsit.nl",
    hoverBorder: "#22C55E",
    hoverGlow: "0 0 16px rgba(34, 197, 94, 0.2)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
  },
];

export default function Footer() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && contentRef.current) {
            const sections =
              contentRef.current.querySelectorAll("[data-footer-zone]");
            gsap.fromTo(
              Array.from(sections),
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.12,
                ease: "power3.out",
              }
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const footerEl = contentRef.current.closest("footer");
    if (footerEl) observer.observe(footerEl);

    return () => observer.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative z-[1] bg-[var(--color-bg)]">
      {/* Top gradient line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, var(--color-accent-gold) 0%, var(--color-accent-blue) 40%, var(--color-accent-red) 70%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      <div ref={contentRef} className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        {/* ZONE 1: Logo + Social */}
        <div
          data-footer-zone
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 py-16 md:py-20"
        >
          <div className="max-w-md">
            <div className="mb-6">
              <SitLogo size={40} showCrosses={false} />
            </div>
            <p className="font-mono text-sm text-[#A1A1AA] leading-relaxed">
              Studievereniging voor alle HBO-ICT studenten aan de HvA.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.ariaLabel}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={s.ariaLabel}
                className="group flex items-center justify-center w-11 h-11 border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 text-[#A1A1AA] hover:text-[var(--color-text)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.hoverBorder;
                  e.currentTarget.style.boxShadow = s.hoverGlow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.06)]" />

        {/* ZONE 2: Links + Contact */}
        <div
          data-footer-zone
          className="grid grid-cols-1 sm:grid-cols-2 gap-12 py-14 md:py-16"
        >
          <div>
            <h3 className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-6">
              Pagina&apos;s
            </h3>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-sm text-[#A1A1AA] hover:text-[var(--color-text)] transition-colors duration-200 w-fit"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-6">
              Contact
            </h3>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:bestuur@svsit.nl"
                className="font-mono text-sm text-[#A1A1AA] hover:text-[var(--color-text)] transition-colors duration-200 w-fit"
              >
                bestuur@svsit.nl
              </a>
              <div className="font-mono text-sm text-[#A1A1AA] leading-relaxed">
                Wibauthuis, Wibautstraat 3b
                <br />
                1091 GH Amsterdam
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.06)]" />

        {/* ZONE 3: HvA + Copyright */}
        <div data-footer-zone className="py-10 md:py-12">
          <div className="flex flex-col gap-1.5 mb-8">
            <p className="font-mono text-xs text-[#A1A1AA]">
              Onderdeel van{" "}
              <span className="text-[#A78BFA]">HBO-ICT</span>
              {" "}&mdash; Hogeschool van Amsterdam
            </p>
            <p className="font-mono text-[11px] text-[#71717A]">
              Software Engineering &middot; Cyber Security &middot; Game Development &middot; Business IT &amp; Management &middot; Technische Informatica
            </p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="font-mono text-xs text-[#71717A] flex items-center gap-2">
              <span>&copy; {year} SIT &mdash; Hogeschool van Amsterdam</span>
              <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                <span className="text-[var(--color-accent-red)] font-bold text-[10px]">&times;</span>
                <span className="text-[var(--color-accent-green)] font-bold text-[10px]">&times;</span>
                <span className="text-[var(--color-accent-blue)] font-bold text-[10px]">&times;</span>
              </span>
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Terug naar boven"
              className="font-mono text-xs text-[#71717A] hover:text-[var(--color-accent-gold)] transition-colors cursor-pointer"
            >
              scroll.toTop() &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
