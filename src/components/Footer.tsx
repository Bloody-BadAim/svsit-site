"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SitLogo from "@/components/SitLogo";

gsap.registerPlugin(ScrollTrigger);

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

/* ─── Rotating dev jokes for the return comment ─── */

const devJokes = [
  "// einde van de pagina. begin van jouw SIT verhaal.",
  "// 404: meer content not found",
  "// git commit -m 'footer finally perfect'",
  "// HACK: deze footer is mooier dan onze code",
  "// TODO: meer Easter eggs verstoppen",
  "// console.log('bedankt voor het scrollen!');",
];

/* ─── Footer Component ─── */

export default function Footer() {
  const [joke, setJoke] = useState(devJokes[0]);
  const returnRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pick random joke on mount
    setJoke(devJokes[Math.floor(Math.random() * devJokes.length)]);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      /* ── Return 0 animation ── */
      if (returnRef.current) {
        const text = returnRef.current.querySelector(".return-text");
        const comment = returnRef.current.querySelector(".return-comment");
        const footerRect = returnRef.current.getBoundingClientRect();
        const alreadyVisible = footerRect.top < window.innerHeight;

        if (alreadyVisible) {
          gsap.set([text, comment], { opacity: 1, y: 0 });
        } else {
          gsap.fromTo(
            text,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: returnRef.current,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
          gsap.fromTo(
            comment,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: returnRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      /* ── Content columns animation ── */
      if (contentRef.current) {
        const cols = contentRef.current.querySelectorAll(".footer-col");
        const contentRect = contentRef.current.getBoundingClientRect();
        const contentVisible = contentRect.top < window.innerHeight;

        if (contentVisible) {
          gsap.set(cols, { opacity: 1, y: 0 });
        } else {
          gsap.fromTo(
            cols,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: contentRef.current,
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      /* ── Diagonal streaks subtle parallax ── */
      if (streaksRef.current) {
        gsap.to(streaksRef.current, {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: streaksRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, returnRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="footer"
      className="relative z-[1] mt-16 md:mt-24 overflow-hidden"
      style={{
        background: "var(--color-surface)",
      }}
    >
      {/* ── Gradient top border ── */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(to right, transparent 5%, var(--color-accent-gold) 30%, var(--color-accent-blue) 70%, transparent 95%)",
          opacity: 0.5,
        }}
      />

      {/* ── Diagonal color streaks (from Figma brand kit) ── */}
      <div
        ref={streaksRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Left streak group */}
        <div
          className="absolute -left-12 -top-20 w-[500px] h-[150%]"
          style={{ transform: "rotate(-25deg)" }}
        >
          <div className="absolute left-0 w-[8px] h-full rounded-sm bg-[var(--color-accent-blue)] opacity-[0.04]" />
          <div className="absolute left-[35px] w-[6px] h-full rounded-sm bg-[var(--color-accent-green)] opacity-[0.05]" />
          <div className="absolute left-[65px] w-[10px] h-full rounded-sm bg-[var(--color-accent-red)] opacity-[0.06]" />
          <div className="absolute left-[88px] w-[5px] h-full rounded-sm bg-[var(--color-accent-gold)] opacity-[0.07]" />
          <div className="absolute left-[102px] w-[3px] h-full rounded-sm bg-[var(--color-accent-red)] opacity-[0.03]" />
        </div>

        {/* Right echo streaks (fainter) */}
        <div
          className="absolute -right-8 -top-32 w-[300px] h-[150%]"
          style={{ transform: "rotate(-25deg)" }}
        >
          <div className="absolute left-0 w-[5px] h-full rounded-sm bg-[var(--color-accent-blue)] opacity-[0.02]" />
          <div className="absolute left-[25px] w-[4px] h-full rounded-sm bg-[var(--color-accent-green)] opacity-[0.025]" />
          <div className="absolute left-[48px] w-[6px] h-full rounded-sm bg-[var(--color-accent-red)] opacity-[0.03]" />
          <div className="absolute left-[68px] w-[3px] h-full rounded-sm bg-[var(--color-accent-gold)] opacity-[0.035]" />
        </div>
      </div>

      {/* ── "return 0;" statement ── */}
      <div className="relative z-10 py-16 md:py-24 px-6 md:px-12 lg:px-24">
        <div ref={returnRef} className="max-w-[1400px] mx-auto">
          <span className="return-text block font-mono text-5xl md:text-7xl lg:text-8xl font-bold leading-none">
            <span className="text-[var(--color-accent-blue)] opacity-50">
              return{" "}
            </span>
            <span className="text-[var(--color-accent-gold)]">0</span>
            <span className="text-[var(--color-text-muted)] opacity-40">;</span>
          </span>
          <p className="return-comment font-mono text-sm text-[var(--color-accent-green)] mt-3 opacity-50">
            {joke}
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="relative z-10 h-px mx-6 md:mx-12 lg:mx-24"
        style={{
          background:
            "linear-gradient(to right, var(--color-border), var(--color-border), transparent)",
        }}
      />

      {/* ── Main footer content ── */}
      <div
        ref={contentRef}
        className="relative z-10 px-6 md:px-12 lg:px-24 py-12 md:py-16"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* ── Logo + tagline ── */}
            <div className="footer-col md:col-span-4">
              <SitLogo size={36} showCrosses />
              <p className="font-mono text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed max-w-xs">
                De studievereniging voor HBO-ICT studenten aan de Hogeschool van
                Amsterdam.
              </p>
              <p className="font-mono text-xs text-[var(--color-text-muted)] opacity-40 mt-2">
                Onderdeel van FDMCI · KvK geregistreerd · Sinds 2015
              </p>
            </div>

            {/* ── Navigation ── */}
            <div className="footer-col md:col-span-2 md:col-start-6">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase mb-5 block">
                NAVIGATIE
              </span>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/#about", label: "over sit" },
                  { href: "/#events", label: "events" },
                  { href: "/over-ons", label: "bestuur" },
                  { href: "/#join", label: "word lid", accent: true },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`group/link font-mono text-sm hover:translate-x-2 transition-all duration-300 ${
                      link.accent
                        ? "text-[var(--color-accent-gold)] hover:text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span className="text-[var(--color-accent-gold)] opacity-0 group-hover/link:opacity-60 transition-opacity duration-300 mr-1">
                      {link.accent ? ">" : "//"}
                    </span>
                    {link.label}
                    {link.accent && <span className="ml-1">()</span>}
                  </a>
                ))}
              </nav>
            </div>

            {/* ── Contact ── */}
            <div className="footer-col md:col-span-2">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase mb-5 block">
                CONTACT
              </span>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] hover:translate-x-1 transition-all duration-300"
                >
                  bestuur@svsit.nl
                </a>
                <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-40 mt-2">
                  WBH · Wibautstraat 3b
                </span>
                <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-40">
                  1091 GH Amsterdam
                </span>
              </div>
            </div>

            {/* ── Social Media — PROMINENT social cards ── */}
            <div className="footer-col md:col-span-3 md:col-start-10">
              <span className="font-mono text-[10px] text-[var(--color-accent-gold)] tracking-[0.3em] uppercase mb-5 block">
                VOLG ONS
              </span>
              <div className="flex flex-col gap-3">
                {/* Instagram card */}
                <a
                  href="https://instagram.com/svsit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-gold)] transition-colors duration-300">
                    <InstagramIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-gold)] transition-colors duration-300">
                      @svsit
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-60">
                      Instagram
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>

                {/* LinkedIn card */}
                <a
                  href="https://linkedin.com/company/svsit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/social flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-blue)] transition-colors duration-300">
                    <LinkedInIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-blue)] transition-colors duration-300">
                      Studievereniging ICT
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-60">
                      LinkedIn
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>

                {/* Email card */}
                <a
                  href="mailto:bestuur@svsit.nl"
                  className="group/social flex items-center gap-3 px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/5 transition-all duration-300"
                >
                  <span className="text-[var(--color-text-muted)] group-hover/social:text-[var(--color-accent-green)] transition-colors duration-300">
                    <MailIcon />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-[var(--color-text)] group-hover/social:text-[var(--color-accent-green)] transition-colors duration-300">
                      bestuur@svsit.nl
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-60">
                      Email
                    </span>
                  </div>
                  <span className="ml-auto font-mono text-xs text-[var(--color-text-muted)] opacity-0 group-hover/social:opacity-60 transition-opacity duration-300">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="mt-12 pt-6 border-t border-[var(--color-border)]">
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

      {/* ── Scroll to top ── */}
      <div
        className="relative z-10 py-4 px-6"
        style={{
          background:
            "linear-gradient(to right, transparent 10%, rgba(245, 158, 11, 0.03) 50%, transparent 90%)",
        }}
      >
        <div className="flex justify-center">
          <button
            onClick={scrollToTop}
            className="group font-mono text-xs text-[var(--color-text-muted)] opacity-40 hover:opacity-100 hover:text-[var(--color-accent-gold)] transition-all duration-300 cursor-pointer py-2 px-4"
          >
            <span className="text-[var(--color-accent-gold)] opacity-60">
              {"$ "}
            </span>
            scroll --to-top
            <span className="ml-2 inline-block group-hover:-translate-y-1 transition-transform duration-300">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
