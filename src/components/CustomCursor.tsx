"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// SIT_CURSOR.sys - developer/debugger HUD cursor.
// Gold crosshair reticle (1:1) + soft follower ring + magnetic lock-on +
// live coordinate HUD + terminal caret over text fields + exec ripple on click.
// Self-isolated: own <style>, hides native cursor only on fine-pointer devices,
// honours prefers-reduced-motion, full RAF/listener cleanup on unmount.
// ---------------------------------------------------------------------------

const CFG = {
  accent: "#F29E18",
  lock: "brackets" as "brackets" | "braces" | "box",
  trail: true,
  coords: false,
  magnet: 0.28,
};

const SEL =
  'a[href], button, [role="button"], input, textarea, select, label[for], summary, [data-cursor]';
const TEXT_SEL =
  "input:not([type=button]):not([type=submit]):not([type=reset])" +
  ":not([type=checkbox]):not([type=radio]):not([type=range])" +
  ':not([type=color]), textarea, [contenteditable=""], [contenteditable="true"]';
const TRAIL_N = 7;

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Bail on coarse/touch pointers - keep the native cursor.
    const fine =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const REDUCE =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const doc = document;
    doc.documentElement.classList.add("sit-cursor-on");

    const $ = (s: string) => root.querySelector<HTMLElement>(s)!;
    const elTrail = $(".sc-trail");
    const elLock = $(".sc-lock");
    const elRing = $(".sc-ring");
    const elReticle = $(".sc-reticle");
    const elCaret = $(".sc-caret");
    const elHud = $(".sc-hud");
    const elHudVal = $(".sc-hud-val");

    const trailNodes = Array.from(
      elTrail.querySelectorAll<HTMLElement>("i")
    );
    const trailPos = trailNodes.map(() => ({ x: -100, y: -100 }));

    const raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const soft = { x: raw.x, y: raw.y };
    let target: HTMLElement | null = null;
    let rect: (DOMRect & { _stale?: boolean }) | null = null;
    let isText = false;
    let inside = false;

    const labelFor = (el: HTMLElement) => {
      if (el.dataset && el.dataset.cursorLabel) return el.dataset.cursorLabel;
      const tag = el.tagName.toLowerCase();
      if (tag === "a") return "link";
      if (tag === "button" || el.getAttribute("role") === "button")
        return "button";
      if (tag === "input") return el.getAttribute("type") || "text";
      if (tag === "textarea") return "textarea";
      if (tag === "select") return "select";
      if (tag === "label") return "label";
      return tag;
    };

    const setTarget = (el: HTMLElement | null) => {
      if (el === target) return;
      target = el;
      rect = null;
      root.classList.toggle("has-target", !!el);
      if (el) {
        isText = !!(el.matches && el.matches(TEXT_SEL));
        root.classList.toggle("is-text", isText);
        const c = (el.dataset && el.dataset.cursorColor) || CFG.accent;
        root.style.setProperty("--c", c);
        elHudVal.textContent = labelFor(el);
      } else {
        isText = false;
        root.classList.remove("is-text");
        root.style.setProperty("--c", CFG.accent);
      }
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const el = t && t.closest ? (t.closest(SEL) as HTMLElement | null) : null;
      if (el) setTarget(el);
    };
    const onOut = (e: PointerEvent) => {
      if (!target) return;
      const to = e.relatedTarget as Element | null;
      if (!to || !target.contains(to)) {
        if (!to || !(to.closest && to.closest(SEL) === target)) setTarget(null);
      }
    };
    const onMove = (e: PointerEvent) => {
      raw.x = e.clientX;
      raw.y = e.clientY;
      show();
      elReticle.style.transform =
        "translate3d(" + raw.x + "px," + raw.y + "px,0)";
      elCaret.style.transform =
        "translate3d(" + raw.x + "px," + raw.y + "px,0)";
    };
    const exec = (x: number, y: number) => {
      const r = doc.createElement("div");
      r.className = "sc-exec";
      r.style.setProperty("--x", x + "px");
      r.style.setProperty("--y", y + "px");
      root.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      root.classList.add("down");
      exec(raw.x, raw.y);
    };
    const onUp = () => root.classList.remove("down");

    const show = () => {
      if (!inside) inside = true;
      if (!root.classList.contains("live")) root.classList.add("live");
    };
    const hide = () => {
      inside = false;
      root.classList.remove("live");
    };
    const staleRect = () => {
      rect = null;
    };

    doc.addEventListener("pointerover", onOver);
    doc.addEventListener("pointerout", onOut);
    doc.addEventListener("pointermove", onMove, { passive: true });
    doc.addEventListener("pointerdown", onDown);
    doc.addEventListener("pointerup", onUp);
    doc.addEventListener("pointerenter", show);
    doc.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", staleRect, true);
    window.addEventListener("resize", staleRect);

    const lerp = REDUCE ? 1 : 0.2;
    let rafId = 0;

    const frame = () => {
      let tx = raw.x;
      let ty = raw.y;
      if (target && !isText) {
        if (!rect || rect._stale) {
          try {
            rect = target.getBoundingClientRect();
          } catch {
            rect = null;
          }
        }
        if (rect) {
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const m = +CFG.magnet || 0;
          tx = raw.x + (cx - raw.x) * m;
          ty = raw.y + (cy - raw.y) * m;
        }
      }

      soft.x += (tx - soft.x) * lerp;
      soft.y += (ty - soft.y) * lerp;
      elRing.style.transform =
        "translate3d(" + soft.x + "px," + soft.y + "px,0)";

      const flipX = raw.x > window.innerWidth - 150;
      const flipY = raw.y > window.innerHeight - 60;
      elHud.classList.toggle("flipx", flipX);
      elHud.classList.toggle("flipy", flipY);
      elHud.style.transform =
        "translate3d(" + soft.x + "px," + soft.y + "px,0)";
      elHud.style.opacity = target && inside ? "1" : "0";

      if (target && !isText && rect) {
        const p = 6;
        elLock.style.opacity = "1";
        elLock.style.width = rect.width + p * 2 + "px";
        elLock.style.height = rect.height + p * 2 + "px";
        elLock.style.transform =
          "translate3d(" + (rect.left - p) + "px," + (rect.top - p) + "px,0)";
      } else {
        elLock.style.opacity = "0";
      }

      root.setAttribute("data-lock", isText ? "none" : CFG.lock);

      if (CFG.trail && !REDUCE && inside && !isText) {
        elTrail.style.opacity = "1";
        trailPos[0].x += (raw.x - trailPos[0].x) * 0.5;
        trailPos[0].y += (raw.y - trailPos[0].y) * 0.5;
        for (let i = 1; i < TRAIL_N; i++) {
          trailPos[i].x += (trailPos[i - 1].x - trailPos[i].x) * 0.35;
          trailPos[i].y += (trailPos[i - 1].y - trailPos[i].y) * 0.35;
        }
        for (let j = 0; j < TRAIL_N; j++) {
          trailNodes[j].style.transform =
            "translate3d(" + trailPos[j].x + "px," + trailPos[j].y + "px,0)";
        }
      } else {
        elTrail.style.opacity = "0";
      }

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const staleTimer = window.setInterval(() => {
      if (rect) rect._stale = true;
    }, 120);

    root.style.setProperty("--c", CFG.accent);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(staleTimer);
      doc.removeEventListener("pointerover", onOver);
      doc.removeEventListener("pointerout", onOut);
      doc.removeEventListener("pointermove", onMove);
      doc.removeEventListener("pointerdown", onDown);
      doc.removeEventListener("pointerup", onUp);
      doc.removeEventListener("pointerenter", show);
      doc.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", staleRect, true);
      window.removeEventListener("resize", staleRect);
      doc.documentElement.classList.remove("sit-cursor-on");
      root.querySelectorAll(".sc-exec").forEach((n) => n.remove());
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CURSOR_CSS }} />
      <div id="sitcur" ref={rootRef} aria-hidden="true">
        <div className="sc-trail">
          {Array.from({ length: TRAIL_N }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="sc-lock">
          <i className="c tl" />
          <i className="c tr" />
          <i className="c bl" />
          <i className="c br" />
          <i className="sc-box" />
          <i className="sc-scan" />
          <b className="sc-brace l">{"{"}</b>
          <b className="sc-brace r">{"}"}</b>
        </div>
        <div className="sc-ring" />
        <div className="sc-reticle">
          <i className="l n" />
          <i className="l s" />
          <i className="l w" />
          <i className="l e" />
          <i className="sc-dot" />
        </div>
        <div className="sc-caret" />
        <div className="sc-hud">
          <span className="sc-hud-key">+</span>
          <span className="sc-hud-val" />
        </div>
      </div>
    </>
  );
}

