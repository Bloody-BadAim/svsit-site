"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const reasons = [
  {
    number: "01",
    title: "Events en activiteiten",
    description:
      "Van borrels en kroegentochten tot hackathons, game nights, CTF challenges en tech talks. Of je nu wil netwerken of gewoon een biertje drinken met je medestudenten.",
    accent: "var(--color-accent-gold)",
    code: "await sit.events.join('borrel');",
  },
  {
    number: "02",
    title: "Netwerk opbouwen",
    description:
      "Leer studenten uit alle richtingen kennen: Software Engineering, Cyber Security, Game Dev, Business IT en Technische Informatica. Plus alumni en bedrijven.",
    accent: "var(--color-accent-blue)",
    code: "const connections = await network.expand();",
  },
  {
    number: "03",
    title: "Skills ontwikkelen",
    description:
      "Win een CTF, bouw een AI project, pitch je startup idee, of organiseer een event. Dingen die op je CV knallen.",
    accent: "var(--color-accent-red)",
    code: "student.skills.push(...newSkills);",
  },
  {
    number: "04",
    title: "Maar 10 euro",
    description:
      "Eenmalig. Geen maandelijkse kosten. Lid voor het hele jaar. Inclusief toegang tot alle events en de SIT community.",
    accent: "var(--color-accent-green)",
    code: "const price = 10; // that's it",
  },
];

export default function WhyJoin() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      rowRefs.current.forEach((row) => {
        if (!row) return;

        const line = row.querySelector(".accent-line");
        const bigNum = row.querySelector(".big-number");
        const title = row.querySelector(".reason-title");
        const desc = row.querySelector(".reason-desc");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });

        // Line grows in
        tl.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.out" }
        )
          // Title slides up
          .fromTo(
            title,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            0.2
          )
          // Description fades in
          .fromTo(
            desc,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            0.35
          );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="whyjoin"
      className="relative pt-48 md:pt-64 pb-48 md:pb-64 px-6 md:px-12 lg:px-24"
    >
      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="02" label="waarom lid worden" />

        <div className="flex flex-col">
          {reasons.map((reason, i) => {
            const isEven = i % 2 === 1;

            return (
              <div
                key={reason.number}
                ref={(el) => { rowRefs.current[i] = el; }}
                className="group relative cursor-default"
              >
                {/* Accent gradient divider */}
                <div
                  className="accent-line h-[2px] w-3/5 group-hover:w-full origin-left transition-all duration-500"
                  style={{
                    background: `linear-gradient(to right, ${reason.accent} 0%, ${reason.accent}66 50%, transparent 100%)`,
                  }}
                />

                {/* Left accent bar — grows on hover */}
                <div
                  className="absolute left-0 top-0 w-[2px] h-0 group-hover:h-full transition-all duration-500"
                  style={{ background: reason.accent }}
                />

                {/* Row content */}
                <div className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
                  {/* Giant background number */}
                  <div
                    className="big-number absolute top-1/2 -translate-y-[60%] font-mono font-bold leading-none pointer-events-none select-none transition-all duration-500"
                    style={{
                      fontSize: "clamp(180px, 22vw, 320px)",
                      color: reason.accent,
                      opacity: 0.15,
                      ...(isEven
                        ? { left: "-2%" }
                        : { right: "-2%" }),
                    }}
                    // Use className for left/right positioning since inline style objects don't support responsive
                    data-side={isEven ? "left" : "right"}
                  >
                    {reason.number}
                  </div>

                  {/* Content grid — alternating sides */}
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    <div
                      className={`flex flex-col gap-5 ${isEven
                          ? "md:col-span-6 md:col-start-7"
                          : "md:col-span-6 md:col-start-1"
                        }`}
                    >
                      {/* Title */}
                      <h3 className="reason-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] transition-transform duration-300 group-hover:translate-x-2">
                        {reason.title}
                      </h3>

                      {/* Description */}
                      <p className="reason-desc font-mono text-sm md:text-base leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors duration-300 max-w-lg">
                        {reason.description}
                      </p>

                      {/* Code line — appears on hover */}
                      <div
                        className="font-mono text-xs mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                        style={{ color: reason.accent }}
                      >
                        <span className="text-[var(--color-text-muted)] opacity-40">
                          {">"}{" "}
                        </span>
                        {reason.code}
                        <span
                          className="inline-block w-[6px] h-[12px] ml-1 align-middle animate-pulse"
                          style={{ background: reason.accent }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom line */}
          <div className="h-px w-full bg-[var(--color-border)]" />

          {/* Error decoration */}
          <p className="font-mono text-xs text-[var(--color-accent-red)] opacity-30 mt-6">
            {"// FIXME: waarom is iedereen zo gemotiveerd"}
          </p>
        </div>
      </div>

      {/* CSS for number positioning since Tailwind can't do responsive inline styles */}
      <style>{`
        .big-number {
          text-shadow: none;
          transition: text-shadow 0.3s ease, opacity 0.5s ease;
        }
        .group:hover .big-number {
          text-shadow: 0 0 40px currentColor;
          opacity: 0.25 !important;
        }
        .big-number[data-side="right"] {
          right: -2%;
        }
        .big-number[data-side="left"] {
          left: -2%;
        }
        @media (min-width: 768px) {
          .big-number[data-side="right"] {
            right: 0;
          }
          .big-number[data-side="left"] {
            left: 0;
          }
        }
      `}</style>
    </section>
  );
}
