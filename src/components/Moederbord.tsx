"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
} from "react";
import {
  PEOPLE,
  BESTUUR,
  COMMISSIES,
  STATUS_LABELS,
  JOIN_URL,
  memberName,
  type Commissie,
  type BoardMember,
} from "@/lib/moederbord";
import "./moederbord.css";

const cls = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(" ");

type Pt = [number, number];
interface Trace {
  id: string;
  color: string;
  pts: Pt[];
  d: string;
}
type HoverKind = "bestuur" | "commissie" | null;
interface HoverState {
  kind: HoverKind;
  id: string | null;
}
type Selected = { type: "bestuur" | "commissie"; id: string } | null;

// css custom-property style helper
type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

// ── chamfered IC-chip avatar ──
function Avatar({
  personKey,
  color,
  size,
}: {
  personKey: string | null;
  color: string;
  size: number;
}) {
  const p = personKey ? PEOPLE[personKey] : null;
  return (
    <span
      className="chip-frame"
      style={{ "--c": color, width: size, height: size } as CSSVars}
    >
      <span className="chip-inner">
        {p && p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt={p.name} width={size} height={size} loading="lazy" />
        ) : (
          <span
            className="chip-ini"
            style={{ color, fontSize: size * 0.34 }}
          >
            {p ? p.initials : "?"}
          </span>
        )}
      </span>
    </span>
  );
}

