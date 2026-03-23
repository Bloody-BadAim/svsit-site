"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "@/components/SectionLabel";

gsap.registerPlugin(ScrollTrigger);

const members = [
  {
    name: "Matin",
    role: "Voorzitter",
    initials: "MK",
    image: "/bestuur/matin.jpeg",
    code: "// voorzitter | fullstack dev | ADHD powered",
    accent: "var(--color-accent-gold)",
  },
  {
    name: "Riley",
    role: "Penningmeester",
    initials: "RL",
    image: "/bestuur/riley.png",
    code: "// penningmeester | houdt de centen bij",
    accent: "var(--color-accent-blue)",
  },
  {
    name: "Hugo",
    role: "Algemeen bestuurslid",
    initials: "HG",
    image: "/bestuur/hugo.png",
    code: "// algemeen bestuurslid | verbindt iedereen",
    accent: "var(--color-accent-red)",
  },
  {
    name: "Idil",
    role: "Secretaris",
    initials: "ID",
    image: "/bestuur/idil.jpeg",
    code: "// secretaris | FemIT x SIT",
    accent: "var(--color-accent-green)",
  },
];

export default function Board() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Featured member entrance
      if (featuredRef.current) {
        const photo = featuredRef.current.querySelector(".featured-photo");
        const info = featuredRef.current.querySelector(".featured-info");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: featuredRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.fromTo(
          photo,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }
        ).fromTo(
          info,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
          0.15
        );
      }

      // Strip members entrance
      if (stripRef.current) {
        const items = stripRef.current.querySelectorAll(".board-member");
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: stripRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax: bestuur tag
      const tag = sectionRef.current?.querySelector(".board-tag");
      if (tag) {
        gsap.to(tag, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const [featured, ...rest] = members;

  return (
    <section
      ref={sectionRef}
      id="bestuur"
      className="relative pt-48 md:pt-64 pb-48 md:pb-64 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <SectionLabel number="04" label="bestuur xi" />

        {/* Featured voorzitter */}
        <div
          ref={featuredRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-border)] mb-px"
        >
          {/* Photo */}
          <div className="featured-photo group relative bg-[var(--color-bg)] overflow-hidden aspect-[3/4] md:aspect-auto md:min-h-[480px]">
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              className="object-cover object-top transition-all duration-500 group-hover:scale-105 brightness-90 contrast-105"
            />
            {/* Bottom gradient — lightens on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent group-hover:opacity-60 transition-opacity duration-500" />
            {/* Hover border glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: `inset 0 0 0 1px ${featured.accent}` }}
            />
            {/* Giant initials watermark — fades on hover */}
            <span className="absolute top-6 left-8 font-mono text-7xl md:text-8xl font-bold text-white/10 group-hover:text-white/[0.03] pointer-events-none select-none transition-all duration-500">
              {featured.initials}
            </span>
          </div>

          {/* Info panel */}
          <div className="featured-info bg-[var(--color-bg)] flex flex-col justify-end p-10 md:p-14 lg:p-16">
            <span
              className="font-mono text-sm font-bold tracking-[0.25em] uppercase mb-4"
              style={{ color: featured.accent }}
            >
              {featured.role}
            </span>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none mb-6">
              {featured.name}
            </h3>
            <div
              className="font-mono text-base md:text-lg leading-relaxed"
              style={{ color: featured.accent }}
            >
              {featured.code}
            </div>

            {/* Decorative line */}
            <div
              className="h-[2px] w-24 group-hover:w-40 mt-8 transition-all duration-500"
              style={{
                background: `linear-gradient(to right, ${featured.accent}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* Other members — horizontal strip */}
        <div
          ref={stripRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--color-border)]"
        >
          {rest.map((member) => (
            <div
              key={member.name}
              className="board-member group relative bg-[var(--color-bg)] overflow-hidden"
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  quality={85}
                  className="object-cover object-top transition-all duration-500 group-hover:scale-105 brightness-90 contrast-105"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
                {/* Hover border glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 0 1px ${member.accent}` }}
                />
                {/* Initials watermark — fades on hover */}
                <span className="absolute top-4 left-6 font-mono text-4xl md:text-5xl font-bold text-white/10 group-hover:text-white/[0.03] pointer-events-none select-none transition-all duration-500">
                  {member.initials}
                </span>
              </div>

              {/* Info below photo */}
              <div className="p-6 md:p-8">
                <span
                  className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase block mb-2"
                  style={{ color: member.accent }}
                >
                  {member.role}
                </span>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
                  {member.name}
                </h3>
                <div
                  className="font-mono text-[13px] md:text-sm leading-relaxed opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                  style={{ color: member.accent }}
                >
                  {member.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
