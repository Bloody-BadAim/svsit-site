"use client";

import { useEffect, useRef } from "react";
import "./circuitBackground.css";

/**
 * CircuitBackground - full-page fixed circuit-board background.
 *
 * Ported from the Claude Design handoff (sit/project/hero): a PCB canvas with
 * Manhattan traces, vias, SMD parts and glowing energy pulses, plus a fixed
 * CPU/AI die pinned to viewport center. The board stays fixed while the page
 * scrolls; page content sits above it (z-index >= 1).
 *
 * Perf: static board is pre-rendered to an offscreen canvas (only the pulses
 * animate per frame), DPR capped at 2, rAF paused when the tab is hidden, and
 * fully static under prefers-reduced-motion.
 */

interface CircuitConfig {
  chipX: number;
  chipY: number;
  chipScale: number;
  speed: number;
  density: number;
  glow: number;
  accent: keyof typeof ACCENT_KEYS;
  cycle: boolean;
  cycleSpeed: number;
  bgOpacity: number;
  showChip: boolean;
}

const ACCENT_KEYS = {
  gold: "#F29E18",
  blue: "#3B82F6",
  green: "#22C55E",
  cyan: "#06B6D4",
  purple: "#8B5CF6",
  red: "#EF4444",
} as const;

// Tuned for whole-page use: calmer cycle, dimmer board for readability.
const CONFIG: CircuitConfig = {
  chipX: 0.5,
  chipY: 0.5,
  chipScale: 1.0,
  speed: 0.95,
  density: 0.9,
  glow: 0.85,
  accent: "gold",
  cycle: true,
  cycleSpeed: 22,
  bgOpacity: 0.42,
  showChip: true,
};