// ── geometry: PCB fan-out routing ──
function roundedPath(pts: Pt[], r: number): string {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const v1 = { x: x1 - x0, y: y1 - y0 };
    const v2 = { x: x2 - x1, y: y2 - y1 };
    const l1 = Math.hypot(v1.x, v1.y) || 1;
    const l2 = Math.hypot(v2.x, v2.y) || 1;
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const p1 = { x: x1 - (v1.x / l1) * rr, y: y1 - (v1.y / l1) * rr };
    const p2 = { x: x1 + (v2.x / l2) * rr, y: y1 + (v2.y / l2) * rr };
    d += ` L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${x1.toFixed(1)} ${y1.toFixed(
      1
    )} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
}

interface ModRect {
  id: string;
  color: string;
  rect: DOMRect;
}

function buildGeometry(
  stageRect: DOMRect,
  boardRect: DOMRect,
  modRects: ModRect[],
  mode: "h" | "v"
): Trace[] {
  const sx = stageRect.left;
  const sy = stageRect.top;
  const L = (r: DOMRect) => ({
    left: r.left - sx,
    top: r.top - sy,
    right: r.right - sx,
    bottom: r.bottom - sy,
    cx: (r.left + r.right) / 2 - sx,
    cy: (r.top + r.bottom) / 2 - sy,
    w: r.width,
    h: r.height,
  });
  const b = L(boardRect);
  const mods = modRects.map((m) => ({ id: m.id, color: m.color, ...L(m.rect) }));
  const n = mods.length;
  const traces: { id: string; color: string; pts: Pt[] }[] = [];

  if (mode === "h") {
    const sorted = mods.slice().sort((a, b2) => a.cx - b2.cx);
    const exitL = b.left + b.w * 0.12;
    const exitR = b.left + b.w * 0.88;
    const topY = Math.min(...mods.map((m) => m.top));
    const baseBreak = b.bottom + Math.max(26, (topY - b.bottom) * 0.34);
    sorted.forEach((m, i) => {
      const exitX = n > 1 ? exitL + (exitR - exitL) * (i / (n - 1)) : b.cx;
      const breakY = baseBreak + i * 9;
      const pts: Pt[] = [
        [exitX, b.bottom],
        [exitX, breakY],
        [m.cx, breakY],
        [m.cx, m.top],
      ];
      traces.push({ id: m.id, color: m.color, pts });
    });
  } else {
    const sorted = mods.slice().sort((a, b2) => a.top - b2.top);
    let prev = { cx: b.cx, bottom: b.bottom };
    sorted.forEach((m) => {
      const midY = (prev.bottom + m.top) / 2;
      const pts: Pt[] = [
        [prev.cx, prev.bottom],
        [prev.cx, midY],
        [m.cx, midY],
        [m.cx, m.top],
      ];
      traces.push({ id: m.id, color: m.color, pts });
      prev = m;
    });
  }
  return traces.map((t) => ({ ...t, d: roundedPath(t.pts, 9) }));
}

// ── Board chip (CPU core) ──
function BoardChip({
  m,
  active,
  dim,
  onHover,
  onClick,
}: {
  m: BoardMember;
  active: boolean;
  dim: boolean;
  onHover: (h: HoverState) => void;
  onClick: (s: Selected) => void;
}) {
  const p = PEOPLE[m.person];
  return (
    <button
      className={cls("board-chip", active && "is-active", dim && "is-dim")}
      style={{ "--c": m.color } as CSSVars}
      onMouseEnter={() => onHover({ kind: "bestuur", id: m.id })}
      onMouseLeave={() => onHover({ kind: null, id: null })}
      onFocus={() => onHover({ kind: "bestuur", id: m.id })}
      onBlur={() => onHover({ kind: null, id: null })}
      onClick={() => onClick({ type: "bestuur", id: m.id })}
    >
      <span className="board-code">{m.code}</span>
      <Avatar personKey={m.person} color={m.color} size={92} />
      <span className="board-name">{p.name}</span>
      <span className="board-role">{m.role}</span>
    </button>
  );
}

// ── Commissie module ──
function ModuleCard({
  c,
  active,
  dim,
  refCb,
  onHover,
  onClick,
}: {
  c: Commissie;
  active: boolean;
  dim: boolean;
  refCb: (el: HTMLButtonElement | null) => void;
  onHover: (h: HoverState) => void;
  onClick: (s: Selected) => void;
}) {
  const vz = c.voorzitter ? PEOPLE[c.voorzitter] : null;
  const statusColor =
    c.status === "actief"
      ? "#22C55E"
      : c.status === "nieuw"
      ? "#3B82F6"
      : "#F29E18";
  return (
    <button
      ref={refCb}
      className={cls("module", active && "is-active", dim && "is-dim")}
      style={{ "--c": c.color } as CSSVars}
      onMouseEnter={() => onHover({ kind: "commissie", id: c.id })}
      onMouseLeave={() => onHover({ kind: null, id: null })}
      onFocus={() => onHover({ kind: "commissie", id: c.id })}
      onBlur={() => onHover({ kind: null, id: null })}
      onClick={() => onClick({ type: "commissie", id: c.id })}
    >
      <span className="mod-pad" aria-hidden="true" />
      <span className="mod-head">
        <span className="mod-code">{c.code}</span>
        <span className="mod-status" style={{ "--st": statusColor } as CSSVars}>
          <i />
          {STATUS_LABELS[c.status]}
        </span>
      </span>
      <span className="mod-name">
        {c.name}
        {c.sub && <em>/{c.sub}</em>}
      </span>
      <span className="mod-vz">
        <Avatar personKey={c.voorzitter} color={c.color} size={44} />
        <span className="mod-vz-txt">
          <b>{vz ? vz.name : "Vacant"}</b>
          <i>{vz ? "Voorzitter" : "Zoekt voorzitter"}</i>
        </span>
      </span>
      <span className="mod-tag">{c.tagline}</span>
      <span className="mod-cta">
        open module <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}

// ── Detail sheet ──
function DetailSheet({
  selected,
  onClose,
}: {
  selected: Selected;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!selected) return null;
  const isComm = selected.type === "commissie";
  const c = isComm ? COMMISSIES.find((x) => x.id === selected.id) : null;
  const b = !isComm ? BESTUUR.find((x) => x.id === selected.id) : null;
  if (isComm && !c) return null;
  if (!isComm && !b) return null;

  const color = isComm ? c!.color : b!.color;
  const person = isComm
    ? c!.voorzitter
      ? PEOPLE[c!.voorzitter]
      : null
    : PEOPLE[b!.person];
  const tag = isComm ? c!.code.toLowerCase() : b!.person;
  const chairs = !isComm
    ? COMMISSIES.filter((x) => x.voorzitter === b!.person)
    : [];

  return (
    <div className="mb-sheet-wrap" onClick={onClose}>
      <div className="sheet-scrim" />
      <aside
        className="sheet"
        style={{ "--c": color } as CSSVars}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sheet-rail" />
        <div className="sheet-bar">
          <span className="sheet-prompt">
            <b style={{ color }}>{">"}</b> {isComm ? "commissie" : "bestuur"}
            .inspect(<em style={{ color }}>&quot;{tag}&quot;</em>)
          </span>
          <button className="sheet-x" onClick={onClose} aria-label="Sluiten">
            [esc]
          </button>
        </div>

        <div className="sheet-body">
          <div className="sheet-hero">
            <Avatar
              personKey={isComm ? c!.voorzitter : b!.person}
              color={color}
              size={108}
            />
            <div>
              {isComm ? (
                <>
                  <h2 className="sheet-title">
                    {c!.name}
                    {c!.sub && <em> /{c!.sub}</em>}
                  </h2>
                  <p className="sheet-sub" style={{ color }}>
                    {person ? `Voorzitter · ${person.name}` : "Zoekt voorzitter"}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="sheet-title">{person!.name}</h2>
                  <p className="sheet-sub" style={{ color }}>
                    {b!.role} · Bestuur XII
                  </p>
                </>
              )}
              <p className="sheet-meta">
                {isComm ? "// commissie" : "// core"} ·{" "}
                {isComm ? c!.code : b!.code}
              </p>
            </div>
          </div>

          {isComm && (
            <>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} tagline
                </p>
                <p className="sheet-quote" style={{ borderColor: color }}>
                  {c!.tagline}
                </p>
              </div>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} over
                </p>
                <p className="sheet-text">{c!.beschrijving}</p>
              </div>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} missie
                </p>
                <p className="sheet-quote" style={{ borderColor: color }}>
                  &quot;{c!.missie}&quot;
                </p>
              </div>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} activiteiten
                </p>
                <ul className="sheet-list">
                  {c!.activiteiten.map((a) => (
                    <li key={a}>
                      <span>$</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} team
                </p>
                <div className="sheet-chips">
                  {c!.leden.length > 0 ? (
                    c!.leden.map((lid) => (
                      <span key={lid} className="sheet-chip">
                        {memberName(lid)}
                        {lid === c!.voorzitter ? " ★" : ""}
                      </span>
                    ))
                  ) : (
                    <span className="sheet-text">
                      Nog geen leden - meld je aan!
                    </span>
                  )}
                </div>
              </div>
              <div className="sheet-cta">
                <a
                  className="btn-join"
                  style={{ "--c": color } as CSSVars}
                  href={JOIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WORD ACTIEF LID
                </a>
                <p className="sheet-fine">
                  Geen ervaring nodig - alleen motivatie.
                </p>
              </div>
            </>
          )}

          {!isComm && (
            <>
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} over
                </p>
                <p className="sheet-quote" style={{ borderColor: color }}>
                  {b!.over}
                </p>
              </div>
              {chairs.length > 0 && (
                <div className="sheet-block">
                  <p className="sheet-label" style={{ color }}>
                    {">"} voorzitter van
                  </p>
                  <div className="sheet-chips">
                    {chairs.map((x) => (
                      <span
                        key={x.id}
                        className="sheet-chip"
                        style={{ "--c": x.color } as CSSVars}
                      >
                        {x.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="sheet-block">
                <p className="sheet-label" style={{ color }}>
                  {">"} bereikbaar via
                </p>
                <p className="sheet-text">bestuur@svsit.nl</p>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Main ──
export default function Moederbord() {
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const modRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [geo, setGeo] = useState<Trace[]>([]);
  const [ready, setReady] = useState(false);
  const [flow, setFlow] = useState(true);
  const [hover, setHover] = useState<HoverState>({ kind: null, id: null });
  const [selected, setSelected] = useState<Selected>(null);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const board = boardRef.current;
    if (!stage || !board) return;
    const stageRect = stage.getBoundingClientRect();
    const modRects = COMMISSIES.map((c) => {
      const el = modRefs.current[c.id];
      return el ? { id: c.id, color: c.color, rect: el.getBoundingClientRect() } : null;
    }).filter(Boolean) as ModRect[];
    if (modRects.length !== COMMISSIES.length) return;
    const mode: "h" | "v" =
      modRects[1].rect.top - modRects[0].rect.top > 24 ? "v" : "h";
    setGeo(buildGeometry(stageRect, board.getBoundingClientRect(), modRects, mode));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", measure);
    const id = requestAnimationFrame(() => setReady(true));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setFlow(!reduce.matches);
    const onReduce = () => setFlow(!reduce.matches);
    reduce.addEventListener("change", onReduce);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(id);
      reduce.removeEventListener("change", onReduce);
    };
  }, [measure]);

  const anyHover = hover.id != null;
  const commActive = (id: string) => {
    if (!anyHover) return false;
    if (hover.kind === "commissie") return hover.id === id;
    if (hover.kind === "bestuur") {
      const c = COMMISSIES.find((x) => x.id === id);
      return !!c && c.voorzitter === hover.id;
    }
    return false;
  };
  const boardActive = (id: string) => {
    if (!anyHover) return false;
    if (hover.kind === "bestuur") return hover.id === id;
    if (hover.kind === "commissie") {
      const c = COMMISSIES.find((x) => x.id === hover.id);
      const m = BESTUUR.find((x) => x.id === id);
      return !!c && !!m && c.voorzitter === m.person;
    }
    return false;
  };

  return (
    <div className="mb-root gloed-1">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-orbs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="bg-scan" aria-hidden="true" />

      <div className="cb-head">
        <div className="cb-kicker">
          <span className="dot" />
          <span>// bestuur_xii - system map</span>
        </div>
        <h1 className="cb-title">
          HET <span>MOEDERBORD</span>
        </h1>
        <p className="cb-lede">
          SIT draait als één board. Het bestuur vormt de kern; elke commissie is
          een module die je kunt aansluiten. <b>Hover</b> over een baan,{" "}
          <b>klik</b> een module - en sluit jezelf aan.
        </p>
      </div>

      <div className="cb-stage" ref={stageRef}>
        <svg className="cb-traces" aria-hidden="true">
          {geo.map((tr, i) => (
            <g
              key={tr.id}
              className={cls(
                "trace",
                commActive(tr.id) && "is-active",
                anyHover && !commActive(tr.id) && "is-dim"
              )}
            >
              <path className="trace-glow" d={tr.d} stroke={tr.color} />
              <path
                className="trace-core"
                d={tr.d}
                stroke={tr.color}
                pathLength={1}
                style={{
                  strokeDashoffset: ready ? 0 : 1,
                  transitionDelay: `${0.25 + i * 0.07}s`,
                }}
              />
              <circle
                className="trace-pad"
                cx={tr.pts[0][0]}
                cy={tr.pts[0][1]}
                r="3.2"
                fill={tr.color}
              />
              <circle
                className="trace-pad"
                cx={tr.pts[tr.pts.length - 1][0]}
                cy={tr.pts[tr.pts.length - 1][1]}
                r="3.2"
                fill={tr.color}
              />
              {flow && ready && (
                <>
                  <circle className="packet" r="2.6" fill="#fff">
                    <animateMotion
                      dur={`${3 + i * 0.35}s`}
                      repeatCount="indefinite"
                      path={tr.d}
                    />
                  </circle>
                  <circle className="packet-halo" r="5" fill={tr.color}>
                    <animateMotion
                      dur={`${3 + i * 0.35}s`}
                      repeatCount="indefinite"
                      path={tr.d}
                    />
                  </circle>
                </>
              )}
            </g>
          ))}
        </svg>

        <div className="cb-board" ref={boardRef}>
          <span className="board-tab">CPU // BESTUUR XII</span>
          <div className="board-grid">
            {BESTUUR.map((m) => (
              <BoardChip
                key={m.id}
                m={m}
                active={boardActive(m.id)}
                dim={anyHover && !boardActive(m.id)}
                onHover={setHover}
                onClick={setSelected}
              />
            ))}
          </div>
        </div>

        <div className="cb-modules">
          {COMMISSIES.map((c) => (
            <ModuleCard
              key={c.id}
              c={c}
              active={commActive(c.id)}
              dim={anyHover && !commActive(c.id)}
              refCb={(el) => {
                modRefs.current[c.id] = el;
              }}
              onHover={setHover}
              onClick={setSelected}
            />
          ))}
        </div>
      </div>

      <div className="cb-foot">
        <div className="term">
          <div className="term-bar">
            <i />
            <i />
            <i />
            <span>aanmelden.sh</span>
          </div>
          <div className="term-body">
            <p>
              <span className="c-mut"># word geen toeschouwer, word een node</span>
            </p>
            <p>
              <span className="c-grn">echo</span>{" "}
              <span className="c-gld">
                &quot;Geen ervaring nodig, alleen motivatie&quot;
              </span>
            </p>
            <p>
              <span className="c-grn">sudo</span> join --commissie{" "}
              <span className="c-blu">&lt;jouw keuze&gt;</span>
              <span className="cur" />
            </p>
          </div>
        </div>
        <a
          className="btn-join lg"
          href={JOIN_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          MELD JE AAN
        </a>
        <p className="cb-mail">
          Of mail naar <a href="mailto:bestuur@svsit.nl">bestuur@svsit.nl</a>
        </p>
      </div>

      <DetailSheet selected={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
