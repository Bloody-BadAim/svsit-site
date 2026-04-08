"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";

// Lazy-load non-LCP-critical components to avoid blocking initial paint
const GlowEffect = lazy(() =>
  import("@/components/ui/GlowEffect").then((m) => ({ default: m.GlowEffect }))
);
const MagneticHero = lazy(
  () => import("@/components/heroAnimations/MagneticHero")
);

/* ── Stat counter data ── */
const STATS = [
  { value: 200, suffix: "+", label: "leden" },
  { value: 50, suffix: "+", label: "events" },
  { value: 7, suffix: "", label: "commissies" },
  { value: 11, suffix: "", label: "besturen" },
];

/* ── Animated counter hook (counts up on mount, CSS fallback shows final value) ── */
function useCounter(target: number, duration = 1800, delay = 1200) {
  const [count, setCount] = useState(target); // SSR: show final value
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setCount(0);
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  return count;
}

function StatCounter({ value, suffix, label, index }: { value: number; suffix: string; label: string; index: number }) {
  const count = useCounter(value, 1800, 1200 + index * 200);
  return (
    <div
      className={`flex flex-col items-center gap-1 opacity-0 animate-[fadeIn_0.6s_ease_forwards]`}
      style={{ animationDelay: `${1.2 + index * 0.15}s` }}
    >
      <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text)] tabular-nums leading-none">
        {count}{suffix}
      </span>
      <span className="font-mono text-[10px] sm:text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export default function Hero() {
  const fullText = "{SIT}";
  const [typedText, setTypedText] = useState(fullText);
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState<"typing" | "done">("done");
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const glowDotsRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Pause animations when hero scrolls out of view
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Check reduced motion once
  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Typing animation -- runs only on return visits
  useEffect(() => {
    if (reducedMotion) return;
    const seen =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("sit-intro-seen");
    if (!seen) return;
    setTypedText("");
    setPhase("typing");
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        setPhase("done");
        clearInterval(typeInterval);
      }
    }, 180);
    return () => clearInterval(typeInterval);
  }, [reducedMotion]);

  // Cursor blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // GSAP: scroll indicator bounce + glow dots (lazy-loaded, non-blocking)
  const scrollTweenRef = useRef<{ kill: () => void } | null>(null);
  const dotsTlRef = useRef<{ kill: () => void; resume: () => void; pause: () => void } | null>(null);
  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      if (scrollArrowRef.current) {
        const tween = gsap.to(scrollArrowRef.current, {
          y: 4, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: -1,
        });
        scrollTweenRef.current = tween;
      }

      if (glowDotsRef.current) {
        const container = glowDotsRef.current;
        const dots: HTMLDivElement[] = [];
        for (let i = 0; i < 5; i++) {
          const dot = document.createElement("div");
          const col = Math.floor(Math.random() * 12) + 2;
          const row = Math.floor(Math.random() * 8) + 2;
          dot.style.cssText = `
            position:absolute;left:${col * 60}px;top:${row * 60}px;
            width:4px;height:4px;border-radius:50%;
            background:rgba(245,158,11,0.4);
            box-shadow:0 0 12px rgba(245,158,11,0.3),0 0 24px rgba(245,158,11,0.15);
            opacity:0;will-change:opacity;
          `;
          container.appendChild(dot);
          dots.push(dot);
        }
        const tl = gsap.timeline({ repeat: -1 });
        dots.forEach((dot, i) => {
          tl.to(dot, { opacity: 1, duration: 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, i * 1.5);
        });
        dotsTlRef.current = tl;
      }
    });

    return () => {
      cancelled = true;
      scrollTweenRef.current?.kill();
      dotsTlRef.current?.kill();
    };
  }, [reducedMotion]);

  // Pause/resume GSAP tweens based on visibility
  useEffect(() => {
    if (isVisible) {
      (scrollTweenRef.current as { resume?: () => void })?.resume?.();
      dotsTlRef.current?.resume?.();
    } else {
      (scrollTweenRef.current as { pause?: () => void })?.pause?.();
      dotsTlRef.current?.pause?.();
    }
  }, [isVisible]);

  const shouldAnimate = !reducedMotion && isVisible;
  const blobPlayState = shouldAnimate ? "running" : "paused";

  // The h1 content -- always present for LCP
  const h1Content = (
    <h1
      className="font-mono text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tighter mb-2"
      suppressHydrationWarning
    >
      <span className="text-[var(--color-accent-gold)]">
        {typedText.slice(0, 1)}
      </span>
      <span className="text-[var(--color-text)]">
        {typedText.slice(1, 4)}
      </span>
      <span className="text-[var(--color-accent-gold)]">
        {typedText.slice(4)}
      </span>
      <span
        className={`inline-block w-[3px] h-[0.85em] bg-[var(--color-accent-gold)] ml-1 align-middle ${showCursor ? "opacity-100" : "opacity-0"
          }`}
      />
    </h1>
  );

  return (
    <section
      ref={heroRef}
      data-hero
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* -- Layer 0: Aurora brand color blobs -- */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div style={{ opacity: 0, animation: "auroraFadeIn 2s ease-in-out forwards" }}>
          <div
            className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[80px] md:blur-[120px]"
            style={{ background: "rgba(245, 158, 11, 0.20)", animation: "auroraGold 30s ease-in-out infinite alternate", animationPlayState: blobPlayState, willChange: "transform" }}
          />
          <div
            className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full blur-[80px] md:blur-[120px]"
            style={{ background: "rgba(59, 130, 246, 0.16)", animation: "auroraBlue 35s ease-in-out infinite alternate", animationPlayState: blobPlayState, willChange: "transform" }}
          />
          <div
            className="absolute top-[30%] left-[15%] w-[30%] h-[30%] rounded-full blur-[60px] md:blur-[100px]"
            style={{ background: "rgba(239, 68, 68, 0.13)", animation: "auroraRed 40s ease-in-out infinite alternate", animationPlayState: blobPlayState, willChange: "transform" }}
          />
          <div
            className="absolute bottom-[10%] right-[25%] w-[25%] h-[25%] rounded-full blur-[60px] md:blur-[100px]"
            style={{ background: "rgba(34, 197, 94, 0.11)", animation: "auroraGreen 32s ease-in-out infinite alternate", animationPlayState: blobPlayState, willChange: "transform" }}
          />
        </div>
      </div>

      {/* -- Layer 0.5: Code rain (desktop only) -- */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{ contentVisibility: "auto" }}
      >
        {[
          { left: "12%", dur: "25s", delay: "0s", op: 0.08, chars: "{ } < > ; 0 1 = ( )\nconst let var =>\nif else while for\nimport export from\nasync await return" },
          { left: "38%", dur: "22s", delay: "-10s", op: 0.09, chars: "function class new\n[] {} () => void\npush pop shift map\nfilter reduce find\nslice splice sort" },
          { left: "62%", dur: "28s", delay: "-5s", op: 0.07, chars: "git add commit push\nnpm run dev build\ncurl POST GET PUT\ndocker compose up\nssh deploy@prod" },
          { left: "85%", dur: "32s", delay: "-18s", op: 0.08, chars: "HTTP 200 301 404\nTCP UDP DNS SSL\nAPI REST GraphQL\nconsole.log debug\npromise resolve ok" },
        ].map((col, i) => (
          <div
            key={i}
            className="code-rain-column absolute font-mono text-[14px] text-[var(--color-accent-gold)] whitespace-pre leading-[1.8]"
            style={{ left: col.left, opacity: col.op, animationDuration: col.dur, animationDelay: col.delay, animationPlayState: blobPlayState }}
          >
            {col.chars}
          </div>
        ))}
      </div>

      {/* -- Layer 1: CSS Grid background -- */}
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow-dots" aria-hidden="true" />
      <div ref={glowDotsRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* -- Layer 2: Noise overlay -- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* -- Layer 3: Content -- */}
      <div className="relative z-10 flex flex-col items-start px-6 md:px-12 lg:px-24 w-full max-w-[1400px] mb-[8vh]">
        <div className="flex items-start gap-4 md:gap-8">
          {/* Line numbers */}
          <div className="hidden md:flex flex-col font-mono text-[var(--color-text-muted)] text-sm leading-[1.8] select-none opacity-30">
            <span>01</span><span>02</span><span>03</span><span>04</span>
            <span>05</span><span>06</span><span>07</span><span>08</span>
          </div>

          <div className="flex flex-col">
            {/* Terminal prompt line */}
            <p className="font-mono text-[11px] sm:text-sm md:text-base text-[var(--color-text-muted)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              <span className="text-[var(--color-accent-green)]">$</span>
              <span className="text-[var(--color-accent-blue)]">{" ~/hva/hbo-ict"}</span>
              <span className="text-[var(--color-text-muted)]">{" > "}</span>
              <span className="text-[var(--color-accent-gold)]">init</span>
              <span className="text-[var(--color-text-muted)]"> studievereniging</span>
            </p>

            {/* Main logo -- LCP element */}
            <Suspense fallback={h1Content}>
              <MagneticHero>{h1Content}</MagneticHero>
            </Suspense>

            {/* Subtitle -- styled as terminal output */}
            <div
              className={`font-mono text-sm md:text-base mb-3 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.2s_forwards]" : ""
                }`}
            >
              <span className="text-[var(--color-accent-green)]">{">"}</span>
              <span className="text-[var(--color-text-muted)]"> Studievereniging ICT</span>
              <span className="text-[var(--color-text-muted)] opacity-40"> // </span>
              <span className="text-[var(--color-accent-blue)]">Hogeschool van Amsterdam</span>
            </div>

            {/* Tagline -- bigger, bolder */}
            <p
              className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1.1] max-w-2xl mb-8 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.4s_forwards]" : ""
                }`}
            >
              <span className="text-[var(--color-accent-blue)]">Door</span>{" "}
              <span className="text-[var(--color-text)]">studenten.</span>{" "}
              <span className="text-[var(--color-accent-green)]">Voor</span>{" "}
              <span className="text-[var(--color-text)]">studenten.</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--color-accent-red)]"> In tech.</span>
            </p>

            {/* CTAs -- game-lobby style */}
            <div
              className={`flex flex-col sm:flex-row gap-4 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_0.6s_forwards]" : ""
                }`}
            >
              {/* Primary CTA */}
              <a
                href="/#join"
                className="hero-cta-primary group relative px-10 py-4 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-sm tracking-widest uppercase overflow-hidden transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
              >
                <Suspense fallback={null}>
                  <GlowEffect
                    colors={["#F59E0B", "#D97706", "#FBBF24", "#F59E0B"]}
                    mode="breathe"
                    blur="soft"
                    duration={3}
                  />
                </Suspense>
                {/* Corner brackets */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--color-bg)]/30" />
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--color-bg)]/30" />
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--color-bg)]/30" />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--color-bg)]/30" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-[var(--color-bg)]/50 text-xs">{"["}</span>
                  WORD LID
                  <span className="text-[var(--color-bg)]/50 text-xs">{"]"}</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>

              {/* Secondary CTA */}
              <a
                href="/#events"
                className="hero-cta-secondary group/events relative px-10 py-4 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-sm tracking-widest uppercase overflow-hidden hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              >
                {/* Corner brackets */}
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--color-accent-gold)]/30 transition-all duration-300 group-hover/events:w-3 group-hover/events:h-3 group-hover/events:border-[var(--color-accent-gold)]/60" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--color-accent-gold)]/30 transition-all duration-300 group-hover/events:w-3 group-hover/events:h-3 group-hover/events:border-[var(--color-accent-gold)]/60" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--color-accent-gold)]/30 transition-all duration-300 group-hover/events:w-3 group-hover/events:h-3 group-hover/events:border-[var(--color-accent-gold)]/60" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--color-accent-gold)]/30 transition-all duration-300 group-hover/events:w-3 group-hover/events:h-3 group-hover/events:border-[var(--color-accent-gold)]/60" />
                <div className="absolute inset-0 bg-[var(--color-accent-gold)]/5 translate-x-[-101%] group-hover/events:translate-x-0 transition-transform duration-400" />
                <span className="relative z-10 flex items-center gap-2">
                  BEKIJK EVENTS
                  <span className="inline-block transition-transform duration-300 group-hover/events:translate-x-2">
                    {">"}
                  </span>
                </span>
              </a>
            </div>

            {/* Stat counters -- social proof */}
            <div
              className={`flex items-center gap-6 sm:gap-8 md:gap-10 mt-10 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1s_forwards]" : ""
                }`}
            >
              {STATS.map((stat, i) => (
                <StatCounter key={stat.label} {...stat} index={i} />
              ))}
            </div>

            {/* Bottom line -- Amsterdam x marks */}
            <div
              className={`flex items-center gap-3 mt-6 font-mono text-sm opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1.3s_forwards]" : ""
                }`}
            >
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
              <span className="text-[var(--color-accent-red)] font-bold">x</span>
              <span className="text-[var(--color-accent-green)] font-bold">x</span>
              <span className="text-[var(--color-accent-blue)] font-bold">x</span>
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
              <span className="text-[10px] text-[var(--color-text-muted)] opacity-40 tracking-widest uppercase ml-1">Amsterdam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 ${phase === "done" ? "animate-[fadeIn_0.6s_ease_1.5s_forwards]" : ""
          }`}
      >
        <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider opacity-70">
          scroll down
        </span>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-[var(--color-accent-gold)]/60 to-transparent" />
          <span
            ref={scrollArrowRef}
            className="font-mono text-xs text-[var(--color-accent-gold)] opacity-70"
          >
            ▼
          </span>
        </div>
      </div>
    </section>
  );
}
