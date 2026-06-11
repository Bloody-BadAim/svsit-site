"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PARTNERS, TIER_META, TIER_ORDER } from "@/lib/partners";
import { SITE_CONFIG } from "@/lib/constants";
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
  const t = useTranslations("partnersNetwork");
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
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="p-title">
            {t("titlePre")}<span className="b">·</span>{t("titlePost")}
          </h1>
          <p className="p-status">
            <span className="live"><i />root@sit:~/network</span>
            <span className="sep">$</span>
            <span>{t("statusCommand")}</span>
            <span className="sep">·</span>
            <span><b>{connected}</b> {t("statusConnected")}</span>
            <span className="sep">·</span>
            <span>{t("statusSlotsLabel")} <b>{t("statusSlotsValue")}</b></span>
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
                <span className="onl"><i />{t("coreOnline")}</span>
              </div>
              <h3 className="node-logo"><span className="b">{"{"}</span>SIT<span className="b">{"}"}</span> {t("coreTitle")}</h3>
              <p className="node-tag">
                {t("coreTagPre")}{" "}
                <b style={{ color: "var(--color-text)", fontWeight: 500 }}>100+</b> {t("coreTagPost")}
              </p>
              <div className="node-foot"><span className="addr">{t("coreStatusLabel")} · <b>{t("coreStatusValue")}</b></span></div>
            </article>

            {/* Partners */}
            {PARTNERS.map((p) => {
              const tier = TIER_META[p.tier];
              const isHboIct = p.slug === "hbo-ict";
              const isFemIt = p.slug === "femit";
              // HBO-ICT is the home opleiding: brand it with the HBO-ICT
              // indigo/purple accent instead of the generic tier color.
              // FemIT gets its own purple brand accent + logo mark.
              const accent = isHboIct ? "#0F00AF" : isFemIt ? "#5B2BD6" : tier.color;
              const nodeStyle = isHboIct
                ? {
                    ["--c" as string]: accent,
                    ["--hboict-blue" as string]: "#0F00AF",
                    ["--hboict-purple" as string]: "#8500E9",
                    ["--hboict-cyan" as string]: "#00FFFF",
                    ["--hboict-red" as string]: "#FF003C",
                  }
                : { ["--c" as string]: accent };
              const nodeClass = isHboIct
                ? "node hboict"
                : isFemIt
                  ? "node femit"
                  : "node";
              const inner = (
                <>
                  <Pins />
                  <Corners />
                  <div className="spot" />
                  <div className="scan" />
                  <div className="node-head">
                    <span className="badge">{isHboIct ? t("badgeHome") : tier.label}</span>
                    <span className="onl"><i />{t("nodeOnline")}</span>
                  </div>
                  {isHboIct ? (
                    <h3 className="node-logo hboict-logo">
                      <Image
                        src="/hbo-ict-wit.png"
                        alt="HBO-ICT"
                        width={177}
                        height={30}
                        priority={false}
                      />
                    </h3>
                  ) : isFemIt ? (
                    <h3 className="node-logo femit-logo">
                      <Image
                        className="femit-mark"
                        src="/femit-logo.png"
                        alt="FemIT"
                        width={56}
                        height={56}
                        priority={false}
                      />
                      <TextScramble as="span" trigger={inView} duration={0.6} speed={0.03}>
                        {p.name}
                      </TextScramble>
                    </h3>
                  ) : p.logo ? (
                    <h3 className="node-logo brand-logo">
                      <Image
                        src={p.logo.src}
                        alt={p.name}
                        width={p.logo.width}
                        height={p.logo.height}
                        priority={false}
                        unoptimized
                      />
                    </h3>
                  ) : (
                    <h3 className="node-logo">
                      <TextScramble as="span" trigger={inView} duration={0.6} speed={0.03}>
                        {p.name}
                      </TextScramble>
                    </h3>
                  )}
                  <p className="node-tag">{p.tagline}</p>
                  <div className="node-foot">
                    <span className="addr">node://<b>{p.slug}</b></span>
                    {p.url && <span className="go">{t("nodeConnect")}</span>}
                  </div>
                </>
              );
              return p.url ? (
                <a
                  key={p.slug}
                  className={nodeClass}
                  style={nodeStyle}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <article key={p.slug} className={nodeClass} style={nodeStyle}>
                  {inner}
                </article>
              );
            })}

            {/* OPEN SLOT */}
            <a className="node slot" href={`mailto:${SITE_CONFIG.sponsoringEmail}?subject=Partner%20worden%20bij%20SIT`}>
              <Pins />
              <Corners />
              <div className="spot" />
              <div className="slot-plus">+</div>
              <p className="slot-cmd">
                <span className="c-green">$</span> partner --add<span className="cur" />
              </p>
              <p className="slot-sub">{t("slotSub")} · {SITE_CONFIG.sponsoringEmail}</p>
            </a>
          </div>
        </div>

        <div className="legend">
          <span className="c-green">{t("legendLabel")}</span>
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
