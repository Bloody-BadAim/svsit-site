interface SectionDividerProps {
  variant?: "glow" | "line" | "fade" | "battle";
  className?: string;
}

const VARIANTS: Record<string, React.CSSProperties> = {
  glow: {
    height: 100,
    background:
      "radial-gradient(ellipse 50% 100% at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)",
  },
  line: {
    height: 96,
    backgroundImage:
      "linear-gradient(to right, transparent, rgba(245, 158, 11, 0.15) 20%, rgba(59, 130, 246, 0.1) 60%, transparent)",
    backgroundSize: "100% 1px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  fade: {
    height: 96,
    background:
      "linear-gradient(to bottom, rgba(9, 9, 11, 0) 0%, rgba(245, 158, 11, 0.03) 50%, rgba(9, 9, 11, 0) 100%)",
  },
};

/* ═══════════════════════════════════════════════
   Pixel Art Characters — box-shadow technique
   Each character is a 1x1 div scaled up, with
   box-shadows defining every pixel.
   ═══════════════════════════════════════════════ */

type PixelRow = (string | 0)[];

const G = "#F59E0B"; // gold
const Gd = "#92400E"; // dark gold
const Gl = "#FBBF24"; // light gold
const B = "#3B82F6"; // blue
const Bd = "#1E40AF"; // dark blue
const Bl = "#93C5FD"; // light blue
const S = "#FDE68A"; // skin
const R = "#EF4444"; // red (effects)

// Knight facing right — 9×11
const KNIGHT: PixelRow[] = [
  [0, 0, Gd, Gd, Gd, 0, 0, 0, 0],
  [0, Gd, G, G, G, Gd, 0, 0, 0],
  [0, 0, S, S, S, 0, 0, 0, 0],
  [0, 0, 0, G, 0, 0, 0, 0, 0],
  [0, Gd, G, G, G, Gd, 0, 0, 0],
  [Gd, G, G, G, G, G, Gd, 0, 0],
  [0, 0, G, G, G, 0, 0, Gl, 0],
  [0, 0, 0, G, 0, 0, Gl, 0, 0],
  [0, 0, G, 0, G, Gl, 0, 0, 0],
  [0, 0, G, 0, 0, G, 0, 0, 0],
  [0, Gd, G, 0, 0, G, Gd, 0, 0],
];

// Mage facing left — 9×11
const MAGE: PixelRow[] = [
  [0, 0, 0, 0, 0, Bd, 0, 0, 0],
  [0, 0, 0, 0, Bd, Bd, Bd, 0, 0],
  [0, 0, 0, Bd, B, B, B, Bd, 0],
  [0, 0, 0, 0, S, S, S, 0, 0],
  [0, 0, 0, 0, 0, B, 0, 0, 0],
  [0, 0, 0, Bd, B, B, B, Bd, 0],
  [0, 0, Bd, B, B, B, B, B, Bd],
  [0, Bl, 0, 0, B, B, B, 0, 0],
  [0, 0, Bl, 0, 0, B, 0, 0, 0],
  [0, 0, 0, Bl, B, 0, 0, B, 0],
  [0, 0, 0, 0, B, Bd, 0, B, Bd],
];

const PX = 4; // pixel size

function pixelsToShadow(grid: PixelRow[]): string {
  const parts: string[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      if (c !== 0) parts.push(`${x * PX}px ${y * PX}px 0 0 ${c}`);
    }
  }
  return parts.join(",");
}

const knightShadow = pixelsToShadow(KNIGHT);
const mageShadow = pixelsToShadow(MAGE);

function PixelBattle() {
  return (
    <div
      aria-hidden="true"
      className="w-full pointer-events-none flex items-center justify-center"
      style={{
        height: 140,
        background: "rgba(9, 9, 11, 0.7)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle dark surface behind characters */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 80,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Battle arena */}
      <div
        className="relative flex items-end gap-16"
        style={{ height: KNIGHT.length * PX + 8 }}
      >
        {/* Knight (gold, left side) */}
        <div
          style={{
            animation: "pixelBattle 4s ease-in-out infinite",
            ["--attack-dir" as string]: "8px",
          }}
        >
          <div
            style={{
              width: 1,
              height: 1,
              boxShadow: knightShadow,
              overflow: "hidden",
            }}
          />
        </div>

        {/* Clash sparks (between the two) */}
        <div className="relative" style={{ width: 8 }}>
          <div
            style={{
              position: "absolute",
              left: -2,
              top: -6,
              width: 3,
              height: 3,
              background: R,
              borderRadius: "50%",
              animation: "pixelSpark 4s ease-in-out infinite",
              boxShadow: `0 0 6px ${R}80`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 2,
              top: 2,
              width: 2,
              height: 2,
              background: Gl,
              borderRadius: "50%",
              animation: "pixelSpark 4s ease-in-out infinite 0.15s",
              boxShadow: `0 0 4px ${Gl}60`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -1,
              top: 6,
              width: 2,
              height: 2,
              background: Bl,
              borderRadius: "50%",
              animation: "pixelSpark 4s ease-in-out infinite 0.08s",
              boxShadow: `0 0 4px ${Bl}60`,
            }}
          />
        </div>

        {/* Mage (blue, right side) */}
        <div
          style={{
            animation: "pixelBattle 4s ease-in-out infinite 0.5s",
            ["--attack-dir" as string]: "-8px",
          }}
        >
          <div
            style={{
              width: 1,
              height: 1,
              boxShadow: mageShadow,
              overflow: "hidden",
            }}
          />
        </div>
      </div>

      {/* Ground shadow */}
      <div
        className="absolute"
        style={{
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 2,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function SectionDivider({
  variant = "line",
  className = "",
}: SectionDividerProps) {
  if (variant === "battle") {
    return <PixelBattle />;
  }

  return (
    <div
      aria-hidden="true"
      className={`w-full pointer-events-none ${className}`}
      style={VARIANTS[variant]}
    />
  );
}
