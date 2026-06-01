// ---------------------------------------------------------------------------
// HboIctVormtaal — decoratieve SVG-band met de HBO-ICT chevron/parallellogram
// "»" vormtaal (afgeleid van de HvA-schildvleugel). Tessellatie van scherpe
// rechthoekige driehoeken + parallellogrammen in de HBO-ICT huisstijlkleuren,
// op transparante achtergrond zodat het op SIT's donkere surface zit.
//
// Puur decoratief: aria-hidden, geen externe deps, schaalt als band via
// preserveAspectRatio. Opacity gematigd -> leest als accent, niet als ruis.
// ---------------------------------------------------------------------------

import React from "react";

// Eén chevron-eenheid bouwt op een vierkant grid. We herhalen 'm horizontaal.
// Tile-breedte 48, hoogte 48. Twee parallellogram-"slagen" vormen de ">>".
const TILE = 48;
const REPEAT = 16; // genoeg om elke bandbreedte te vullen
const W = TILE * REPEAT;
const H = 48;

// HBO-ICT accentkleuren (cyclus). Indigo/rood/paars/cyaan, terughoudend.
const COLORS = [
  "var(--hboict-blue)",
  "var(--hboict-red)",
  "var(--hboict-purple)",
  "var(--hboict-cyan)",
];

// Eén chevron ">" als twee parallellogram-balken (boven- en onderhelft van het
// schildvleugel-motief). x = linker-startpunt van de tile.
function ChevronTile({ x, fill }: { x: number; fill: string }) {
  const slant = 14; // diagonale schuinte
  const bar = 10; // dikte van elke balk
  // bovenste balk: loopt van linksonder-midden naar rechts-boven
  const top = `${x},${H / 2} ${x + slant},${H / 2} ${x + slant * 2},${
    H / 2 - slant
  } ${x + slant * 2 - bar},${H / 2 - slant}`;
  // onderste balk: spiegelt naar rechts-onder
  const bottom = `${x + slant * 2},${H / 2 - slant + 0} ${x + slant * 2 - bar},${
    H / 2 - slant
  } ${x},${H / 2} ${x + slant},${H / 2} ${x + slant * 2},${H / 2 + slant} ${
    x + slant * 2 - bar
  },${H / 2 + slant}`;
  return (
    <g>
      <polygon points={top} fill={fill} />
      <polygon points={bottom} fill={fill} />
    </g>
  );
}

export default function HboIctVormtaal({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const tiles = Array.from({ length: REPEAT });
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      role="presentation"
      className={className}
      style={style}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Scherpe randen behouden, geen anti-alias zachtmaken van de geometrie */}
      <g shapeRendering="geometricPrecision">
        {tiles.map((_, i) => {
          const x = i * TILE + 4;
          const fill = COLORS[i % COLORS.length];
          return (
            <ChevronTile
              key={`chev-${i}`}
              x={x}
              fill={fill}
            />
          );
        })}
        {/* Modulaire pixel-blokken als ritmische onderlaag */}
        {tiles.map((_, i) => {
          const x = i * TILE + 30;
          const fill = COLORS[(i + 2) % COLORS.length];
          return (
            <rect
              key={`px-${i}`}
              x={x}
              y={H / 2 - 3}
              width={6}
              height={6}
              fill={fill}
              opacity={0.55}
            />
          );
        })}
      </g>
    </svg>
  );
}
