"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import SectionLabel from "@/components/SectionLabel";
import { CardSpotlight } from "@/components/ui/CardSpotlight";
import { SITE_CONFIG } from "@/lib/constants";
import { isReducedMotion, onMotionChange } from "@/lib/motion";

const achievements = [
  {
    key: "events",
    stat: "20+",
    statLabelKey: "perJaar",
    color: "#F29E18",
    rgb: [242, 158, 24] as number[],
  },
  {
    key: "network",
    stat: "5",
    statLabelKey: "specialisaties",
    color: "#3B82F6",
    rgb: [59, 130, 246] as number[],
  },
  {
    key: "skills",
    stat: "∞",
    statLabelKey: "mogelijkheden",
    color: "#EF4444",
    rgb: [239, 68, 68] as number[],
  },
  {
    key: "price",
    stat: SITE_CONFIG.membership.priceLabel,
    statLabelKey: "perJaar",
    color: "#22C55E",
    rgb: [34, 197, 94] as number[],
  },
] as const;

function AchievementRing({
  number,
  color,
  size = 72,
}: {
  number: number;
  color: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        aria-hidden="true"
        style={{ boxShadow: `0 0 20px ${color}30, 0 0 40px ${color}15` }}
      />
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={0}
          className="achievement-ring"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold"
        style={{ color }}
      >
        {String(number).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function WhyJoin() {
  const t = useTranslations("whyJoin");
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    let hasIdleCb = false;
    let idleId: number | null = null;

    // Zet alle reveal-targets in hun finale ZICHTBARE staat. De cards zijn
    // niet pre-hidden in JSX, maar als een tween halverwege liep (live toggle)
    // dan moeten opacity/transform/ring/stat terug naar zichtbaar.
    function showAll() {
      if (!cardsRef.current) return;
      const cards = cardsRef.current.querySelectorAll(".achievement-card");
      gsap.set(Array.from(cards), {
        opacity: 1,
        x: 0,
        y: 0,
        clearProps: "transform",
      });
      const rings = cardsRef.current.querySelectorAll(".achievement-ring");
      gsap.set(Array.from(rings), { strokeDashoffset: 0 });
      // Stat-counters terug naar hun eind-tekst
      const stats = cardsRef.current.querySelectorAll<HTMLElement>(".stat-value");
      stats.forEach((statEl) => {
        const rawStat = statEl.getAttribute("data-stat") || "";
        statEl.textContent = rawStat;
      });
    }

    function setup() {
      cancelled = false;

      if (isReducedMotion()) {
        showAll();
        return;
      }

      // Defer ScrollTrigger setup until after first paint to avoid
      // forced reflows from layout property reads during initial render
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
        const cards = cardsRef.current.querySelectorAll(".achievement-card");

        cards.forEach((card, i) => {
          const fromX = i % 2 === 0 ? -40 : 40;

          gsap.fromTo(
            card,
            { opacity: 0, x: fromX, y: 20 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none",
                once: true,
              },
              delay: i * 0.08,
            }
          );

          // Ring fill
          const ring = card.querySelector(".achievement-ring");
          if (ring) {
            const size = 72;
            const r = (size - 8) / 2;
            const circ = 2 * Math.PI * r;
            gsap.fromTo(
              ring,
              { strokeDashoffset: circ },
              {
                strokeDashoffset: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  toggleActions: "play none none none",
                  once: true,
                },
                delay: 0.3 + i * 0.08,
              }
            );
          }

          // Stat counter
          const statEl = card.querySelector(".stat-value") as HTMLElement | null;
          if (statEl) {
            const rawStat = statEl.getAttribute("data-stat") || "";
            let target = 0;
            let prefix = "";
            let suffix = "";

            if (rawStat === "20+") {
              target = 20;
              suffix = "+";
            } else if (rawStat === "5") {
              target = 5;
            }

            if (target > 0) {
              const proxy = { val: 0 };
              gsap.to(proxy, {
                val: target,
                snap: { val: 1 },
                duration: target > 10 ? 1.5 : 1.2,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  toggleActions: "play none none none",
                  once: true,
                },
                delay: 0.4 + i * 0.08,
                onUpdate() {
                  statEl.textContent = prefix + proxy.val + suffix;
                },
              });
            }
          }
        });
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
      id="whyjoin"
      className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      <div className="absolute inset-0 bg-[var(--color-bg)]/70" />

      {/* Background depth glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 600px 600px at 20% 50%, rgba(245, 158, 11, 0.04), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 600px 600px at 80% 85%, rgba(59, 130, 246, 0.03), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionLabel number="02" label={t("sectionLabel")} />

        <div className="mb-8 md:mb-12">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.1]">
            {t("headingLine1")}
            <br />
            <span className="text-[var(--color-accent-gold)]">{t("headingLine2")}</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-text-muted)] mt-4">
            {t("subtitle")}
          </p>
        </div>

        {/* 2×2 CardSpotlight grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {achievements.map((a, i) => (
            <div key={a.key} className="achievement-card">
              <CardSpotlight
                color={`${a.color}18`}
                radius={300}
                revealColors={[a.rgb]}
                className="h-full p-8 border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {/* Top row: ring + stat */}
                <div className="relative z-20 flex items-start justify-between mb-6">
                  <AchievementRing number={i + 1} color={a.color} size={72} />
                  <div className="flex flex-col items-end">
                    <span
                      className="stat-value font-mono text-3xl md:text-4xl font-bold leading-none"
                      style={{ color: a.color }}
                      data-stat={a.stat}
                    >
                      {a.stat}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">
                      {t(`statLabels.${a.statLabelKey}`)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="relative z-20 font-display text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight mb-3">
                  {t(`cards.${a.key}.title`)}
                </h3>

                {/* Description */}
                <p className="relative z-20 font-mono text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {t(`cards.${a.key}.desc`, { price: SITE_CONFIG.membership.priceLabel })}
                </p>

                {/* Bottom accent line */}
                <div
                  className="relative z-20 mt-6 h-px w-12"
                  style={{ background: `${a.color}40` }}
                  aria-hidden="true"
                />
              </CardSpotlight>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
