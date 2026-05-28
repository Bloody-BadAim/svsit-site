"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SitLogo from "@/components/SitLogo";

const NAV_LINKS = [
  { href: "/over-ons", label: "Over Ons", type: "dir" },
  { href: "/events", label: "Events", type: "dir" },
  { href: "/commissies", label: "Commissies", type: "dir" },
  { href: "/projecten", label: "Projecten", type: "dir" },
  { href: "/vacatures", label: "Vacatures", type: "dir" },
  { href: "/leaderboard", label: "Leaderboard", type: "dir" },
  { href: "/faq", label: "FAQ", type: "file" },
  { href: "/login", label: "Word Lid", type: "file" },
];

const SOCIALS = [
  {
    href: "https://www.instagram.com/sv.sit",
    ariaLabel: "Instagram: @sv.sit",
    command: "open",
    target: "instagram",
    hoverColor: "var(--color-accent-gold)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@sit_hva",
    ariaLabel: "TikTok: @sit_hva",
    command: "open",
    target: "tiktok",
    hoverColor: "var(--color-accent-red)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.43V13a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.59-1.45V6.69h3.59z" />
      </svg>
    ),
  },
  {
    href: "https://chat.whatsapp.com/LCndNz4xGZW0tqXWkNabaL",
    ariaLabel: "WhatsApp groep",
    command: "join",
    target: "whatsapp",
    hoverColor: "#25D366",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    href: "https://discord.gg/68QjRVRRUM",
    ariaLabel: "Discord server",
    command: "join",
    target: "discord",
    hoverColor: "#5865F2",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/company/svsit-hbo-ict",
    ariaLabel: "LinkedIn: /company/svsit",
    command: "open",
    target: "linkedin",
    hoverColor: "var(--color-accent-blue)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: "mailto:bestuur@svsit.nl",
    ariaLabel: "E-mail: bestuur@svsit.nl",
    command: "mail",
    target: "bestuur@svsit.nl",
    hoverColor: "var(--color-accent-green)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <footer id="footer" className="relative z-[1] bg-[var(--color-bg)] overflow-hidden">
      {/* Scanline grid texture - CSS only */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)",
          zIndex: 0,
        }}
      />

      {/* Subtle dot grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle 1px, rgba(242,158,24,0.04) 0%, transparent 100%)",
          backgroundSize: "32px 32px",
          zIndex: 0,
        }}
      />

      {/* ASCII art separator */}
      <div aria-hidden="true" className="relative z-[1] font-mono text-[10px] leading-none text-[#71717A] select-none overflow-hidden whitespace-nowrap">
        <div className="flex items-center h-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-gold)] to-transparent opacity-30" />
        </div>
        <div className="text-center opacity-20 tracking-[0.5em] pb-4">
          &#123;&#47;&#42; &#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61;&#61; &#42;&#47;&#125;
        </div>
      </div>

      <div ref={contentRef} className="relative z-[1] max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        {/* ZONE 1: Logo + Terminal prompt */}
        <div
          data-footer-zone
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 pt-8 pb-14 md:pb-16"
        >
          {/* Left: Logo block styled as module export */}
          <div className="max-w-md">
            <div className="mb-4 flex items-center gap-3">
              <SitLogo size={40} showCrosses={false} />
              <span className="font-mono text-[11px] text-[#71717A]">v11.0</span>
            </div>
            <div className="font-mono text-xs text-[#71717A] mb-3 flex items-center gap-2">
              <span className="text-[var(--color-accent-blue)]">export default</span>
              <span className="text-[#A1A1AA]">StudieverenigingICT</span>
            </div>
            <p className="font-mono text-sm text-[#A1A1AA] leading-relaxed">
              Studievereniging voor alle HBO-ICT studenten aan de HvA.
            </p>
          </div>

          {/* Right: Social links styled as terminal commands */}
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-2">
              ~/socials
            </div>
            {SOCIALS.map((s) => (
              <a
                key={s.ariaLabel}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={s.ariaLabel}
                className="group flex items-center gap-3 font-mono text-sm text-[#A1A1AA] hover:text-[var(--color-text)] transition-colors duration-200 w-fit"
                onMouseEnter={(e) => {
                  const target = e.currentTarget.querySelector<HTMLElement>("[data-social-name]");
                  if (target) target.style.color = s.hoverColor;
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget.querySelector<HTMLElement>("[data-social-name]");
                  if (target) target.style.color = "";
                }}
              >
                <span className="text-[#71717A] group-hover:text-[var(--color-accent-green)] transition-colors duration-200">$</span>
                <span className="text-[#71717A] group-hover:text-[#A1A1AA] transition-colors duration-200">{s.command}</span>
                <span className="transition-colors duration-200 flex items-center gap-2">
                  <span data-social-name className="transition-colors duration-200">{s.target}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#71717A]">
                    {s.icon}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.06)]" />

        {/* ZONE 2: File tree sitemap + Contact */}
        <div
          data-footer-zone
          className="grid grid-cols-1 sm:grid-cols-2 gap-12 py-14 md:py-16"
        >
          {/* File tree navigation */}
          <div>
            <div className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              src/paginas
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link, i) => {
                const isLast = i === NAV_LINKS.length - 1;
                const branch = isLast ? "\u2514\u2500\u2500" : "\u251C\u2500\u2500";
                const icon = link.type === "dir" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline-block opacity-60"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline-block opacity-60"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                );
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex items-center font-mono text-sm text-[#A1A1AA] hover:text-[var(--color-text)] transition-colors duration-200 w-fit py-1"
                  >
                    <span className="text-[#71717A] mr-2 select-none text-xs" aria-hidden="true">{branch}</span>
                    <span className="mr-2 select-none" aria-hidden="true">{icon}</span>
                    <span className="group-hover:text-[var(--color-accent-gold)] transition-colors duration-200">
                      {link.label}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Contact as config object */}
          <div>
            <div className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              contact.json
            </div>
            <div className="font-mono text-sm leading-loose">
              <div className="text-[#71717A]">&#123;</div>
              <div className="pl-4">
                <span className="text-[var(--color-accent-blue)]">&quot;email&quot;</span>
                <span className="text-[#71717A]">: </span>
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="text-[var(--color-accent-green)] hover:text-[var(--color-text)] transition-colors duration-200"
                >
                  &quot;bestuur@svsit.nl&quot;
                </a>
                <span className="text-[#71717A]">,</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--color-accent-blue)]">&quot;locatie&quot;</span>
                <span className="text-[#71717A]">: </span>
                <span className="text-[#A1A1AA]">&quot;Wibauthuis, Wibautstraat 3b&quot;</span>
                <span className="text-[#71717A]">,</span>
              </div>
              <div className="pl-4">
                <span className="text-[var(--color-accent-blue)]">&quot;postcode&quot;</span>
                <span className="text-[#71717A]">: </span>
                <span className="text-[#A1A1AA]">&quot;1091 GH Amsterdam&quot;</span>
              </div>
              <div className="text-[#71717A]">&#125;</div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[rgba(255,255,255,0.06)]" />

        {/* ZONE 3: HBO-ICT + Copyright as code comments */}
        <div data-footer-zone className="py-10 md:py-12">
          {/* HBO-ICT section as import statement */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="font-mono text-xs text-[#71717A] flex flex-wrap items-center gap-x-1.5">
              <span className="text-[var(--color-accent-blue)]">import</span>
              <span className="text-[#A1A1AA]">SIT</span>
              <span className="text-[var(--color-accent-blue)]">from</span>
              <span className="text-[#A78BFA]">&apos;@hva/hbo-ict&apos;</span>
            </div>
            <div className="font-mono text-[11px] text-[#71717A] flex flex-wrap gap-x-1">
              <span className="text-[#52525B]">{"//"}</span>
              <span>Software Engineering</span>
              <span className="text-[#52525B]">&middot;</span>
              <span>Cyber Security</span>
              <span className="text-[#52525B]">&middot;</span>
              <span>Game Development</span>
              <span className="text-[#52525B]">&middot;</span>
              <span>Business IT &amp; Management</span>
              <span className="text-[#52525B]">&middot;</span>
              <span>Technische Informatica</span>
            </div>
          </div>

          {/* Partner logos */}
          <div className="flex items-center gap-6 mb-6">
            <a href="https://www.hva.nl" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-70 transition-opacity" aria-label="Hogeschool van Amsterdam">
              <svg width="60" height="24" viewBox="0 0 120 48" fill="currentColor" className="text-[#A1A1AA]">
                <text x="0" y="36" fontFamily="var(--font-mono)" fontSize="32" fontWeight="700">HvA</text>
              </svg>
            </a>
            <a href="https://www.femit.nl" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-70 transition-opacity" aria-label="FEMIT">
              <svg width="60" height="24" viewBox="0 0 120 48" fill="currentColor" className="text-[#A1A1AA]">
                <text x="0" y="36" fontFamily="var(--font-mono)" fontSize="28" fontWeight="700">FEMIT</text>
              </svg>
            </a>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Copyright as code comment */}
            <div className="font-mono text-xs text-[#71717A] flex items-center gap-2">
              <span className="text-[#52525B]">{"//"}</span>
              <span>&copy; {year} SIT</span>
              <span className="text-[#52525B]">|</span>
              <span>Hogeschool van Amsterdam</span>
              <span className="inline-flex items-center gap-1.5 ml-1" aria-hidden="true">
                <span className="text-[var(--color-accent-red)] font-bold text-[10px]">&times;</span>
                <span className="text-[var(--color-accent-green)] font-bold text-[10px]">&times;</span>
                <span className="text-[var(--color-accent-blue)] font-bold text-[10px]">&times;</span>
              </span>
            </div>

            {/* scroll.toTop() button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Terug naar boven"
              className="group font-mono text-xs text-[#71717A] hover:text-[var(--color-accent-gold)] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-[#52525B] group-hover:text-[var(--color-accent-green)] transition-colors">{">"}</span>
              <span>scroll.toTop()</span>
              <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">&uarr;</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
