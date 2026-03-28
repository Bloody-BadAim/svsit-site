"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";

// ─── Types ───────────────────────────────────────────────
type ObjectType = "coffee" | "laptop" | "pizza" | "bug";

interface FallingObject {
  x: number;
  y: number;
  type: ObjectType;
  width: number;
  height: number;
  speed: number;
}

interface GameState {
  playerX: number;
  playerY: number;
  score: number;
  timeLeft: number;
  objects: FallingObject[];
  gameOver: boolean;
  flashRed: number; // frames remaining for red flash
}

// ─── Constants ───────────────────────────────────────────
const CANVAS_W = 640;
const CANVAS_H = 480;
const PLAYER_SIZE = 40;
const PLAYER_SPEED = 5;
const GAME_DURATION = 15; // seconds
const BRAND = {
  gold: "#F29E18",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
  bg: "#09090B",
  surface: "#111113",
  text: "#FAFAFA",
  muted: "#71717A",
};

const OBJECT_CONFIG: Record<ObjectType, { points: number; color: string; w: number; h: number }> = {
  coffee: { points: 10, color: BRAND.gold, w: 20, h: 28 },
  laptop: { points: 25, color: BRAND.blue, w: 30, h: 20 },
  pizza: { points: 15, color: BRAND.red, w: 24, h: 22 },
  bug: { points: -20, color: BRAND.muted, w: 18, h: 18 },
};

// ─── Drawing helpers ─────────────────────────────────────
function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Gold square
  ctx.fillStyle = BRAND.gold;
  ctx.fillRect(x, y, PLAYER_SIZE, PLAYER_SIZE);
  // {SIT} text
  ctx.fillStyle = BRAND.bg;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("{SIT}", x + PLAYER_SIZE / 2, y + PLAYER_SIZE / 2);
}

function drawCoffee(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 2;
  // Cup body
  ctx.strokeRect(x + 2, y + 4, w - 6, h - 6);
  // Handle
  ctx.beginPath();
  ctx.arc(x + w - 3, y + h / 2, 4, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Steam
  ctx.strokeStyle = BRAND.gold + "80";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 3, y + 2);
  ctx.quadraticCurveTo(x + w / 2 - 1, y - 3, x + w / 2 + 1, y + 1);
  ctx.stroke();
}

function drawLaptop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = BRAND.blue;
  // Screen
  ctx.fillRect(x + 2, y, w - 4, h - 5);
  // Screen inner
  ctx.fillStyle = BRAND.bg;
  ctx.fillRect(x + 4, y + 2, w - 8, h - 9);
  // Base
  ctx.fillStyle = BRAND.blue;
  ctx.fillRect(x, y + h - 4, w, 4);
  // Screen content dot
  ctx.fillStyle = BRAND.green;
  ctx.fillRect(x + w / 2 - 2, y + h / 2 - 4, 4, 3);
}

