"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Instagram, Linkedin, Mail, MapPin, ArrowUp } from "lucide-react";
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
    Icon: Instagram,
    hoverBorder: "#F59E0B",
    hoverGlow: "0 0 16px rgba(245, 158, 11, 0.2)",
  },
  {
    href: "https://linkedin.com/company/svsit-hbo-ict",
    ariaLabel: "LinkedIn: /company/svsit",
    Icon: Linkedin,
    hoverBorder: "#3B82F6",
    hoverGlow: "0 0 16px rgba(59, 130, 246, 0.2)",
  },
  {
    href: "mailto:bestuur@svsit.nl",
    ariaLabel: "E-mail: bestuur@svsit.nl",
    Icon: Mail,
    hoverBorder: "#22C55E",
    hoverGlow: "0 0 16px rgba(34, 197, 94, 0.2)",
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
      {/* Gradient accent top border */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, var(--color-accent-gold) 0%, var(--color-accent-blue) 40%, var(--color-accent-red) 70%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      <div
        ref={contentRef}
        className="max-w-[1400px] mx-auto px-5 sm:px-6 md:px-12 lg:px-24 py-16 sm:py-20 md:py-24"
      >
        {/* ═══ Zone 1: Brand + Social icons ═══ */}
        <div
          data-footer-zone
          className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10 pb-12 sm:pb-16 mb-12 sm:mb-16 border-b border-[var(--color-border)]"
        >
          {/* Logo + description */}
          <div className="max-w-sm">
            <div className="mb-4">
              <SitLogo size={40} showCrosses={false} />
            </div>
            <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed">
              Studievereniging voor alle{" "}
              <span className="text-[var(--color-accent-blue)]">HBO-ICT</span>{" "}
              studenten aan de HvA. Van{" "}
              <span className="text-[var(--color-accent-gold)]">
                Software Engineering
              </span>{" "}
              tot{" "}
              <span className="text-[var(--color-accent-red)]">
                Cyber Security
              </span>
              .
            </p>
          </div>

          {/* Social icon buttons — ONLY place socials appear */}
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.ariaLabel}
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  s.href.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                aria-label={s.ariaLabel}
                className="group flex items-center justify-center w-11 h-11 border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200"
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = s.hoverBorder;
                  el.style.boxShadow = s.hoverGlow;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "";
                  el.style.boxShadow = "none";
                }}
              >
                <s.Icon
                  size={18}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors duration-200"
                />
              </a>
            ))}
          </div>
        </div>

        {/* ═══ Zone 2: Info grid (2 columns, no duplicate socials) ═══ */}
        <div
          data-footer-zone
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12 md:gap-16 pb-12 sm:pb-16 mb-12 border-b border-[var(--color-border)]"
        >
          {/* Column 1: Navigation */}
          <div>
            <h3 className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-5">
              Pagina&apos;s
            </h3>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:translate-x-1 transition-all duration-200 w-fit"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 2: Contact & Location */}
          <div>
            <h3 className="font-mono text-[11px] text-[var(--color-accent-gold)] uppercase tracking-[0.2em] mb-5">
              Contact
            </h3>
            <div className="flex flex-col gap-4">
              {/* Email */}
              <a
                href="mailto:bestuur@svsit.nl"
                className="flex items-center gap-2.5 font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 w-fit"
              >
                <Mail
                  size={14}
                  className="text-[var(--color-accent-green)] shrink-0"
                  style={{ opacity: 0.7 }}
                />
                bestuur@svsit.nl
              </a>

              {/* Location */}
              <div className="flex items-start gap-2.5 font-mono text-sm text-[var(--color-text-muted)]">
                <MapPin
                  size={14}
                  className="text-[var(--color-accent-red)] mt-0.5 shrink-0"
                  style={{ opacity: 0.7 }}
                />
                <span>
                  Wibauthuis, Wibautstraat 3b
                  <br />
                  <span className="text-[#71717A]">1091 GH Amsterdam</span>
                </span>
              </div>

              {/* Faculty */}
              <p className="font-mono text-sm text-[#71717A] ml-[22.5px]">
                FDMCI — Hogeschool van Amsterdam
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Zone 3: HvA branding + specialisaties ═══ */}
        <div
          data-footer-zone
          className="pb-12 mb-12 border-b border-[var(--color-border)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="font-mono text-xs text-[#71717A] leading-relaxed">
              <span>Onderdeel van </span>
              <span className="text-[#7C6FD4]">HBO-ICT</span>
              <span> — Hogeschool van Amsterdam</span>
              <br />
              <span className="text-[#3F3F46]">FDMCI — Faculteit Digital Media and Creative Industries</span>
            </div>
          </div>
          <p className="font-mono text-[11px] text-[#3F3F46] mt-4 leading-relaxed">
            Software Engineering · Cyber Security · Game Development · Business IT &amp; Management · Technische Informatica
          </p>
        </div>

        {/* ═══ Zone 4: Terminal signature + Copyright + Back-to-top ═══ */}
        <div data-footer-zone>
          {/* Terminal one-liner */}
          <p
            className="hidden sm:block font-mono text-xs text-[#3F3F46] mb-5"
            aria-hidden="true"
          >
            <span className="text-[var(--color-accent-green)]">{"$"}</span>
            {" cat package.json | "}
            <span className="text-[var(--color-accent-blue)]">{"jq"}</span>
            {" '.name, .version'  "}
            <span className="opacity-40">{"\u2192"}</span>
            {"  "}
            <span className="text-[var(--color-accent-gold)]">
              {'"@hva/sit"'}
            </span>
            {"  "}
            <span className="text-[var(--color-accent-gold)]">
              {'"11.0.0"'}
            </span>
          </p>

          {/* Copyright + back-to-top */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="font-mono text-xs text-[#71717A] flex items-center gap-2">
              <span>&copy; {year} SIT — Hogeschool van Amsterdam</span>
              <span
                className="inline-flex items-center gap-1.5"
                aria-hidden="true"
              >
                <span className="text-[var(--color-accent-red)] font-bold">
                  ×
                </span>
                <span className="text-[var(--color-accent-green)] font-bold">
                  ×
                </span>
                <span className="text-[var(--color-accent-blue)] font-bold">
                  ×
                </span>
              </span>
            </p>

            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              aria-label="Terug naar boven"
              className="group flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-200 cursor-pointer"
            >
              <span>scroll.toTop()</span>
              <ArrowUp
                size={14}
                className="group-hover:-translate-y-0.5 transition-transform duration-200"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
