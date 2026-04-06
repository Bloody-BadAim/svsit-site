"use client";

import React, { useState, useEffect, useRef } from "react";

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  actionArea?: "self" | "parent" | "global";
  springOptions?: unknown;
};

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = "self",
}: MagneticProps) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (isHovered && absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        el.style.transform = `translate(${distanceX * intensity * scale}px, ${distanceY * intensity * scale}px)`;
      } else {
        el.style.transform = "translate(0, 0)";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered, intensity, range]);

  useEffect(() => {
    if (actionArea === "parent" && ref.current?.parentElement) {
      const parent = ref.current.parentElement;
      const enter = () => setIsHovered(true);
      const leave = () => setIsHovered(false);
      parent.addEventListener("mouseenter", enter);
      parent.addEventListener("mouseleave", leave);
      return () => {
        parent.removeEventListener("mouseenter", enter);
        parent.removeEventListener("mouseleave", leave);
      };
    } else if (actionArea === "global") {
      setIsHovered(true);
    }
  }, [actionArea]);

  return (
    <div
      ref={ref}
      style={{
        transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        willChange: "transform",
      }}
      onMouseEnter={
        actionArea === "self" ? () => setIsHovered(true) : undefined
      }
      onMouseLeave={
        actionArea === "self"
          ? () => {
              setIsHovered(false);
              if (ref.current)
                ref.current.style.transform = "translate(0, 0)";
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