const CURSOR_CSS = `
html.sit-cursor-on, html.sit-cursor-on *{cursor:none !important}
#sitcur{position:fixed; inset:0; z-index:2147483600; pointer-events:none; --c:#F29E18; opacity:0; transition:opacity .2s}
#sitcur.live{opacity:1}
#sitcur>*{position:absolute; top:0; left:0; will-change:transform}

.sc-reticle .l{position:absolute; background:var(--c); box-shadow:0 0 6px var(--c)}
.sc-reticle .n,.sc-reticle .s{width:1.5px; left:-.75px}
.sc-reticle .w,.sc-reticle .e{height:1.5px; top:-.75px}
.sc-reticle .n{height:8px; top:-15px} .sc-reticle .s{height:8px; top:7px}
.sc-reticle .w{width:8px; left:-15px} .sc-reticle .e{width:8px; left:7px}
.sc-dot{position:absolute; width:3px;height:3px; margin:-1.5px; border-radius:50%; background:var(--c); box-shadow:0 0 6px var(--c); transition:transform .12s}
#sitcur.down .sc-dot{transform:scale(1.9)}
#sitcur.is-text .sc-reticle{opacity:0}

.sc-ring::before{content:""; position:absolute; width:30px;height:30px; margin:-15px; border:1.5px dashed var(--c); border-radius:50%; opacity:.5; transition:width .18s,height .18s,margin .18s,opacity .18s,transform .12s,border-style .18s; animation:scSpin 5s linear infinite}
#sitcur.has-target .sc-ring::before{width:9px;height:9px;margin:-4.5px;border-style:solid;opacity:.95;animation:none}
#sitcur.down .sc-ring::before{transform:scale(.65)}
#sitcur.is-text .sc-ring{opacity:0}
@keyframes scSpin{to{transform:rotate(360deg)}}

.sc-trail{transition:opacity .2s}
.sc-trail i{position:absolute; width:4px;height:4px; margin:-2px; background:var(--c); border-radius:1px}
.sc-trail i:nth-child(1){opacity:.5} .sc-trail i:nth-child(2){opacity:.4}
.sc-trail i:nth-child(3){opacity:.3} .sc-trail i:nth-child(4){opacity:.22}
.sc-trail i:nth-child(5){opacity:.15} .sc-trail i:nth-child(6){opacity:.1}
.sc-trail i:nth-child(7){opacity:.06}

.sc-lock{opacity:0; --lh:24px;
  transition:opacity .18s, transform .2s cubic-bezier(.2,.9,.2,1), width .2s cubic-bezier(.2,.9,.2,1), height .2s cubic-bezier(.2,.9,.2,1)}
.sc-lock .c{position:absolute; width:13px;height:13px; opacity:0; transition:opacity .15s}
.sc-lock .tl{top:-1px;left:-1px;border-top:1.5px solid var(--c);border-left:1.5px solid var(--c)}
.sc-lock .tr{top:-1px;right:-1px;border-top:1.5px solid var(--c);border-right:1.5px solid var(--c)}
.sc-lock .bl{bottom:-1px;left:-1px;border-bottom:1.5px solid var(--c);border-left:1.5px solid var(--c)}
.sc-lock .br{bottom:-1px;right:-1px;border-bottom:1.5px solid var(--c);border-right:1.5px solid var(--c)}
.sc-box{position:absolute; inset:0; border:1px solid var(--c); border-radius:10px; opacity:0; transition:opacity .15s}
.sc-scan{position:absolute; left:2px; right:2px; top:0; height:1px; background:var(--c); opacity:0; box-shadow:0 0 8px var(--c); animation:scScan 1.8s linear infinite}
.sc-brace{position:absolute; top:50%; font-family:var(--font-big-shoulders),sans-serif; font-weight:800; color:var(--c); opacity:0; line-height:0;
  font-size:calc(var(--lh) * 1.25); transition:opacity .15s; text-shadow:0 0 10px var(--c)}
.sc-brace.l{left:-2px; transform:translate(-100%,-50%)}
.sc-brace.r{right:-2px; transform:translate(100%,-50%)}
@keyframes scScan{0%{top:2px;opacity:0}10%{opacity:.8}90%{opacity:.8}100%{top:calc(100% - 2px);opacity:0}}
#sitcur[data-lock="brackets"] .sc-lock .c{opacity:1}
#sitcur[data-lock="box"] .sc-box,#sitcur[data-lock="box"] .sc-scan{opacity:1}
#sitcur[data-lock="braces"] .sc-brace{opacity:1}

.sc-caret{width:2px; height:22px; margin:-11px 0 0 -1px; background:var(--c); opacity:0; box-shadow:0 0 8px var(--c); transition:opacity .15s}
#sitcur.is-text .sc-caret{opacity:1; animation:scBlink 1.05s steps(1) infinite}
@keyframes scBlink{50%{opacity:0}}

.sc-hud{display:inline-flex; align-items:center; gap:6px; margin:14px 0 0 17px; padding:4px 9px;
  background:rgba(17,17,19,.9); border:1px solid rgba(255,255,255,.07); border-radius:6px; font-family:var(--font-mono),ui-monospace,monospace;
  font-size:11px; color:var(--c); white-space:nowrap; opacity:0; transition:opacity .15s; backdrop-filter:blur(4px)}
.sc-hud.flipx{translate:-100% 0; margin-left:-17px}
.sc-hud.flipy{margin-top:-26px}
.sc-hud-key{color:#5b5b63}
#sitcur.has-target .sc-hud-val::before{content:"\\2039"; color:#5b5b63; margin-right:1px}
#sitcur.has-target .sc-hud-val::after{content:"\\203A"; color:#5b5b63; margin-left:1px}

.sc-exec{width:14px;height:14px; margin:-7px; border-radius:50%; border:1.5px solid var(--c); animation:scExec .5s ease-out forwards}
@keyframes scExec{from{transform:translate3d(var(--x),var(--y),0) scale(.4);opacity:.9}to{transform:translate3d(var(--x),var(--y),0) scale(2.6);opacity:0}}

@media(prefers-reduced-motion:reduce){
  .sc-ring::before,.sc-scan{animation:none}
}
@media(max-width:860px), (pointer:coarse){
  html.sit-cursor-on, html.sit-cursor-on *{cursor:auto !important}
  #sitcur{display:none}
}
`;
