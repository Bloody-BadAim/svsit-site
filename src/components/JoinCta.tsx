"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";
import HoldToJoinButton from "@/components/HoldToJoinButton";
import MemberCard from "@/components/MemberCard";
import { SITE_CONFIG } from "@/lib/constants";
import { isReducedMotion, onMotionChange } from "@/lib/motion";

export default function JoinCta() {
  const t = useTranslations("joinCta");
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    let hasIdleCb = false;
    let idleId: number | null = null;

    // De reveal-targets gebruiken autoAlpha (opacity + visibility). Niet
    // pre-hidden in JSX, maar een halverwege onderbroken tween (live toggle)
    // kan visibility:hidden achterlaten -> expliciet terug naar zichtbaar.
    function showAll() {
      const targets: Element[] = [];
      if (leftRef.current) {
        targets.push(...Array.from(leftRef.current.querySelectorAll("[data-animate]")));
      }
      if (cardRef.current) targets.push(cardRef.current);
      if (targets.length) {
        gsap.set(targets, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          clearProps: "transform",
        });
      }
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
        const sectionTrigger = {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none" as const,
          once: true,
        };

        if (leftRef.current) {
          const els = leftRef.current.querySelectorAll("[data-animate]");
          gsap.fromTo(
            Array.from(els),
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.1,
              scrollTrigger: sectionTrigger,
            }
          );
        }

        if (cardRef.current) {
          gsap.fromTo(
            cardRef.current,
            { autoAlpha: 0, y: 40, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: sectionTrigger,
              delay: 0.2,
            }
          );
        }
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
      id="join"
      className="relative flex items-center overflow-hidden py-24 md:py-32 px-6 md:px-12 lg:px-24"
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242, 158, 24, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(242, 158, 24, 0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "20%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(242, 158, 24, 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "joinPulse 6s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-bg)]/70 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <SectionLabel number="07" label={t("label")} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mt-8">
          {/* Left: pitch */}
          <div ref={leftRef}>
            <div data-animate className="flex items-center gap-2 mb-8">
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]"
                style={{ animation: "statusPulse 1.5s ease-in-out infinite" }}
              />
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {t("status")}
              </span>
            </div>

            <div data-animate>
              <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight uppercase">
                {t("headingLine1")}
                <br />
                <span className="text-[var(--color-accent-gold)]">{t("headingLine2")}</span>
              </h2>
            </div>

            <p data-animate className="font-mono text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed mt-6 max-w-lg">
              {t("pitchPre")}{" "}
              <span className="text-[var(--color-text)]">{t("pitchHbo")}</span>{" "}
              {t("pitchPost")}
            </p>

            <div data-animate className="mt-10">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl md:text-6xl font-bold text-[var(--color-accent-gold)]">
                  {SITE_CONFIG.membership.priceLabel}
                </span>
                <span className="font-mono text-sm text-[var(--color-text-muted)]">
                  {t("priceSuffix")}
                </span>
              </div>
            </div>

            <ul data-animate className="mt-8 flex flex-col gap-2.5">
              {[
                t("perks.events"),
                t("perks.committees"),
                t("perks.network", { members: SITE_CONFIG.stats.members }),
                t("perks.tools"),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-mono text-sm text-[var(--color-text-muted)]">
                  <span className="text-[var(--color-accent-green)] mt-0.5 shrink-0">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: clean member card */}
          <div ref={cardRef} className="flex justify-center lg:justify-end">
            <MemberCard
              className="w-full max-w-[400px]"
              data={{
                name: t("cardName"),
                role: 'member',
                commissie: null,
                total_xp: 0,
                skin: 'skin_default',
                activeBadges: [],
                dynamicStats: { code: 0, social: 0, career: 0, game: 0 },
              }}
              equipment={{
                frameColor: 'var(--color-accent-gold)',
                accentColor: 'var(--color-accent-gold)',
                stickers: [],
              }}
            >
              <HoldToJoinButton href="/lid-worden" />
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] opacity-40 mt-3 text-center">
                {t("social", { members: SITE_CONFIG.stats.members })}
              </p>
              <p className="font-mono text-[11px] text-[var(--color-text-muted)] mt-2 text-center">
                {t("alreadyMember")}{" "}
                <a href="/login" className="text-[var(--color-accent-blue)] hover:underline">{t("login")}</a>
                {" · "}
                <a href="/over-ons" className="text-[var(--color-accent-gold)] hover:underline">{t("viewCommittees")}</a>
              </p>
            </MemberCard>
          </div>
        </div>
      </div>
    </section>
  );
}
