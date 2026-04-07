"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";

// Lazy-load non-LCP-critical components to avoid blocking initial paint
const GlowEffect = lazy(() =>
  import("@/components/ui/GlowEffect").then((m) => ({ default: m.GlowEffect }))
);
const MagneticHero = lazy(
  () => import("@/components/heroAnimations/MagneticHero")
);

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

  // Typing animation -- runs only on return visits (intro overlay already played),
  // and only if the user hasn't seen it this session and reduced motion is off.
  // This ensures the hero h1 text is always present in the DOM (good for LCP).
  useEffect(() => {
    if (reducedMotion) return;
    // Only run typing animation on return visits (session already marked by IntroOverlay)
    // On first visit, IntroOverlay handles the compile animation -- hero text stays visible.
    const seen =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("sit-intro-seen");
    if (!seen) {
      // First visit: IntroOverlay is showing -- keep hero text visible but faded under overlay
      // (phase stays "done", text stays "{SIT}", animation classes fire immediately after overlay)
      return;
    }
    // Return visit: run the typing animation as a nice touch
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
    // Dynamically import GSAP only when needed for decorative animations
    import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      // Scroll indicator bounce
      if (scrollArrowRef.current) {
        const tween = gsap.to(scrollArrowRef.current, {
          y: 4,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        scrollTweenRef.current = tween;
      }

      // Glow dot pulse on grid intersections
      if (glowDotsRef.current) {
        const container = glowDotsRef.current;
        const dots: HTMLDivElement[] = [];

        for (let i = 0; i < 5; i++) {
          const dot = document.createElement("div");
          const col = Math.floor(Math.random() * 12) + 2;
          const row = Math.floor(Math.random() * 8) + 2;
          dot.style.cssText = `
            position: absolute;
            left: ${col * 60}px;
            top: ${row * 60}px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.3), 0 0 24px rgba(245, 158, 11, 0.15);
            opacity: 0;
            will-change: opacity;
          `;
          container.appendChild(dot);
          dots.push(dot);
        }

        const tl = gsap.timeline({ repeat: -1 });
        dots.forEach((dot, i) => {
          tl.to(
            dot,
            {
              opacity: 1,
              duration: 2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: 1,
            },
            i * 1.5
          );
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

  // The h1 content -- always present for LCP, never hidden behind opacity:0 or animation delays
  const h1Content = (
    <h1
      className="font-mono text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tighter mb-6"
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
        className={`inline-block w-[3px] h-[0.85em] bg-[var(--color-accent-gold)] ml-1 align-middle ${
          showCursor ? "opacity-100" : "opacity-0"
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
      {/* -- Layer 0: Aurora brand color blobs (CSS animations, paused when off-screen) -- */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          style={{
            opacity: 0,
            animation: "auroraFadeIn 2s ease-in-out forwards",
          }}
        >
          {/* Gold blob -- top left */}
          <div
            className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[80px] md:blur-[120px]"
            style={{
              background: "rgba(245, 158, 11, 0.20)",
              animation: "auroraGold 30s ease-in-out infinite alternate",
              animationPlayState: blobPlayState,
              willChange: "transform",
            }}
          />
          {/* Blue blob -- bottom right */}
          <div
            className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full blur-[80px] md:blur-[120px]"
            style={{
              background: "rgba(59, 130, 246, 0.16)",
              animation: "auroraBlue 35s ease-in-out infinite alternate",
              animationPlayState: blobPlayState,
              willChange: "transform",
            }}
          />
          {/* Red blob -- center left */}
          <div
            className="absolute top-[30%] left-[15%] w-[30%] h-[30%] rounded-full blur-[60px] md:blur-[100px]"
            style={{
              background: "rgba(239, 68, 68, 0.13)",
              animation: "auroraRed 40s ease-in-out infinite alternate",
              animationPlayState: blobPlayState,
              willChange: "transform",
            }}
          />
          {/* Green blob -- bottom center */}
          <div
            className="absolute bottom-[10%] right-[25%] w-[25%] h-[25%] rounded-full blur-[60px] md:blur-[100px]"
            style={{
              background: "rgba(34, 197, 94, 0.11)",
              animation: "auroraGreen 32s ease-in-out infinite alternate",
              animationPlayState: blobPlayState,
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* -- Layer 0.5: Code rain (desktop only, 4 columns for perf) -- */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{ contentVisibility: "auto" }}
      >
        {[
          {
            left: "12%",
            dur: "25s",
            delay: "0s",
            op: 0.08,
            chars:
              "{ } < > ; 0 1 = ( )\nconst let var =>\nif else while for\nimport export from\nasync await return",
          },
          {
            left: "38%",
            dur: "22s",
            delay: "-10s",
            op: 0.09,
            chars:
              "function class new\n[] {} () => void\npush pop shift map\nfilter reduce find\nslice splice sort",
          },
          {
            left: "62%",
            dur: "28s",
            delay: "-5s",
            op: 0.07,
            chars:
              "git add commit push\nnpm run dev build\ncurl POST GET PUT\ndocker compose up\nssh deploy@prod",
          },
          {
            left: "85%",
            dur: "32s",
            delay: "-18s",
            op: 0.08,
            chars:
              "HTTP 200 301 404\nTCP UDP DNS SSL\nAPI REST GraphQL\nconsole.log debug\npromise resolve ok",
          },
        ].map((col, i) => (
          <div
            key={i}
            className="code-rain-column absolute font-mono text-[14px] text-[var(--color-accent-gold)] whitespace-pre leading-[1.8]"
            style={{
              left: col.left,
              opacity: col.op,
              animationDuration: col.dur,
              animationDelay: col.delay,
              animationPlayState: blobPlayState,
            }}
          >
            {col.chars}
          </div>
        ))}
      </div>

      {/* -- Layer 1: CSS Grid background -- */}
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow-dots" aria-hidden="true" />
      <div
        ref={glowDotsRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

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
          <div className="hidden md:flex flex-col font-mono text-[var(--color-text-muted)] text-sm leading-[1.8] select-none opacity-30">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
            <span>05</span>
            <span>06</span>
          </div>

          <div className="flex flex-col">
            {/* Comment line -- kept in hero */}
            <p className="font-mono text-[11px] sm:text-sm md:text-base text-[var(--color-accent-green)] mb-2 opacity-0 animate-[fadeIn_0.5s_ease_0.8s_forwards]">
              <span className="hidden sm:inline">
                {"// "}studievereniging HBO-ICT — Hogeschool van Amsterdam
              </span>
              <span className="sm:hidden">
                {"// "}studievereniging HBO-ICT — HvA
              </span>
            </p>

            {/* Main logo -- LCP element: always visible, MagneticHero enhances after load */}
            <Suspense fallback={h1Content}>
              <MagneticHero>{h1Content}</MagneticHero>
            </Suspense>

            {/* Tagline */}
            <p
              className={`font-mono text-lg md:text-xl text-[var(--color-text-muted)] max-w-lg leading-relaxed mb-10 opacity-0 ${
                phase === "done"
                  ? "animate-[fadeIn_0.6s_ease_0.2s_forwards]"
                  : ""
              }`}
            >
              <span className="text-[var(--color-accent-blue)]">Door</span>{" "}
              studenten.{" "}
              <span className="text-[var(--color-accent-green)]">Voor</span>{" "}
              studenten.
              <span className="text-[var(--color-accent-red)]"> In tech.</span>
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 opacity-0 ${
                phase === "done"
                  ? "animate-[fadeIn_0.6s_ease_0.5s_forwards]"
                  : ""
              }`}
            >
              <a
                href="/#join"
                className="group relative px-8 py-4 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-sm tracking-wide overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Suspense fallback={null}>
                  <GlowEffect
                    colors={["#F59E0B", "#D97706", "#FBBF24", "#F59E0B"]}
                    mode="breathe"
                    blur="soft"
                    duration={3}
                  />
                </Suspense>
                <span className="relative z-10">WORD LID</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a
                href="/#events"
                className="group/events relative px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono text-sm tracking-wide overflow-hidden hover:border-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[var(--color-accent-gold)]/10 translate-x-[-101%] group-hover/events:translate-x-0 transition-transform duration-400" />
                <span className="relative z-10">BEKIJK EVENTS</span>
                <span className="relative z-10 inline-block ml-2 transition-transform duration-300 group-hover/events:translate-x-2">
                  →
                </span>
              </a>
            </div>

            {/* Organisatie hint */}
            <p
              className={`font-mono text-xs text-[var(--color-text-muted)] mt-6 opacity-0 ${
                phase === "done"
                  ? "animate-[fadeIn_0.6s_ease_0.7s_forwards]"
                  : ""
              }`}
            >
              Benieuwd naar onze commissies?{" "}
              <a
                href="/organisatie"
                className="text-[var(--color-accent-gold)] hover:underline transition-colors duration-200"
              >
                Bekijk de stamboom →
              </a>
            </p>

            {/* Amsterdam x marks -- brand identity */}
            <div
              className={`flex items-center gap-3 mt-1 font-mono text-sm opacity-0 ${
                phase === "done"
                  ? "animate-[fadeIn_0.6s_ease_0.8s_forwards]"
                  : ""
              }`}
            >
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
              <span className="text-[var(--color-accent-red)] font-bold">
                ×
              </span>
              <span className="text-[var(--color-accent-green)] font-bold">
                ×
              </span>
              <span className="text-[var(--color-accent-blue)] font-bold">
                ×
              </span>
              <span className="w-8 h-px bg-[var(--color-text-muted)] opacity-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0 ${
          phase === "done"
            ? "animate-[fadeIn_0.6s_ease_1.2s_forwards]"
            : ""
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
