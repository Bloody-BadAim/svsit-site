"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import SectionLabel from "@/components/SectionLabel";
import { SITE_CONFIG } from "@/lib/constants";
import { isReducedMotion, onMotionChange } from "@/lib/motion";

const TESTIMONIALS = [
  {
    key: "matin",
    name: "Matin",
    color: "var(--color-accent-gold)",
    span: "col-span-1 md:col-span-6",
  },
  {
    key: "idil",
    name: "Idil",
    color: "var(--color-accent-red)",
    span: "col-span-1 md:col-span-6",
  },
  {
    key: "hugo",
    name: "Hugo",
    color: "var(--color-accent-green)",
    span: "col-span-1 md:col-span-4",
  },
  {
    type: "discord" as const,
    span: "col-span-1 md:col-span-4",
  },
  {
    key: "riley",
    name: "Riley",
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
  const t = useTranslations("testimonials");
  return (
    <div className="h-full border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-red)] opacity-60" />
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)] opacity-60" />
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] opacity-60" />
        </div>
        <span className="font-mono text-xs text-[var(--color-text)] ml-1">{t("discord.channel")}</span>
        <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-auto">{t("discord.server")}</span>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-2.5 flex-1">
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-blue)]">wesley_dev</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{t("discord.msg1")}</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-green)]">rosa</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{t("discord.msg2", { price: SITE_CONFIG.membership.price })}</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-[var(--color-accent-blue)]">wesley_dev</span>
          <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{t("discord.msg3")}</p>
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
  const t = useTranslations("testimonials");
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    let hasIdleCb = false;
    let idleId: number | null = null;

    // Cards niet pre-hidden in JSX; fromTo verbergt alleen tijdens de tween.
    // Bij reduced (of een onderbroken live-tween) expliciet zichtbaar zetten.
    function showAll() {
      if (!cardsRef.current) return;
      const cards = cardsRef.current.querySelectorAll(".testi-card");
      gsap.set(Array.from(cards), {
        opacity: 1,
        y: 0,
        clearProps: "transform",
      });
    }

    function setup() {
      cancelled = false;

      if (isReducedMotion()) {
        showAll();
        return;
      }

      hasIdleCb = "requestIdleCallback" in window;
      idleId = hasIdleCb
        ? window.requestIdleCallback(initGsap)
        : (setTimeout(initGsap, 1) as unknown as number);
    }

    function teardown() {
      cancelled = true;
      if (idleId !== null) {
        if (hasIdleCb) {
          window.cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId);
        }
        idleId = null;
      }
      ctx?.revert();
      ctx = null;
    }

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

    setup();

    const unsubscribe = onMotionChange(() => {
      teardown();
      setup();
    });

    return () => {
      unsubscribe();
      teardown();
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
        <SectionLabel number="05" label={t("label")} />

        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
            {t("headingLine1")}
            <br />
            <span className="text-[var(--color-accent-gold)]">{t("headingLine2")}</span>
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {TESTIMONIALS.map((item, i) => {
            if ("type" in item && item.type === "discord") {
              return (
                <div key={i} className={`testi-card ${item.span}`}>
                  <DiscordCard />
                </div>
              );
            }

            const testi = item as { key: string; name: string; color: string; span: string };
            const quote = t(`items.${testi.key}.quote`);
            const highlight = t(`items.${testi.key}.highlight`);
            const role = t(`items.${testi.key}.role`);

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
                    {highlightText(quote, highlight)}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--color-border)]">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: testi.color }}
                    />
                    <div>
                      <span className="font-mono text-xs text-[var(--color-text)]">{testi.name}</span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] ml-2">{role}</span>
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
