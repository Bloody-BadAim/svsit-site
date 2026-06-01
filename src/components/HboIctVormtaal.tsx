// ---------------------------------------------------------------------------
// HboIctVormtaal: het HBO-ICT vormtaal als bold geometrisch SVG-motief.
// Twee varianten:
//   "triangles" (default) = tessellatie van scherpe driehoeken/parallellogrammen
//      in de HBO-ICT huisstijlkleuren (afgeleid van de schildvleugel).
//   "bands" = verticale spectrumbanden (cyaan/paars/rood/indigo), de derde
//      vormtaal uit de styleguide.
// Puur decoratief: aria-hidden, geen deps, schaalt via preserveAspectRatio.
// ---------------------------------------------------------------------------

import React from "react";

const COLORS = [
  "var(--hboict-blue)",
  "var(--hboict-red)",
  "var(--hboict-purple)",
  "var(--hboict-cyan)",
];

type Variant = "triangles" | "bands";

interface Props {
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
  /** aantal kolommen in de tessellatie (triangles) of banden (bands) */
  count?: number;
  /** transparantie van het hele motief */
  opacity?: number;
}

// Bold driehoek-tessellatie. Per cel een paar tegengestelde driehoeken zodat
// een doorlopend zigzag/pijl-veld ontstaat (de ">>" schildvleugel, groot).
function Triangles({ count }: { count: number }) {
  const TILE = 60;
  const H = 60;
  const W = TILE * count;
  const cells = Array.from({ length: count });
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <g shapeRendering="geometricPrecision">
        {cells.map((_, i) => {
          const x = i * TILE;
          const a = COLORS[i % COLORS.length];
          const b = COLORS[(i + 2) % COLORS.length];
          // bovenste driehoek wijst naar rechts, onderste naar links -> chevronveld
          const up = `${x},0 ${x + TILE},0 ${x + TILE},${H / 2} ${x},${H / 2 - TILE / 2 < 0 ? 0 : H / 2}`;
          const topTri = `${x},0 ${x + TILE},${H / 2} ${x},${H / 2}`;
          const botTri = `${x + TILE},${H / 2} ${x + TILE},${H} ${x},${H}`;
          return (
            <g key={i}>
              <polygon points={topTri} fill={a} />
              <polygon points={botTri} fill={b} />
            </g>
          );
        })}
        {/* dunne pixel-stappen als ritme-onderlaag (vormtaal II) */}
        {cells.map((_, i) => (
          <rect
            key={`px-${i}`}
            x={i * TILE + TILE - 8}
            y={H / 2 - 4}
            width={8}
            height={8}
            fill={COLORS[(i + 1) % COLORS.length]}
          />
        ))}
      </g>
    </svg>
  );
}

// Verticale spectrumbanden (vormtaal III).
function Bands({ count }: { count: number }) {
  const W = 100;
  const cells = Array.from({ length: count });
  const bw = W / count;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      viewBox={`0 0 ${W} 100`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {cells.map((_, i) => (
        <rect key={i} x={i * bw} y={0} width={bw + 0.5} height={100} fill={COLORS[i % COLORS.length]} />
      ))}
    </svg>
  );
}

export default function HboIctVormtaal({
  variant = "triangles",
  className,
  style,
  count,
  opacity = 1,
}: Props) {
  const n = count ?? (variant === "bands" ? 8 : 14);
  return (
    <div aria-hidden="true" className={className} style={{ opacity, ...style }}>
      {variant === "bands" ? <Bands count={n} /> : <Triangles count={n} />}
    </div>
  );
}
