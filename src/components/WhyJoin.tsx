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
      "Van tech talks tot kroegentochten. We organiseren events waar je bijleert, netwerkt, en plezier hebt.",
    accent: "var(--color-accent-gold)",
  },
  {
    number: "02",
    title: "Netwerk opbouwen",
    description:
      "Leer medestudenten, alumni en bedrijven kennen. Je netwerk begint hier.",
    accent: "var(--color-accent-blue)",
  },
  {
    number: "03",
    title: "Skills ontwikkelen",
    description:
      "Workshops, hackathons, en projecten die je CV sterker maken dan alleen je diploma.",
    accent: "var(--color-accent-red)",
  },
  {
    number: "04",
    title: "Maar 10 euro",
    description:
      "Eenmalig. Geen maandelijkse kosten. Geen verborgen fees. Gewoon lid voor je hele studietijd.",
    accent: "var(--color-accent-gold)",
  },
];

export default function WhyJoin() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item) => {
        if (!item) return;

        const number = item.querySelector(".reason-number");
        const title = item.querySelector(".reason-title");
        const desc = item.querySelector(".reason-desc");
        const line = item.querySelector(".reason-line");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: "power3.out" }
        )
          .fromTo(
            number,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
            0.1
          )
          .fromTo(
            title,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            0.2
          )
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
      className="relative pt-40 md:pt-56 pb-40 md:pb-56 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionLabel number="02" label="waarom lid worden" />

        {/* Stacked reasons list */}
        <div className="flex flex-col">
          {reasons.map((reason, i) => (
            <div
              key={reason.number}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="group relative cursor-default transition-transform duration-300 ease-out hover:translate-x-2"
            >
              {/* Top line */}
              <div
                className="reason-line h-[2px] w-full origin-left transition-all duration-300 group-hover:h-[3px]"
                style={{ background: `linear-gradient(to right, ${reason.accent} 0%, ${reason.accent}66 50%, transparent 100%)` }}
              />

              {/* Hover background glow */}
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 md:py-14">
                {/* Big number */}
                <div className="reason-number md:col-span-2 flex items-baseline gap-4">
                  <span
                    className="font-mono text-5xl md:text-7xl font-bold leading-none transition-all duration-300 group-hover:drop-shadow-[0_0_12px_currentColor]"
                    style={{ color: reason.accent }}
                  >
                    {reason.number}
                  </span>
                </div>

                {/* Title */}
                <div className="reason-title md:col-span-4 flex items-center">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300">
                    {reason.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="reason-desc md:col-span-5 md:col-start-8 flex items-center">
                  <p className="font-mono text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom line */}
          <div className="h-px w-full bg-[var(--color-border)]" />
        </div>
      </div>
    </section>
  );
}
