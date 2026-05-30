"use client";

import { useEffect, useRef, useState } from "react";
import { PARTNERS, TIER_META, TIER_ORDER } from "@/lib/partners";
import { TextScramble } from "@/components/ui/TextScramble";
import "./partnersNetwork.css";

const TILT = 8;

function Pins() {
  return (
    <>
      <span className="pins t"><span /><span /><span /><span /></span>
      <span className="pins b"><span /><span /><span /><span /></span>
    </>
  );
}

function Corners() {
  return (
    <>
      <i className="cnr tl" /><i className="cnr tr" /><i className="cnr bl" /><i className="cnr br" />
    </>
  );
}

export default function PartnersNetwork() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Reveal grid once it scrolls into view
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(grid);
    return () => io.disconnect();
  }, []);

  // Cursor spotlight + 3D tilt (pointer-driven, no rAF loop)
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(grid.querySelectorAll<HTMLElement>(".node"));
    const cleanups: Array<() => void> = [];

    nodes.forEach((node) => {
      const move = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        node.style.setProperty("--mx", `${px * 100}%`);
        node.style.setProperty("--my", `${py * 100}%`);
        if (reduce) {
          node.style.transform = "translateY(-4px)";
          return;
        }
        const rx = (0.5 - py) * TILT;
        const ry = (px - 0.5) * TILT;
        node.style.transform = `translateY(-4px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const leave = () => {
        node.style.transform = "";
      };
      node.addEventListener("pointerenter", move);
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        node.removeEventListener("pointerenter", move);
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const connected = PARTNERS.length;

  return (
    <section className="pnet" id="partners">
      {/* PCB substrate */}
      <div className="pcb" aria-hidden="true">
        <div className="pcb-glow" />
        <div className="pcb-grid" />
        <svg viewBox="0 0 1280 700" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="pnet-trace" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F29E18" stopOpacity="0" />
              <stop offset="0.5" stopColor="#F29E18" stopOpacity="0.5" />
              <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#27272A" strokeWidth="1.2" fill="none" opacity="0.55">
            <path d="M120 90 H420 V250 H300" />
            <path d="M1160 120 H880 V300" />
            <path d="M120 620 H360 V470 H560" />
            <path d="M1160 600 H980 V430 H760" />
            <path d="M640 60 V200" />
            <path d="M200 360 H120" />
            <path d="M1080 360 H1160" />
          </g>
          <g fill="#27272A">
            <circle cx="420" cy="90" r="3" /><circle cx="300" cy="250" r="3" />
            <circle cx="880" cy="120" r="3" /><circle cx="360" cy="620" r="3" />
            <circle cx="980" cy="600" r="3" /><circle cx="640" cy="200" r="3" />
          </g>
          <path className="live-trace" d="M120 90 H420 V250 H300" stroke="url(#pnet-trace)" strokeWidth="1.6" fill="none" />
          <path className="live-trace" style={{ animationDelay: "1.4s" }} d="M1160 120 H880 V300" stroke="url(#pnet-trace)" strokeWidth="1.6" fill="none" />
          <path className="live-trace" style={{ animationDelay: "2.6s" }} d="M1160 600 H980 V430 H760" stroke="url(#pnet-trace)" strokeWidth="1.6" fill="none" />
        </svg>
      </div>

      <div className="wrap">
        <div className="p-head">
          <span className="eyebrow">// powered by</span>
          <h1 className="p-title">
            Partner<span className="b">·</span>netwerk
          </h1>
          <p className="p-status">
            <span className="live"><i />root@sit:~/network</span>
            <span className="sep">$</span>
            <span>trace --partners</span>
            <span className="sep">·</span>
            <span><b>{connected}</b> verbonden</span>
            <span className="sep">·</span>
            <span>slots <b>open</b></span>
          </p>
        </div>

        <div className="net">
          <div className="net-rail" />
          <div className={`grid${inView ? " in" : ""}`} ref={gridRef}>
            {/* SIT CORE */}
            <article className="node core">
              <Pins />
              <Corners />
              <div className="spot" />
              <div className="scan" />
              <div className="node-head">
                <span className="core-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/circuit-chip-logo.png" alt="SIT" width={24} height={24} />
                </span>
                <span className="onl"><i />core</span>
              </div>
              <h3 className="node-logo"><span className="b">{"{"}</span>SIT<span className="b">{"}"}</span> CORE</h3>
              <p className="node-tag">
                De hub - elke partner sluit hier aan op{" "}
                <b style={{ color: "var(--color-text)", fontWeight: 500 }}>200+</b> ICT-studenten.
              </p>
              <div className="node-foot"><span className="addr">status · <b>online</b></span></div>
            </article>

            {/* Partners */}
            {PARTNERS.map((p) => {
              const tier = TIER_META[p.tier];
              const inner = (
                <>
                  <Pins />
                  <Corners />
                  <div className="spot" />
                  <div className="scan" />
                  <div className="node-head">
                    <span className="badge">{tier.label}</span>
                    <span className="onl"><i />online</span>
                  </div>
                  <h3 className="node-logo">
                    <TextScramble as="span" trigger={inView} duration={0.6} speed={0.03}>
                      {p.name}
                    </TextScramble>
                  </h3>
                  <p className="node-tag">{p.tagline}</p>
                  <div className="node-foot">
                    <span className="addr">node://<b>{p.slug}</b></span>
                    {p.url && <span className="go">connect →</span>}
                  </div>
                </>
              );
              return p.url ? (
                <a
                  key={p.slug}
                  className="node"
                  style={{ ["--c" as string]: tier.color }}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <article key={p.slug} className="node" style={{ ["--c" as string]: tier.color }}>
                  {inner}
                </article>
              );
            })}

            {/* OPEN SLOT */}
            <a className="node slot" href="mailto:sponsoring@svsit.nl?subject=Partner%20worden%20bij%20SIT">
              <Pins />
              <Corners />
              <div className="spot" />
              <div className="slot-plus">+</div>
              <p className="slot-cmd">
                <span className="c-green">$</span> partner --add<span className="cur" />
              </p>
              <p className="slot-sub">jouw logo hier · sponsoring@svsit.nl</p>
            </a>
          </div>
        </div>

        <div className="legend">
          <span className="c-green">// tiers</span>
          {TIER_ORDER.map((t) => (
            <span className="tier" key={t}>
              <i style={{ background: TIER_META[t].color }} />
              {TIER_META[t].label.charAt(0) + TIER_META[t].label.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