function drawPizza(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = BRAND.red;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  // Toppings
  ctx.fillStyle = BRAND.gold;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.35, y + h * 0.7, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBug(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = BRAND.muted;
  ctx.lineWidth = 2.5;
  // X shape
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(x + w - 2, y + h - 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w - 2, y + 2);
  ctx.lineTo(x + 2, y + h - 2);
  ctx.stroke();
  // Circle around
  ctx.strokeStyle = BRAND.red + "60";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawObject(ctx: CanvasRenderingContext2D, obj: FallingObject) {
  switch (obj.type) {
    case "coffee": drawCoffee(ctx, obj.x, obj.y, obj.width, obj.height); break;
    case "laptop": drawLaptop(ctx, obj.x, obj.y, obj.width, obj.height); break;
    case "pizza": drawPizza(ctx, obj.x, obj.y, obj.width, obj.height); break;
    case "bug": drawBug(ctx, obj.x, obj.y, obj.width, obj.height); break;
  }
}

// ─── AABB collision ──────────────────────────────────────
function collides(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── Score messages ──────────────────────────────────────
function getScoreMessage(score: number): string {
  if (score > 200) return "// je bent klaar voor de hackathon";
  if (score > 100) return "// niet slecht voor een eerstejaars";
  return "// probeer het nog eens na een borrel";
}

// ─── Component ───────────────────────────────────────────
export default function KonamiGame() {
  const [active, setActive] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const startTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const handleActivate = useCallback(() => {
    setActive(true);
    setShowGame(true);
    setGameOver(false);
    setFinalScore(0);
  }, []);

  useKonamiCode(handleActivate);

  // Close game
  const closeGame = useCallback(() => {
    setActive(false);
    setShowGame(false);
    setGameOver(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    gameStateRef.current = null;
  }, []);

  // ESC to close
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGame();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, closeGame]);

  // Key tracking
  useEffect(() => {
    if (!showGame || gameOver) return;
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      // Prevent arrow key scrolling
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keysRef.current.clear();
    };
  }, [showGame, gameOver]);

  // Body scroll lock
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [active]);

  // Game loop
  useEffect(() => {
    if (!showGame || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize
    gameStateRef.current = {
      playerX: CANVAS_W / 2 - PLAYER_SIZE / 2,
      playerY: CANVAS_H - PLAYER_SIZE - 20,
      score: 0,
      timeLeft: GAME_DURATION,
      objects: [],
      gameOver: false,
      flashRed: 0,
    };
    startTimeRef.current = performance.now();
    lastSpawnRef.current = 0;

    function spawnObject(elapsed: number): FallingObject {
      const types: ObjectType[] = ["coffee", "laptop", "pizza", "bug"];
      // Bug chance increases over time: 15% base + 10% at end
      const bugChance = 0.15 + (elapsed / GAME_DURATION) * 0.1;
      const type = Math.random() < bugChance ? "bug" : types[Math.floor(Math.random() * 3)];
      const config = OBJECT_CONFIG[type];
      // Speed increases over time
      const speedMultiplier = 1 + (elapsed / GAME_DURATION) * 1.5;
      return {
        x: Math.random() * (CANVAS_W - config.w),
        y: -config.h,
        type,
        width: config.w,
        height: config.h,
        speed: (2 + Math.random() * 1.5) * speedMultiplier,
      };
    }

    function gameLoop() {
      const gs = gameStateRef.current;
      if (!gs || !ctx) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      gs.timeLeft = Math.max(0, GAME_DURATION - elapsed);

      if (gs.timeLeft <= 0 && !gs.gameOver) {
        gs.gameOver = true;
        setGameOver(true);
        setFinalScore(gs.score);
        return;
      }

      // Input
      const keys = keysRef.current;
      if (keys.has("arrowleft") || keys.has("a")) gs.playerX = Math.max(0, gs.playerX - PLAYER_SPEED);
      if (keys.has("arrowright") || keys.has("d")) gs.playerX = Math.min(CANVAS_W - PLAYER_SIZE, gs.playerX + PLAYER_SPEED);
      if (keys.has("arrowup") || keys.has("w")) gs.playerY = Math.max(0, gs.playerY - PLAYER_SPEED);
      if (keys.has("arrowdown") || keys.has("s")) gs.playerY = Math.min(CANVAS_H - PLAYER_SIZE, gs.playerY + PLAYER_SPEED);

      // Spawn objects
      const spawnRate = 1 + (elapsed / GAME_DURATION) * 2.5; // objects per second
      const spawnInterval = 1 / spawnRate;
      if (elapsed - lastSpawnRef.current > spawnInterval) {
        gs.objects.push(spawnObject(elapsed));
        lastSpawnRef.current = elapsed;
      }

      // Update objects
      gs.objects = gs.objects.filter((obj) => {
        obj.y += obj.speed;
        // Off screen
        if (obj.y > CANVAS_H + 10) return false;
        // Collision
        if (collides(gs.playerX, gs.playerY, PLAYER_SIZE, PLAYER_SIZE, obj.x, obj.y, obj.width, obj.height)) {
          const config = OBJECT_CONFIG[obj.type];
          gs.score = Math.max(0, gs.score + config.points);
          if (obj.type === "bug") gs.flashRed = 6; // 6 frames of red flash
          return false;
        }
        return true;
      });

      // Flash decay
      if (gs.flashRed > 0) gs.flashRed--;

      // ─── Draw ───
      // Background
      ctx.fillStyle = gs.flashRed > 0 ? "#1a0000" : BRAND.bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < CANVAS_W; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, CANVAS_H);
        ctx.stroke();
      }
      for (let gy = 0; gy < CANVAS_H; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(CANVAS_W, gy);
        ctx.stroke();
      }

      // Red flash overlay
      if (gs.flashRed > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${gs.flashRed * 0.05})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      }

      // Objects
      gs.objects.forEach((obj) => drawObject(ctx, obj));

      // Player
      drawPlayer(ctx, gs.playerX, gs.playerY);

      // HUD
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      // Score
      ctx.fillStyle = BRAND.gold;
      ctx.fillText("SCORE", 16, 16);
      ctx.fillStyle = BRAND.text;
      ctx.fillText(`${gs.score}`, 90, 16);
      // Time
      ctx.textAlign = "right";
      ctx.fillStyle = gs.timeLeft < 5 ? BRAND.red : BRAND.muted;
      ctx.fillText(`${Math.ceil(gs.timeLeft)}s`, CANVAS_W - 16, 16);
      // Points legend
      ctx.textAlign = "left";
      ctx.font = "11px monospace";
      ctx.fillStyle = BRAND.muted;
      ctx.fillText("☕+10  💻+25  🍕+15  🐛-20", 16, CANVAS_H - 20);

      rafRef.current = requestAnimationFrame(gameLoop);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showGame, gameOver]);

  // Play again
  const playAgain = useCallback(() => {
    setGameOver(false);
    setFinalScore(0);
    // Game loop useEffect will restart
  }, []);

  if (!active) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(9, 9, 11, 0.96)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-jetbrains-mono), monospace",
      }}
    >
      {/* Close button */}
      <button
        onClick={closeGame}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          color: BRAND.muted,
          background: "none",
          border: `1px solid ${BRAND.muted}40`,
          padding: "8px 16px",
          fontFamily: "inherit",
          fontSize: "12px",
          cursor: "pointer",
          letterSpacing: "0.1em",
          transition: "all 200ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = BRAND.gold;
          e.currentTarget.style.borderColor = BRAND.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = BRAND.muted;
          e.currentTarget.style.borderColor = `${BRAND.muted}40`;
        }}
      >
        ESC / CLOSE
      </button>

      {/* Title */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <div style={{ color: BRAND.gold, fontSize: "10px", letterSpacing: "0.3em", opacity: 0.5, marginBottom: "4px" }}>
          KONAMI CODE ACTIVATED
        </div>
        <div style={{ color: BRAND.text, fontSize: "24px", fontWeight: 800, fontFamily: "var(--font-big-shoulders)", letterSpacing: "0.05em" }}>
          {"{ SIT } CATCH"}
        </div>
      </div>

      {!gameOver ? (
        <>
          {/* Canvas */}
          <div style={{ position: "relative", border: `1px solid ${BRAND.muted}30` }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ display: "block", maxWidth: "100%", height: "auto" }}
            />
            {/* CRT scanline overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                pointerEvents: "none",
              }}
            />
          </div>
          <div style={{ color: BRAND.muted, fontSize: "11px", marginTop: "12px", opacity: 0.5 }}>
            WASD / Arrow Keys to move — Catch items, avoid bugs
          </div>
        </>
      ) : (
        /* Game over screen */
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-big-shoulders)",
            fontSize: "64px",
            fontWeight: 900,
            color: BRAND.text,
            letterSpacing: "0.05em",
            marginBottom: "8px",
          }}>
            GAME OVER
          </div>

          <div style={{ marginBottom: "24px" }}>
            <span style={{ color: BRAND.muted, fontSize: "14px" }}>SCORE: </span>
            <span style={{ color: BRAND.gold, fontSize: "48px", fontWeight: 800, fontFamily: "var(--font-big-shoulders)" }}>
              {finalScore}
            </span>
          </div>

          <div style={{ color: BRAND.green, fontSize: "14px", opacity: 0.7, marginBottom: "40px" }}>
            {getScoreMessage(finalScore)}
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button
              onClick={playAgain}
              style={{
                padding: "12px 32px",
                background: BRAND.gold,
                color: BRAND.bg,
                border: "none",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "transform 200ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={closeGame}
              style={{
                padding: "12px 32px",
                background: "transparent",
                color: BRAND.muted,
                border: `1px solid ${BRAND.muted}40`,
                fontFamily: "inherit",
                fontSize: "13px",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = BRAND.text;
                e.currentTarget.style.borderColor = BRAND.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = BRAND.muted;
                e.currentTarget.style.borderColor = `${BRAND.muted}40`;
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
