"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const returnRef = useRef<HTMLDivElement>(null);

  // GSAP: animate "return 0;" on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (returnRef.current) {
        const text = returnRef.current.querySelector(".return-text");
        const comment = returnRef.current.querySelector(".return-comment");

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
              start: "top 85%",
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
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, returnRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="relative border-t border-[var(--color-border)]">
        {/* Giant "return 0;" statement */}
        <div className="py-24 md:py-32 px-6 md:px-12 lg:px-24 border-b border-[var(--color-border)]">
          <div ref={returnRef} className="max-w-[1400px] mx-auto">
            <span className="return-text block font-mono text-6xl md:text-8xl lg:text-9xl font-bold leading-none">
              <span className="text-[var(--color-text-muted)] opacity-40">return </span>
              <span className="text-[var(--color-accent-gold)]">0</span>
              <span className="text-[var(--color-text-muted)] opacity-40">;</span>
            </span>
            <p className="return-comment font-mono text-sm text-[var(--color-accent-green)] mt-6 opacity-50">
              {"// einde van de pagina. begin van jouw SIT verhaal."}
            </p>
          </div>
        </div>

        {/* Institutional one-liner */}
        <div className="border-b border-[var(--color-border)] py-4 px-6 md:px-12 lg:px-24">
          <p className="font-mono text-[10px] text-[var(--color-text-muted)] text-center uppercase tracking-[0.2em] opacity-40">
            Onderdeel van FDMCI · Hogeschool van Amsterdam · KvK geregistreerd · Sinds 2015
          </p>
        </div>

        <div className="px-6 md:px-12 lg:px-24 py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-24">
              {/* Left: Logo + tagline */}
              <div>
                <span className="font-mono text-2xl font-bold">
                  <span className="text-[var(--color-accent-gold)]">{"{"}</span>
                  <span className="text-[var(--color-text)]">SIT</span>
                  <span className="text-[var(--color-accent-gold)]">{"}"}</span>
                </span>
                <div className="font-mono text-xs text-[var(--color-text-muted)] mt-4 space-y-1 leading-relaxed">
                  <p>Studievereniging ICT</p>
                  <p>Hogeschool van Amsterdam</p>
                  <p className="mt-2 opacity-60">Door studenten, voor studenten.</p>
                </div>
              </div>

              {/* Middle: Links */}
              <div>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)] tracking-[0.25em] uppercase mb-6 block opacity-40 font-medium">
                  LINKS
                </span>
                <nav className="flex flex-col gap-2.5">
                  <a href="#about" className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300">
                    <span className="text-[var(--color-accent-gold)] opacity-0 group-hover/link:opacity-60 transition-opacity duration-300 mr-1">{"// "}</span>
                    over_sit
                  </a>
                  <a href="#events" className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300">
                    <span className="text-[var(--color-accent-gold)] opacity-0 group-hover/link:opacity-60 transition-opacity duration-300 mr-1">{"// "}</span>
                    events
                  </a>
                  <a href="#bestuur" className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300">
                    <span className="text-[var(--color-accent-gold)] opacity-0 group-hover/link:opacity-60 transition-opacity duration-300 mr-1">{"// "}</span>
                    bestuur
                  </a>
                  <a href="#join" className="group/link font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] hover:translate-x-3 transition-all duration-300">
                    <span className="opacity-0 group-hover/link:opacity-60 transition-opacity duration-300 mr-1">{">"}</span>
                    word_lid()
                  </a>
                </nav>
              </div>

              {/* Right: Contact */}
              <div>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)] tracking-[0.25em] uppercase mb-6 block opacity-40 font-medium">
                  CONTACT
                </span>
                <div className="flex flex-col gap-2.5">
                  <a
                    href="mailto:bestuur@svsit.nl"
                    className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300"
                  >
                    bestuur@svsit.nl
                  </a>
                  <a
                    href="https://instagram.com/svsit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300"
                  >
                    @svsit — Instagram
                  </a>
                  <a
                    href="https://linkedin.com/company/svsit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] hover:translate-x-3 transition-all duration-300"
                  >
                    @svsit — LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-40">
                  &copy; {new Date().getFullYear()} SIT — Studievereniging ICT
                </span>
                <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-30">
                  <span className="text-[var(--color-accent-green)]">{"// "}</span>
                  {"built_with: 'next.js' | tailwind | gsap"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to top — terminal command */}
        <div className="border-t border-[var(--color-border)] py-4 px-6">
          <div className="flex justify-center">
            <button
              onClick={scrollToTop}
              className="group font-mono text-xs text-[var(--color-text-muted)] opacity-40 hover:opacity-100 hover:text-[var(--color-accent-gold)] transition-all duration-300 cursor-pointer"
            >
              <span className="text-[var(--color-accent-gold)] opacity-60">{"$ "}</span>
              git checkout HEAD~999
              <span className="ml-2 inline-block group-hover:animate-bounce">↑</span>
            </button>
          </div>
        </div>
    </footer>
  );
}
