"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SectionLabel from "@/components/SectionLabel";

const TESTIMONIALS = [
  {
    quote:
      "Ik kwam binnen als eerstejaars die niemand kende. Nu zit ik in twee commissies, heb ik een hackathon gewonnen en ken ik de helft van de opleiding. SIT maakt je studie.",
    highlight: "twee commissies",
    name: "Matin",
    role: "Voorzitter",
    color: "var(--color-accent-gold)",
    span: "col-span-1 md:col-span-6",
  },
  {
    quote:
      "Bij de Evenementencommissie regel ik borrels voor 100+ mensen. Dat zet je op je CV en in je vriendengroep. Veel leerzamer dan het klinkt.",
    highlight: "CV en in je vriendengroep",
    name: "Idil",
    role: "Secretaris",
    color: "var(--color-accent-red)",
    span: "col-span-1 md:col-span-6",
  },
  {
    quote:
      "Workshops geven via EduCo gaf me het lef om voor een zaal te staan. Beste skill die ik hier opdeed.",
    highlight: "Beste skill",
    name: "Hugo",
    role: "Bestuurslid",
    color: "var(--color-accent-green)",
    span: "col-span-1 md:col-span-4",
  },
  {
    type: "discord" as const,
    span: "col-span-1 md:col-span-4",
  },
  {
    quote:
      "Game Night is mijn vaste vrijdag geworden. D&D campaign loopt al een heel jaar door.",
    highlight: "D&D campaign",
    name: "Riley",
    role: "Voorzitter GameIT",
    color: "var(--color-accent-red)",
    span: "col-span-1 md:col-span-4",
  },
];

function highlightText(text: string, highlight: string) {
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--color-text)] font-medium">{highlight}</span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

function DiscordCard() {
  return (
    <div className="h-full border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-red)] opacity-60" />
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] opacity-60" />
        </div>
        <span className="font-mono text-xs text-[var(--color-text)] ml-1">#algemeen</span>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-auto">SIT Discord</span>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-2.5 flex-1">
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-blue)]">wesley_dev</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">zou ik lid worden van SIT?</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-green)]">rosa</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">het is letterlijk 9,99 voor een heel jaar</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-blue)]">wesley_dev</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">say less, ik zit er al in</p>
        </div>
      </div>

      {/* Reactions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)] rounded-sm">14</span>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)] rounded-sm">9</span>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] px-2 py-0.5 border border-[var(--color-border)] rounded-sm">21</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".testi-card");
        cards.forEach((card) => {
          (card as HTMLElement).style.opacity = "1";
          (card as HTMLElement).style.transform = "none";
        });
      }
      return;
    }

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    const hasIdleCb = "requestIdleCallback" in window;
    const idleId: number = hasIdleCb
      ? window.requestIdleCallback(initGsap)
      : (setTimeout(initGsap, 1) as unknown as number);

    function initGsap() {
      if (cancelled) return;

      ctx = gsap.context(() => {
        if (!cardsRef.current) return;
        const cards = cardsRef.current.querySelectorAll(".testi-card");

        gsap.fromTo(
          Array.from(cards),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }, sectionRef);
    }

    return () => {
      cancelled = true;
      if (hasIdleCb) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245, 158, 11, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.015) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse 60% 50% at 70% 50%, black 10%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 70% 50%, black 10%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="04" label="wat zeggen leden" />

        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
            Van onze
            <br />
            <span className="text-[var(--color-accent-gold)]">community</span>
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {TESTIMONIALS.map((t, i) => {
            if ("type" in t && t.type === "discord") {
              return (
                <div key={i} className={`testi-card ${t.span}`}>
                  <DiscordCard />
                </div>
              );
            }

            const testi = t as typeof TESTIMONIALS[0] & { quote: string; name: string; role: string; color: string; highlight: string; isDocent?: boolean };

            return (
              <div key={i} className={`testi-card ${testi.span}`}>
                <div
                  className="h-full border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col"
                >
                  <span
                    className="font-display text-4xl leading-none mb-3 opacity-20"
                    style={{ color: testi.color }}
                  >
                    &ldquo;
                  </span>
                  <p className="font-mono text-sm leading-relaxed text-[var(--color-text-muted)] flex-1">
                    {highlightText(testi.quote, testi.highlight)}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-border)]">
                    {testi.isDocent ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold"
                        style={{ background: `${testi.color}20`, color: testi.color }}
                      >
                        DK
                      </div>
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: testi.color }}
                      />
                    )}
                    <div>
                      <span className="font-mono text-xs text-[var(--color-text)]">{testi.name}</span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2">{testi.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