export default function CircuitBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = layerRef.current;
    const chipEl = chipRef.current;
    const pinsEl = pinsRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Mobiel: GEEN zware canvas + rAF (laggy op telefoon). Toont alleen de
    // lichtgewicht CSS-grid + chip (circuit-bg-grid). Geen JS-animatie.
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const isReduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");

    const C = {
      gold: "#F29E18",
      blue: "#3B82F6",
      green: "#22C55E",
      red: "#EF4444",
      cyan: "#06B6D4",
      purple: "#8B5CF6",
      line: "rgba(255,255,255,0.10)",
    };
    const BAG = [
      C.gold, C.gold, C.gold, C.blue, C.blue, C.blue,
      C.cyan, C.green, C.gold, C.blue, C.red, C.purple,
    ];
    const CFG = CONFIG;
    const accentCol = () => ACCENT_KEYS[CFG.accent] || C.gold;

    let W = 0, H = 0, DPR = 1, GRID = 26;
    let exclR = 0;

    type Pt = { x: number; y: number };
    type Seg = { a: Pt; b: Pt; d: number; acc: number };
    type Poly = { seg: Seg[]; len: number };
    type Wire = { pts: Pt[]; poly: Poly; color: string; out: Pt };
    type Pulse = {
      wire: Wire; pos: number; speed: number; dir: number;
      gap: number; wait: number; live: boolean; tail: number; color: string;
    };

    let chip = { x: 0, y: 0, w: 0, h: 0, l: 0, t: 0, r: 0, bm: 0 };
    let wires: Wire[] = [];
    let pulses: Pulse[] = [];
    let statics: HTMLCanvasElement | null = null;
    let raf = 0;

    // Pre-rendered radial-glow sprite per color - drawImage is GPU-cheap and
    // replaces per-frame ctx.shadowBlur (the dominant cost in the old engine).
    const glowCache = new Map<string, HTMLCanvasElement>();
    function glowSprite(col: string): HTMLCanvasElement {
      const cached = glowCache.get(col);
      if (cached) return cached;
      const R = 16;
      const s = document.createElement("canvas");
      s.width = s.height = R * 2;
      const sg = s.getContext("2d")!;
      const grad = sg.createRadialGradient(R, R, 0, R, R, R);
      grad.addColorStop(0, col);
      grad.addColorStop(0.35, col);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      sg.fillStyle = grad;
      sg.beginPath();
      sg.arc(R, R, R, 0, 7);
      sg.fill();
      glowCache.set(col, s);
      return s;
    }

    const snap = (v: number) => Math.round(v / GRID) * GRID;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

    function measure(pts: Pt[]): Poly {
      let len = 0;
      const seg: Seg[] = [];
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        seg.push({ a: pts[i - 1], b: pts[i], d, acc: len });
        len += d;
      }
      return { seg, len };
    }
    function at(poly: Poly, dist: number): Pt {
      const { seg, len } = poly;
      const d = Math.max(0, Math.min(dist, len));
      for (const s of seg) {
        if (d <= s.acc + s.d) {
          const k = s.d ? (d - s.acc) / s.d : 0;
          return { x: s.a.x + (s.b.x - s.a.x) * k, y: s.a.y + (s.b.y - s.a.y) * k };
        }
      }
      const last = seg[seg.length - 1];
      return last ? { x: last.b.x, y: last.b.y } : { x: 0, y: 0 };
    }

    function route(start: Pt, dir: Pt): Pt[] {
      const pts: Pt[] = [{ x: start.x, y: start.y }];
      let x = start.x, y = start.y;
      const stub = GRID * (1 + ((Math.random() * 2) | 0));
      x = snap(x + dir.x * stub);
      y = snap(y + dir.y * stub);
      pts.push({ x, y });
      const bends = 2 + ((Math.random() * 3) | 0);
      let horiz = dir.x !== 0;
      for (let i = 0; i < bends; i++) {
        if (horiz) {
          x = snap(x + (Math.random() < 0.5 ? -1 : 1) * GRID * (1 + ((Math.random() * 4) | 0)));
        } else {
          y = snap(y + (Math.random() < 0.5 ? -1 : 1) * GRID * (1 + ((Math.random() * 4) | 0)));
        }
        pts.push({ x, y });
        horiz = !horiz;
        if (dir.x) x = snap(x + dir.x * GRID * (1 + ((Math.random() * 3) | 0)));
        else y = snap(y + dir.y * GRID * (1 + ((Math.random() * 3) | 0)));
        pts.push({ x, y });
        horiz = !horiz;
      }
      if (dir.x) x = dir.x > 0 ? W + GRID : -GRID;
      else y = dir.y > 0 ? H + GRID : -GRID;
      pts.push({ x, y });
      return pts;
    }

    function build() {
      const cw = Math.min(Math.max(W * 0.13, 150), 260) * CFG.chipScale;
      const ch = cw;
      const cx = W * CFG.chipX;
      const cy = H * CFG.chipY;
      chip = { x: cx, y: cy, w: cw, h: ch, l: cx - cw / 2, t: cy - ch / 2, r: cx + cw / 2, bm: cy + ch / 2 };
      exclR = cw * 0.62;
      syncChipEl();

      wires = [];
      const perSide = Math.max(2, Math.round((W > 980 ? 6 : 4) * CFG.density));
      const sides = [
        { n: perSide, dir: { x: 0, y: -1 }, pin: (i: number) => ({ x: snap(chip.l + chip.w * (i + 1) / (perSide + 1)), y: chip.t }) },
        { n: perSide, dir: { x: 0, y: 1 }, pin: (i: number) => ({ x: snap(chip.l + chip.w * (i + 1) / (perSide + 1)), y: chip.bm }) },
        { n: perSide, dir: { x: -1, y: 0 }, pin: (i: number) => ({ x: chip.l, y: snap(chip.t + chip.h * (i + 1) / (perSide + 1)) }) },
        { n: perSide, dir: { x: 1, y: 0 }, pin: (i: number) => ({ x: chip.r, y: snap(chip.t + chip.h * (i + 1) / (perSide + 1)) }) },
      ];
      for (const s of sides) {
        for (let i = 0; i < s.n; i++) {
          if (Math.random() < 0.12) continue;
          const pts = route(s.pin(i), s.dir);
          const poly = measure(pts);
          wires.push({ pts, poly, color: pick(BAG), out: s.dir });
        }
      }
      const extra = Math.max(2, Math.round((W > 980 ? 7 : 4) * CFG.density));
      for (let i = 0; i < extra; i++) {
        const horiz = Math.random() < 0.5;
        const a = horiz
          ? { x: -GRID, y: snap(rnd(H * 0.08, H * 0.92)) }
          : { x: snap(rnd(W * 0.05, W * 0.95)), y: -GRID };
        const pts = route(a, horiz ? { x: 1, y: 0 } : { x: 0, y: 1 });
        wires.push({ pts, poly: measure(pts), color: pick(BAG), out: horiz ? { x: 1, y: 0 } : { x: 0, y: 1 } });
      }

      pulses = wires.map((w) => ({
        wire: w,
        pos: Math.random() * w.poly.len,
        speed: rnd(38, 78) * CFG.speed,
        dir: Math.random() < 0.62 ? -1 : 1,
        gap: rnd(0.4, 2.6),
        wait: Math.random() * 2.4,
        live: Math.random() < 0.7,
        tail: rnd(34, 60),
        color: w.color,
      }));

      statics = renderStatic();
    }

    function syncChipEl() {
      if (!chipEl) return;
      chipEl.style.display = CFG.showChip ? "flex" : "none";
      chipEl.style.width = chip.w + "px";
      chipEl.style.height = chip.h + "px";
      chipEl.style.left = chip.x + "px";
      chipEl.style.top = chip.y + "px";
      chipEl.style.setProperty("--chip-glow", String(CFG.glow));
      if (CFG.cycle) {
        chipEl.classList.add("cycling");
        chipEl.style.setProperty("--chip-cycle", CFG.cycleSpeed + "s");
        chipEl.style.removeProperty("--chip-accent");
      } else {
        chipEl.classList.remove("cycling");
        chipEl.style.setProperty("--chip-accent", accentCol());
      }
      canvas!.style.opacity = String(CFG.bgOpacity);
      if (!pinsEl) return;
      const per = Math.max(2, Math.round(6 * CFG.density));
      const len = 9, th = 2;
      let html = "";
      for (let i = 0; i < per; i++) {
        const fx = ((i + 1) / (per + 1)) * 100;
        const fy = ((i + 1) / (per + 1)) * 100;
        html += `<span style="left:${fx}%;top:${-len}px;width:${th}px;height:${len}px;transform:translateX(-50%)"></span>`;
        html += `<span style="left:${fx}%;bottom:${-len}px;width:${th}px;height:${len}px;transform:translateX(-50%)"></span>`;
        html += `<span style="top:${fy}%;left:${-len}px;height:${th}px;width:${len}px;transform:translateY(-50%)"></span>`;
        html += `<span style="top:${fy}%;right:${-len}px;height:${th}px;width:${len}px;transform:translateY(-50%)"></span>`;
      }
      pinsEl.innerHTML = html;
    }

    function renderStatic(): HTMLCanvasElement {
      const off = document.createElement("canvas");
      off.width = W * DPR;
      off.height = H * DPR;
      const g = off.getContext("2d")!;
      g.scale(DPR, DPR);

      g.fillStyle = "rgba(242,158,24,0.05)";
      for (let x = 0; x <= W; x += GRID * 2)
        for (let y = 0; y <= H; y += GRID * 2) g.fillRect(x, y, 1, 1);

      for (const w of wires) {
        g.lineJoin = "round";
        g.lineCap = "round";
        g.strokeStyle = C.line;
        g.lineWidth = 1.4;
        stroke(g, w.pts);
        g.save();
        g.globalAlpha = 0.2;
        g.shadowColor = w.color;
        g.shadowBlur = 7;
        g.strokeStyle = w.color;
        g.lineWidth = 1.1;
        stroke(g, w.pts);
        g.restore();
        for (let i = 1; i < w.pts.length - 1; i++) via(g, w.pts[i], w.color);
      }
      for (const w of wires) {
        if (Math.random() < 0.55 && w.pts.length > 3) {
          const i = 1 + ((Math.random() * (w.pts.length - 2)) | 0);
          smd(g, w.pts[i - 1], w.pts[i]);
        }
      }
      return off;
    }

    const inExcl = (x: number, y: number) => Math.hypot(x - chip.x, y - chip.y) < exclR;

    function stroke(g: CanvasRenderingContext2D, pts: Pt[]) {
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.stroke();
    }
    function via(g: CanvasRenderingContext2D, p: Pt, col: string) {
      g.save();
      g.fillStyle = "rgba(9,9,11,0.9)";
      g.beginPath();
      g.arc(p.x, p.y, 3.1, 0, 7);
      g.fill();
      g.strokeStyle = col;
      g.globalAlpha = 0.5;
      g.lineWidth = 1.1;
      g.beginPath();
      g.arc(p.x, p.y, 3.1, 0, 7);
      g.stroke();
      g.restore();
    }
    function smd(g: CanvasRenderingContext2D, a: Pt, b: Pt) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const horiz = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
      const len = 13, wd = 7;
      g.save();
      g.translate(mx, my);
      g.fillStyle = "rgba(255,255,255,0.07)";
      g.strokeStyle = "rgba(255,255,255,0.16)";
      g.lineWidth = 1;
      if (horiz) {
        g.fillRect(-len / 2, -wd / 2, len, wd);
        g.strokeRect(-len / 2, -wd / 2, len, wd);
      } else {
        g.fillRect(-wd / 2, -len / 2, wd, len);
        g.strokeRect(-wd / 2, -len / 2, wd, len);
      }
      g.restore();
    }

    function drawPulse(p: Pulse) {
      const head = at(p.wire.poly, p.pos);
      const sprite = glowSprite(p.color);
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      const steps = 6;
      for (let i = steps; i >= 1; i--) {
        const tp = at(p.wire.poly, p.pos - p.dir * ((p.tail * i) / steps));
        if (inExcl(tp.x, tp.y)) continue;
        const k = 1 - i / steps;
        ctx!.globalAlpha = k * 0.42;
        const sz = 3 + k * 4;
        ctx!.drawImage(sprite, tp.x - sz, tp.y - sz, sz * 2, sz * 2);
      }
      if (!inExcl(head.x, head.y)) {
        ctx!.globalAlpha = 0.95;
        ctx!.drawImage(sprite, head.x - 9, head.y - 9, 18, 18);
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = "#fff";
        ctx!.beginPath();
        ctx!.arc(head.x, head.y, 1.8, 0, 7);
        ctx!.fill();
      }
      ctx!.restore();
    }

    // Cap the pulse loop at ~30fps: ambient background needs no more, and it
    // halves canvas work on a full-viewport fixed layer.
    const FRAME_MS = 1000 / 30;
    let last = 0;
    function frame(time: number) {
      // Honor the site toggle / OS setting live: draw one static frame and go
      // idle (no further rAF scheduled) so "static" truly stops the animation.
      if (isReduced()) {
        paintOnce();
        raf = 0;
        return;
      }
      if (last && time - last < FRAME_MS) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min((time - (last || time)) / 1000, 0.05);
      last = time;
      ctx!.clearRect(0, 0, W, H);
      if (statics) ctx!.drawImage(statics, 0, 0, W, H);
      for (const p of pulses) {
        if (!p.live) {
          p.wait -= dt;
          if (p.wait <= 0) {
            p.live = true;
            p.pos = p.dir < 0 ? p.wire.poly.len : 0;
          }
          continue;
        }
        p.pos += p.dir * p.speed * dt;
        drawPulse(p);
        if ((p.dir < 0 && p.pos <= 0) || (p.dir > 0 && p.pos >= p.wire.poly.len)) {
          p.live = false;
          p.wait = p.gap + Math.random() * 1.5;
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function paintOnce() {
      if (!statics) return;
      ctx!.clearRect(0, 0, W, H);
      ctx!.drawImage(statics, 0, 0, W, H);
    }

    function resize() {
      const r = host!.getBoundingClientRect();
      W = Math.max(r.width, 1);
      H = Math.max(r.height, 1);
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      GRID = W > 1100 ? 30 : W > 700 ? 26 : 22;
      build();
      paintOnce();
    }

    function startLoop() {
      if (isReduced() || document.hidden) return;
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    // Defer the heavy canvas build() until after the first paint so the
    // chip (LCP element) and page content commit immediately. The chip is
    // already sized via CSS, so nothing visible waits on this work.
    let kickRaf1 = 0;
    let kickRaf2 = 0;
    kickRaf1 = requestAnimationFrame(() => {
      kickRaf2 = requestAnimationFrame(() => {
        resize();
        startLoop();
      });
    });

    // pause animation while the tab is hidden (battery / CPU)
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // react live to the site's // motion / // static toggle
    const onMotionChange = () => {
      if (isReduced()) {
        stopLoop();
        paintOnce();
      } else {
        startLoop();
      }
    };
    window.addEventListener("sit:motionchange", onMotionChange);

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        startLoop();
      }, 180);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(kickRaf1);
      cancelAnimationFrame(kickRaf2);
      stopLoop();
      clearTimeout(rt);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("sit:motionchange", onMotionChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={layerRef} className="circuit-bg-layer" aria-hidden="true">
      {/* Lichtgewicht statische grid (CSS). Op mobiel het enige bg-element
          (canvas-rAF draait daar niet). Op desktop ligt de canvas erover. */}
      <div className="circuit-bg-grid" />
      <canvas ref={canvasRef} className="circuit-bg-canvas" />
      <div className="circuit-bg-veil" />
      <div ref={chipRef} className="sit-chip">
        <span className="notch" />
        <div ref={pinsRef} className="pins" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="chip-logo" src="/circuit-chip-logo.png" alt="" width={256} height={256} fetchPriority="high" decoding="async" />
        <div className="chip-label">SIT CORE</div>
      </div>
    </div>
  );
}
