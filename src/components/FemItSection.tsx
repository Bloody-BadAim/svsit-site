"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Sparkles,
  Users,
  Gamepad2,
  Lightbulb,
  Coffee,
  UtensilsCrossed,
} from "lucide-react";
import { isReducedMotion, onMotionChange } from "@/lib/motion";

// ---------------------------------------------------------------------------
// FemItSection - SIT geeft FemIT een echt podium. FemIT is het vrouwennetwerk
// van HBO-ICT. Dit is een eigen kleur-moment: paars/indigo (#5B2BD6) als accent
// naast het SIT-goud. Links het logo op een zacht paars glow-veld, rechts de
// copy met headline, intro, activiteiten-chips en een CTA naar de HvA/LinkedIn.
// Reduced motion: eindstaat is altijd zichtbaar; animatie wordt overgeslagen.
// ---------------------------------------------------------------------------

const FEMIT_PURPLE = "#5B2BD6";
const FEMIT_PURPLE_SOFT = "#7C4DEE";

const ACTIVITEITEN = [
  { label: "FemIT Visits", Icon: Users },
  { label: "FemIT Gameplay", Icon: Gamepad2 },
  { label: "FemIT Inspire", Icon: Lightbulb },
  { label: "FemIT Get Together", Icon: Coffee },
  { label: "FemIT Cook-off", Icon: UtensilsCrossed },
];

export default function FemItSection() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const update = () => setReduced(isReducedMotion());
    update();
    return onMotionChange(update);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const shown = reduced || inView;
  const ease = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 lg:px-24 py-16 md:py-20"
      aria-labelledby="femit-heading"
    >
      <div
        className="relative mx-auto max-w-7xl overflow-hidden border bg-[var(--color-surface)]"
        style={{
          borderColor: shown
            ? "rgba(123,77,238,0.35)"
            : "var(--color-border)",
          boxShadow: shown
            ? `0 0 60px -20px ${FEMIT_PURPLE}80`
            : "none",
          opacity: shown ? 1 : 0,
          transform: shown || reduced ? "translateY(0)" : "translateY(20px)",
          transition: reduced
            ? undefined
            : `opacity 0.7s ${ease}, transform 0.7s ${ease}, border-color 0.9s ${ease}, box-shadow 0.9s ${ease}`,
        }}
      >
        {/* Zacht paars licht in de hoek, eigen kleur-moment naast SIT-goud */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full blur-[80px]"
          style={{
            background: `radial-gradient(circle, ${FEMIT_PURPLE}55, transparent 70%)`,
            opacity: shown ? 1 : 0,
            transition: reduced ? undefined : `opacity 1s ${ease} 0.2s`,
          }}
        />

        <div className="relative grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-10 p-7 md:p-10 lg:p-12">
          {/* ---- Logo op paars glow-veld ---- */}
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute h-44 w-44 md:h-52 md:w-52 rounded-full blur-[40px]"
              style={{
                background: `radial-gradient(circle, ${FEMIT_PURPLE_SOFT}45, transparent 70%)`,
              }}
            />
            <div
              className="relative border bg-[var(--color-bg)] p-6 md:p-8"
              style={{ borderColor: "rgba(123,77,238,0.4)" }}
            >
              {/* Scherpe paarse hoek-tikken */}
              <span
                aria-hidden="true"
                className="absolute -top-px -left-px h-3 w-3 border-t border-l"
                style={{ borderColor: FEMIT_PURPLE_SOFT }}
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-px -right-px h-3 w-3 border-b border-r"
                style={{ borderColor: FEMIT_PURPLE_SOFT }}
              />
              <Image
                src="/femit-logo.png"
                alt="FemIT - vrouwennetwerk van HBO-ICT"
                width={200}
                height={200}
                className="h-auto w-[140px] md:w-[170px]"
                priority={false}
              />
            </div>
          </div>

          {/* ---- Copy ---- */}
          <div className="flex flex-col gap-5">
            {/* Mono eyebrow in paars */}
            <div className="flex items-center gap-3">
              <Sparkles
                className="h-4 w-4"
                style={{ color: FEMIT_PURPLE_SOFT }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: FEMIT_PURPLE_SOFT }}
              >
                {"> partner.netwerk"}
              </span>
              <span
                className="h-px w-10"
                style={{ backgroundColor: FEMIT_PURPLE_SOFT }}
              />
            </div>

            <h2
              id="femit-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] tracking-tight uppercase leading-[0.92]"
            >
              FemIT
              <span
                className="block text-base md:text-lg font-bold tracking-tight normal-case mt-2"
                style={{ color: FEMIT_PURPLE_SOFT }}
              >
                Het vrouwennetwerk van HBO-ICT
              </span>
            </h2>

            {/* Intro: korte zinnen, geen streepjes, weinig komma's */}
            <p className="max-w-lg text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
              FemIT is dé community voor vrouwen in HBO-ICT. Hier vind je elkaar
              groei je samen en voel je je thuis in tech. Denk aan workshops
              inspiratie en gewoon lekker chillen met je mensen. Bekroond met de
              HvAll Inclusive Award. SIT werkt er met trots mee samen.
            </p>

            {/* Activiteiten als chips */}
            <ul className="flex flex-wrap gap-2" aria-label="FemIT activiteiten">
              {ACTIVITEITEN.map(({ label, Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs text-[var(--color-text)]"
                  style={{
                    borderColor: "rgba(123,77,238,0.3)",
                    backgroundColor: "rgba(91,43,214,0.08)",
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: FEMIT_PURPLE_SOFT }}
                    aria-hidden="true"
                  />
                  {label}
                </li>
              ))}
            </ul>

            {/* CTA naar HvA-pagina */}
            <div>
              <a
                href="https://www.hva.nl/opleidingen/hbo-ict/verhalen/femit"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text)] transition-colors"
                style={{
                  borderColor: FEMIT_PURPLE_SOFT,
                  backgroundColor: "rgba(91,43,214,0.12)",
                }}
              >
                Ontdek FemIT
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: FEMIT_PURPLE_SOFT }}
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
