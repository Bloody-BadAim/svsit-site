"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const proPhotos = [
  "/slider/pro1.jpg",
  "/slider/pro2.jpg",
  "/slider/pro3.jpg",
  "/slider/pro4.jpg",
  "/slider/pro5.jpeg",
  "/slider/pro6.jpeg",
  "/slider/pro7.png",
];

const funPhotos = [
  "/slider/fun1.jpg",
  "/slider/fun2.jpg",
  "/slider/fun3.jpg",
  "/slider/fun9.jpeg",
  "/slider/fun5.jpg",
  "/slider/fun7.jpeg",
  "/slider/fun8.jpeg",
  "/slider/fun10.jpeg",
  "/slider/fun11.jpeg",
  "/slider/fun12.jpeg",
  "/slider/fun13.jpeg",
];

function SliderPhoto({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md"
      style={{
        width: 240,
        height: 320,
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="480px"
        quality={90}
        className="object-cover brightness-90 contrast-105"
      />
      {/* Dark gradient overlay for visual consistency */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      {/* Slow diagonal shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          backgroundSize: "300% 100%",
          animation: "shimmer 6s linear infinite",
        }}
      />
    </div>
  );
}

export default function EventPhotoSlider() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    gsap.set(wrapper, { autoAlpha: 0 });

    const whyJoin = document.getElementById("whyjoin");
    const joinCta = document.getElementById("join");

    const triggers: ScrollTrigger[] = [];

    if (whyJoin) {
      triggers.push(
        ScrollTrigger.create({
          trigger: whyJoin,
          start: "top 80%",
          onEnter: () => gsap.to(wrapper, { autoAlpha: 1, duration: 0.6 }),
          onLeaveBack: () => gsap.to(wrapper, { autoAlpha: 0, duration: 0.4 }),
        })
      );
    }

    if (joinCta) {
      triggers.push(
        ScrollTrigger.create({
          trigger: joinCta,
          start: "top 80%",
          onEnter: () => gsap.to(wrapper, { autoAlpha: 0, duration: 0.4 }),
          onLeaveBack: () => gsap.to(wrapper, { autoAlpha: 1, duration: 0.6 }),
        })
      );
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  // 3x for seamless infinite loop
  const col1 = [...proPhotos, ...proPhotos, ...proPhotos];
  const col2 = [...funPhotos, ...funPhotos, ...funPhotos];

  return (
    <div
      ref={wrapperRef}
      className="fixed top-0 right-6 h-screen z-10 pointer-events-none hidden xl:flex gap-4 items-center"
      style={{
        opacity: 0,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%)",
        maskComposite: "intersect",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 25%)",
        WebkitMaskComposite: "source-in" as React.CSSProperties["WebkitMaskComposite"],
      }}
    >
      {/* Column 1: scrolls up (pro photos) */}
      <div className="overflow-hidden h-full" style={{ width: 240 }}>
        <div
          className="flex flex-col gap-4"
          style={{ animation: "sliderUp 45s linear infinite" }}
        >
          {col1.map((src, i) => (
            <SliderPhoto key={`pro-${i}`} src={src} />
          ))}
        </div>
      </div>

      {/* Column 2: scrolls down (fun photos) */}
      <div className="overflow-hidden h-full pointer-events-auto" style={{ width: 240, opacity: 0.92 }}>
        <div
          className="flex flex-col gap-4"
          style={{ animation: "sliderDown 45s linear infinite" }}
        >
          {col2.map((src, i) => (
            <SliderPhoto key={`fun-${i}`} src={src} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sliderUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes sliderDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
