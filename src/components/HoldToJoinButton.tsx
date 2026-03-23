"use client";

import { useRef, useCallback, useEffect } from "react";
import { GlowEffect } from "@/components/ui/GlowEffect";
import { Magnetic } from "@/components/ui/Magnetic";

// --- Character pool (same vibe as hero particles) ---
const CHARS = "{ } [ ] ( ) < > / \\ | = + - * & % # @ ! ? ; : 0 1".split(" ");

const TERMINAL_LINES = [
  "> Welkom bij SIT.",
  "> await sit.join('jij');",
  "> // redirect naar aanmeldformulier...",
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// --- Particle type ---
interface Particle {
  x: number;
  y: number;
  char: string;
  speed: number;
  size: number;
  color: string;
  angle: number; // direction toward center
  spiralOffset: number; // slight spiral
  trail: { x: number; y: number }[];
  alive: boolean;
}

function spawnParticle(w: number, h: number): Particle {
  const cx = w / 2;
  const cy = h / 2;

  // Spawn on a random edge
  let x: number, y: number;
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: x = Math.random() * w; y = -20; break;        // top
    case 1: x = Math.random() * w; y = h + 20; break;     // bottom
    case 2: x = -20; y = Math.random() * h; break;         // left
    default: x = w + 20; y = Math.random() * h; break;     // right
  }

  const angle = Math.atan2(cy - y, cx - x);

  // Color distribution: 55% gold, 15% red, 15% blue, 15% green
  const rng = Math.random();
  let color: string;
  if (rng < 0.55) color = "#F59E0B";
  else if (rng < 0.70) color = "#EF4444";
  else if (rng < 0.85) color = "#3B82F6";
  else color = "#22C55E";

  return {
    x, y,
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    speed: 1.5 + Math.random() * 3,
    size: 12,
    color,
    angle,
    spiralOffset: (Math.random() - 0.5) * 0.03, // subtle curve
    trail: [],
    alive: true,
  };
}

