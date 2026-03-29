"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SitLogo from "@/components/SitLogo";

/* ─── SVG Icons ─── */

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

export default function Footer() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const elements: { el: Element; delay: number }[] = [];

    if (contentRef.current) {
      const cols = contentRef.current.querySelectorAll(".footer-col");
      cols.forEach((col, i) => {
        elements.push({ el: col, delay: 0.1 + i * 0.1 });
      });
    }

    elements.forEach(({ el }) => {
      gsap.set(el, { opacity: 0, y: 24 });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            elements.forEach(({ el, delay }) => {
              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay,
                ease: "power3.out",
              });
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.05 }
    );

    const footerEl = contentRef.current?.closest("footer");
    if (footerEl) observer.observe(footerEl);

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="footer"
      className="relative z-[1] overflow-hidden"
      style={{
        background: "var(--color-surface)",
        marginTop: "6rem",
      }}
    >
      {/* Gradient top border */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(to right, transparent 5%, var(--color-accent-gold) 30%, var(--color-accent-blue) 70%, transparent 95%)",
          opacity: 0.5,
        }}
      />

      {/* "return 0;" statement */}
      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-16 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <span className="block font-mono text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
            <span className="text-[var(--color-accent-blue)] opacity-50">
              return{" "}
            </span>
            <span className="text-[var(--color-accent-gold)]">0</span>
            <span className="text-[var(--color-text-muted)] opacity-40">;</span>
          </span>
          <p className="font-mono text-sm text-[var(--color-accent-green)] opacity-50 mt-3">
            {"// einde van de pagina. begin van jouw SIT verhaal."}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="relative z-10 h-px mx-6 md:mx-12 lg:mx-24"
        style={{
          background:
            "linear-gradient(to right, var(--color-border), var(--color-border), transparent)",
        }}
      />

      {/* Main footer content */}
      <div
        ref={contentRef}
        className="relative z-10 px-6 md:px-12 lg:px-24 py-16 md:py-20"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Logo + tagline */}
            <div className="footer-col md:col-span-4">
              <SitLogo size={36} showCrosses />
              <p className="font-mono text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs mt-4">
                De studievereniging voor HBO-ICT studenten aan de Hogeschool van
                Amsterdam.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] opacity-40 mt-2">
                Onderdeel van FDMCI · KvK geregistreerd · Sinds 2015
              </p>
            </div>

            {/* Navigation */}
            <div className="footer-col md:col-span-2 md:col-start-6">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase block mb-5 font-bold">
                NAVIGATIE
              </span>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/#about", label: "Over SIT" },
                  { href: "/#events", label: "Events" },
                  { href: "/over-ons", label: "Bestuur" },
                  { href: "/#join", label: "Word lid", accent: true },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`font-mono text-sm hover:translate-x-2 transition-all duration-300 ${
                      link.accent
                        ? "text-[var(--color-accent-gold)] hover:text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className="footer-col md:col-span-2">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase block mb-5 font-bold">
                CONTACT
              </span>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] hover:translate-x-1 transition-all duration-300"
                >
                  bestuur@svsit.nl
                </a>
                <span className="text-xs text-[var(--color-text-muted)] opacity-40 mt-2">
                  WBH · Wibautstraat 3b
                </span>
                <span className="text-xs text-[var(--color-text-muted)] opacity-40">
                  1091 GH Amsterdam
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="footer-col md:col-span-3 md:col-start-10">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase block mb-5 font-bold">
                VOLG ONS
              </span>
              <div className="flex flex-col gap-3">
                {/* Instagram card */}
                <a
                  href="https://instagram.com/svsit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-gold)] transition-colors duration-300">
                    <InstagramIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-gold)] transition-colors duration-300">
                      @svsit
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] opacity-60">
                      Instagram
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>

                {/* LinkedIn card */}
                <a
                  href="https://linkedin.com/company/svsit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-blue)] transition-colors duration-300">
                    <LinkedInIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-blue)] transition-colors duration-300">
                      Studievereniging ICT
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] opacity-60">
                      LinkedIn
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>

                {/* Email card */}
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="group/social flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-green)] transition-colors duration-300">
                    <MailIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-green)] transition-colors duration-300">
                      bestuur@svsit.nl
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] opacity-60">
                      Email
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[var(--color-border)] mt-12 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-40">
                &copy; {new Date().getFullYear()} SIT — Studievereniging ICT
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-muted)] opacity-25">
                <span className="text-[var(--color-accent-green)]">
                  {"// "}
                </span>
                <span className="text-[var(--color-accent-blue)]">
                  built_with
                </span>
                {": "}
                <span className="text-[var(--color-accent-gold)]">
                  next.js
                </span>
                {" + "}
                <span className="text-[var(--color-accent-gold)]">
                  tailwind
                </span>
                {" + "}
                <span className="text-[var(--color-accent-gold)]">gsap</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top — terminal style */}
      <div
        className="relative z-10"
        style={{
          padding: "1rem 1.5rem",
          background:
            "linear-gradient(to right, transparent 10%, rgba(245, 158, 11, 0.03) 50%, transparent 90%)",
        }}
      >
        <div className="flex justify-center">
          <button
            onClick={scrollToTop}
            className="group font-mono text-xs text-[var(--color-text-muted)] opacity-40 hover:opacity-100 hover:text-[var(--color-accent-gold)] transition-all duration-300 cursor-pointer px-4 py-2"
          >
            <span className="text-[var(--color-accent-gold)] opacity-60">
              {"$ "}
            </span>
            scroll --to-top
            <span className="inline-block group-hover:-translate-y-1 transition-transform duration-300 ml-2">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
