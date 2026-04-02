"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true); // default hidden until we detect pointer

  useEffect(() => {
    // Detect if device has fine pointer (not touch)
    const mql = window.matchMedia("(pointer: fine)");
    setIsTouch(!mql.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsTouch(!e.matches);
    mql.addEventListener("change", handleChange);

    if (!mql.matches) return; // Don't set up cursor on touch devices

    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) return;

    let mouseX = -100;
    let mouseY = -100;
    let circleX = -100;
    let circleY = -100;
    let animationId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows immediately
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    };

    const animate = () => {
      // Lerp the circle position
      circleX += (mouseX - circleX) * 0.15;
      circleY += (mouseY - circleY) * 0.15;
      circle.style.transform = `translate(${circleX - 18}px, ${circleY - 18}px)`;
      animationId = requestAnimationFrame(animate);
    };

    const setInteractive = () => {
      circle.style.width = "54px";
      circle.style.height = "54px";
      circle.style.marginLeft = "-9px";
      circle.style.marginTop = "-9px";
      circle.style.borderColor = "var(--color-accent-gold)";
      circle.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
    };

    const setText = () => {
      circle.style.width = "24px";
      circle.style.height = "24px";
      circle.style.marginLeft = "6px";
      circle.style.marginTop = "6px";
    };

    const resetCircle = () => {
      circle.style.width = "36px";
      circle.style.height = "36px";
      circle.style.marginLeft = "0px";
      circle.style.marginTop = "0px";
      circle.style.borderColor = "rgba(255, 255, 255, 0.3)";
      circle.style.backgroundColor = "transparent";
    };

    // Event delegation: single listener on document instead of per-element
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, select, textarea")) {
        setInteractive();
      } else if (target.closest("p, h1, h2, h3, h4, h5, h6, span, li")) {
        setText();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;
      // Only reset when leaving an interactive/text element to a non-interactive/text element
      if (
        target.closest("a, button, [role='button'], input, select, textarea") &&
        !related?.closest("a, button, [role='button'], input, select, textarea")
      ) {
        resetCircle();
      } else if (
        target.closest("p, h1, h2, h3, h4, h5, h6, span, li") &&
        !related?.closest("p, h1, h2, h3, h4, h5, h6, span, li") &&
        !related?.closest("a, button, [role='button'], input, select, textarea")
      ) {
        resetCircle();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    animationId = requestAnimationFrame(animate);

    // Add cursor: none to body via CSS class (no MutationObserver needed)
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.textContent = "a,button,[role='button'],input,select,textarea,p,h1,h2,h3,h4,h5,h6,span,li{cursor:none!important}";
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(animationId);
      document.body.style.cursor = "";
      style.remove();
      mql.removeEventListener("change", handleChange);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[10000] pointer-events-none"
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent-gold)",
        }}
      />
      {/* Circle */}
      <div
        ref={circleRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          backgroundColor: "transparent",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, margin 0.2s ease",
        }}
      />
    </>
  );
}