export default function HoldToJoinButton({ href }: { href: string }) {
  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const holdStartRef = useRef(0);
  const rafRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const climaxRef = useRef(false);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reversingRef = useRef(false);
  const reverseStartRef = useRef(0);
  const reverseFromRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const buttonTextRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(true);

  const HOLD_DURATION = 3000;
  const REVERSE_DURATION = 500;

  // --- Cleanup ---
  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);

    holdingRef.current = false;
    progressRef.current = 0;
    climaxRef.current = false;
    reversingRef.current = false;
    particlesRef.current = [];

    if (overlayRef.current && overlayRef.current.parentNode) {
      overlayRef.current.parentNode.removeChild(overlayRef.current);
    }
    overlayRef.current = null;
    canvasRef.current = null;

    document.body.style.overflow = "";

    if (progressBarRef.current) progressBarRef.current.style.width = "0%";
    if (buttonTextRef.current) buttonTextRef.current.textContent = "WORD LID";
    if (buttonRef.current) buttonRef.current.style.boxShadow = "";
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // --- Create overlay ---
  const createOverlay = useCallback(() => {
    if (overlayRef.current) return;

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:9999;pointer-events:none;will-change:transform;";

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    overlay.appendChild(canvas);

    document.body.appendChild(overlay);
    overlayRef.current = overlay;
    canvasRef.current = canvas;
    document.body.style.overflow = "hidden";

    particlesRef.current = [];

    cleanupTimerRef.current = setTimeout(() => {
      if (mountedRef.current) cleanup();
    }, 10000);
  }, [cleanup]);

  // --- Draw convergence frame ---
  const drawConvergence = useCallback((ctx: CanvasRenderingContext2D, progress: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Background: darken with progress
    let bgOpacity: number;
    if (progress < 0.2) bgOpacity = lerp(0, 0.05, progress / 0.2);
    else if (progress < 0.5) bgOpacity = lerp(0.05, 0.3, (progress - 0.2) / 0.3);
    else if (progress < 0.8) bgOpacity = lerp(0.3, 0.6, (progress - 0.5) / 0.3);
    else bgOpacity = lerp(0.6, 0.95, (progress - 0.8) / 0.2);

    // Clear with trail fade
    ctx.fillStyle = `rgba(9, 9, 11, ${0.15 + bgOpacity * 0.2})`;
    ctx.fillRect(0, 0, w, h);

    // Target particle count based on progress
    let targetCount: number;
    if (progress < 0.2) targetCount = Math.floor(lerp(10, 30, progress / 0.2));
    else if (progress < 0.5) targetCount = Math.floor(lerp(30, 80, (progress - 0.2) / 0.3));
    else if (progress < 0.8) targetCount = Math.floor(lerp(80, 150, (progress - 0.5) / 0.3));
    else targetCount = Math.floor(lerp(150, 300, (progress - 0.8) / 0.2));

    // Font size based on progress
    let fontSize: number;
    if (progress < 0.2) fontSize = 12;
    else if (progress < 0.5) fontSize = lerp(12, 14, (progress - 0.2) / 0.3);
    else if (progress < 0.8) fontSize = lerp(14, 16, (progress - 0.5) / 0.3);
    else fontSize = lerp(16, 18, (progress - 0.8) / 0.2);

    // Speed multiplier
    let speedMult: number;
    if (progress < 0.2) speedMult = 0.6;
    else if (progress < 0.5) speedMult = lerp(0.6, 1.2, (progress - 0.2) / 0.3);
    else if (progress < 0.8) speedMult = lerp(1.2, 2.5, (progress - 0.5) / 0.3);
    else speedMult = lerp(2.5, 4.5, (progress - 0.8) / 0.2);

    // Trail length based on progress
    let maxTrail: number;
    if (progress < 0.2) maxTrail = 3;
    else if (progress < 0.5) maxTrail = Math.floor(lerp(3, 6, (progress - 0.2) / 0.3));
    else if (progress < 0.8) maxTrail = Math.floor(lerp(6, 10, (progress - 0.5) / 0.3));
    else maxTrail = Math.floor(lerp(10, 15, (progress - 0.8) / 0.2));

    const particles = particlesRef.current;

    // Spawn new particles if needed
    while (particles.length < targetCount) {
      particles.push(spawnParticle(w, h));
    }

    // Remove excess particles (for reverse)
    while (particles.length > targetCount + 20) {
      particles.pop();
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p.alive) {
        particles.splice(i, 1);
        continue;
      }

      // Save trail position
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > maxTrail) p.trail.shift();

      // Move toward center with spiral
      p.angle += p.spiralOffset;
      p.x += Math.cos(p.angle) * p.speed * speedMult;
      p.y += Math.sin(p.angle) * p.speed * speedMult;

      // Distance to center
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Recalculate angle toward center (with spiral)
      p.angle = Math.atan2(dy, dx) + p.spiralOffset * 5;

      // If close to center, respawn
      if (dist < 40) {
        // Small flash at center
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Respawn
        const newP = spawnParticle(w, h);
        particles[i] = newP;
        continue;
      }

      // Draw trail (streaks toward center)
      if (p.trail.length > 1) {
        for (let t = 0; t < p.trail.length - 1; t++) {
          const trailAlpha = (t / p.trail.length) * 0.4;
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = trailAlpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.trail[t].x, p.trail[t].y);
          ctx.lineTo(p.trail[t + 1].x, p.trail[t + 1].y);
          ctx.stroke();
        }
      }

      // Draw character (head)
      ctx.globalAlpha = Math.min(0.9, 0.3 + progress * 0.6);
      ctx.fillStyle = p.color;
      ctx.font = `${Math.round(fontSize)}px JetBrains Mono, monospace`;
      ctx.fillText(p.char, p.x, p.y);

      ctx.globalAlpha = 1;
    }

    // Center glow — intensifies with progress
    if (progress > 0.1) {
      const glowRadius = lerp(20, 80, progress);
      const glowAlpha = lerp(0.02, 0.15, progress);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      gradient.addColorStop(0, `rgba(245, 158, 11, ${glowAlpha})`);
      gradient.addColorStop(0.5, `rgba(245, 158, 11, ${glowAlpha * 0.3})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);
    }
  }, []);

  // --- Climax: convergence burst ---
  const runClimax = useCallback(() => {
    climaxRef.current = true;

    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    cleanupTimerRef.current = setTimeout(() => {
      if (mountedRef.current) cleanup();
    }, 15000);

    const canvas = canvasRef.current;
    if (!canvas) { cleanup(); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { cleanup(); return; }

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    try {
      // Step 1: Rapid convergence (500ms) — all particles rush to center
      let convergenceStart = performance.now();
      const particles = particlesRef.current;

      function convergeFrame() {
        if (!mountedRef.current || !canvasRef.current) return;

        const elapsed = performance.now() - convergenceStart;
        const t = Math.min(elapsed / 500, 1);

        // Darken
        ctx.fillStyle = `rgba(9, 9, 11, 0.3)`;
        ctx.fillRect(0, 0, w, h);

        // Move all particles rapidly toward center
        for (const p of particles) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          p.x += dx * 0.15;
          p.y += dy * 0.15;

          // Draw streak
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x + dx * 0.3, p.y + dy * 0.3);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          ctx.globalAlpha = 0.9;
          ctx.fillStyle = p.color;
          ctx.font = `16px JetBrains Mono, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.char, p.x, p.y);
        }

        // Growing center glow
        const glowR = lerp(10, 120, t * t);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, `rgba(245, 158, 11, ${lerp(0.3, 0.8, t)})`);
        grad.addColorStop(0.4, `rgba(245, 158, 11, ${lerp(0.1, 0.3, t)})`);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(convergeFrame);
        } else {
          // Step 2: Golden flash (150ms)
          goldenFlash();
        }
      }

      function goldenFlash() {
        // Flash: golden/white burst
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        grad.addColorStop(0.2, "rgba(245, 158, 11, 0.8)");
        grad.addColorStop(0.5, "rgba(245, 158, 11, 0.3)");
        grad.addColorStop(1, "rgba(9, 9, 11, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        setTimeout(() => {
          if (!mountedRef.current || !canvasRef.current) return;

          // Step 3: Black out
          ctx.fillStyle = "#09090B";
          ctx.fillRect(0, 0, w, h);

          setTimeout(() => {
            if (!mountedRef.current || !canvasRef.current) return;
            // Step 4: Terminal message
            typeTerminal(ctx, w, h);
          }, 200);
        }, 150);
      }

      function typeTerminal(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.fillStyle = "#09090B";
        ctx.fillRect(0, 0, w, h);

        const lineHeight = 36;
        const startY = h / 2 - (TERMINAL_LINES.length * lineHeight) / 2;
        let charIdx = 0;
        let lineIdx = 0;
        let cursorVisible = true;

        const maxLineWidth = Math.max(...TERMINAL_LINES.map((l) => l.length)) * 12;
        const startX = (w - maxLineWidth) / 2;

        const cursorBlink = setInterval(() => { cursorVisible = !cursorVisible; }, 500);

        const typeInterval = setInterval(() => {
          if (!mountedRef.current || !canvasRef.current) {
            clearInterval(typeInterval);
            clearInterval(cursorBlink);
            return;
          }

          ctx.fillStyle = "#09090B";
          ctx.fillRect(0, 0, w, h);
          ctx.font = "18px JetBrains Mono, monospace";
          ctx.textBaseline = "top";
          ctx.textAlign = "left";
          ctx.fillStyle = "#F59E0B";

          for (let i = 0; i < lineIdx; i++) {
            ctx.fillText(TERMINAL_LINES[i], startX, startY + i * lineHeight);
          }

          if (lineIdx < TERMINAL_LINES.length) {
            const line = TERMINAL_LINES[lineIdx];
            const partial = line.substring(0, charIdx);
            ctx.fillText(partial, startX, startY + lineIdx * lineHeight);

            if (cursorVisible) {
              const cursorX = startX + ctx.measureText(partial).width;
              ctx.fillRect(cursorX + 2, startY + lineIdx * lineHeight, 10, 20);
            }

            charIdx++;
            if (charIdx > line.length) {
              charIdx = 0;
              lineIdx++;
            }
          } else {
            if (cursorVisible) {
              const lastLine = TERMINAL_LINES[TERMINAL_LINES.length - 1];
              const cursorX = startX + ctx.measureText(lastLine).width;
              ctx.fillStyle = "#F59E0B";
              ctx.fillRect(cursorX + 2, startY + (TERMINAL_LINES.length - 1) * lineHeight, 10, 20);
            }
          }

          if (lineIdx >= TERMINAL_LINES.length && charIdx === 0) {
            clearInterval(typeInterval);

            setTimeout(() => {
              clearInterval(cursorBlink);
              if (overlayRef.current) {
                overlayRef.current.style.transition = "opacity 500ms ease";
                overlayRef.current.style.opacity = "0";
              }
              setTimeout(() => {
                cleanup();
                window.location.href = href;
              }, 500);
            }, 2500);
          }
        }, 40);
      }

      // Start convergence animation
      convergeFrame();
    } catch {
      cleanup();
    }
  }, [cleanup, href]);

  // --- Main animation loop ---
  const animationLoop = useCallback(() => {
    if (!mountedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    let progress: number;

    if (reversingRef.current) {
      const elapsed = now - reverseStartRef.current;
      const t = Math.min(elapsed / REVERSE_DURATION, 1);
      const eased = 1 - (1 - t) * (1 - t);
      progress = reverseFromRef.current * (1 - eased);

      if (t >= 1) {
        cleanup();
        return;
      }
    } else if (holdingRef.current) {
      const elapsed = now - holdStartRef.current;
      progress = Math.min(elapsed / HOLD_DURATION, 1);
    } else {
      return;
    }

    progressRef.current = progress;

    // Update button visuals
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`;
    }
    if (buttonTextRef.current) {
      if (progress > 0.01 && progress < 1) {
        const dots = ".".repeat(Math.floor((now / 400) % 4));
        buttonTextRef.current.textContent = `WORD LID${dots}`;
      } else if (progress <= 0.01) {
        buttonTextRef.current.textContent = "WORD LID";
      }
    }
    if (buttonRef.current) {
      const glow = progress * 30;
      buttonRef.current.style.boxShadow = `0 0 ${glow}px rgba(245, 158, 11, ${progress * 0.6})`;
    }

    try {
      drawConvergence(ctx, progress);
    } catch {
      cleanup();
      return;
    }

    if (progress >= 1 && holdingRef.current && !climaxRef.current) {
      holdingRef.current = false;
      runClimax();
      return;
    }

    rafRef.current = requestAnimationFrame(animationLoop);
  }, [cleanup, drawConvergence, runClimax]);

  // --- Start hold ---
  const startHold = useCallback(() => {
    if (climaxRef.current) return;
    holdingRef.current = true;
    reversingRef.current = false;
    holdStartRef.current = performance.now();
    createOverlay();
    rafRef.current = requestAnimationFrame(animationLoop);
  }, [createOverlay, animationLoop]);

  // --- End hold ---
  const endHold = useCallback(() => {
    if (climaxRef.current) return;
    if (!holdingRef.current) return;
    holdingRef.current = false;

    if (progressRef.current > 0.01) {
      reversingRef.current = true;
      reverseStartRef.current = performance.now();
      reverseFromRef.current = progressRef.current;
      rafRef.current = requestAnimationFrame(animationLoop);
    } else {
      cleanup();
    }
  }, [cleanup, animationLoop]);

  const TAP_THRESHOLD = 300; // ms — anything shorter is a tap, not a hold

  // --- Event handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startHold();
  }, [startHold]);

  const handleMouseUp = useCallback(() => endHold(), [endHold]);
  const handleMouseLeave = useCallback(() => {
    if (holdingRef.current) endHold();
  }, [endHold]);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    startHold();
  }, [startHold]);
  const handleTouchEnd = useCallback(() => {
    // Quick tap → navigate directly (mobile-friendly fallback)
    const holdDuration = performance.now() - holdStartRef.current;
    if (holdDuration < TAP_THRESHOLD && !climaxRef.current) {
      cleanup();
      window.location.href = href;
      return;
    }
    endHold();
  }, [endHold, cleanup, href]);

  return (
    <Magnetic intensity={0.25} range={150}>
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Word lid van SIT, houd ingedrukt om te bevestigen"
        className="group relative inline-block px-12 py-5 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-xl tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.97] select-none cursor-pointer border-0"
      >
        <GlowEffect
          colors={["#F59E0B", "#D97706", "#FBBF24", "#F59E0B"]}
          mode="breathe"
          blur="medium"
          duration={3}
          scale={1.2}
        />

        {/* Progress bar */}
        <div
          ref={progressBarRef}
          className="absolute inset-0 bg-[#D97706] origin-left"
          style={{ width: "0%", transition: "none" }}
        />

        {/* Text */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span ref={buttonTextRef}>WORD LID</span>
          <span className="text-[10px] font-normal opacity-60 md:opacity-40 md:group-hover:opacity-80 translate-y-0.5 group-hover:translate-y-0 tracking-wider transition-all duration-300">
            {"// tap or hold"}
          </span>
        </div>

        {/* Hover sweep */}
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </Magnetic>
  );
}
