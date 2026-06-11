"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import SitLogo from "@/components/SitLogo";
import MotionToggle from "@/components/MotionToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { SITE_CONFIG } from "@/lib/constants";

const navLinks = [
  { href: "/introweek", key: "introweek", highlight: true },
  { href: "/over-ons", key: "overOns" },
  { href: "/events", key: "events" },
  { href: "/projecten", key: "projecten" },
  { href: "/partners", key: "partners" },
  { href: "/vacatures", key: "vacatures" },
  { href: "/faq", key: "faq" },
] as const;

export default function Navbar() {
  const t = useTranslations("navbar");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const shouldScroll = window.scrollY > 50;
        setScrolled((prev) => (prev === shouldScroll ? prev : shouldScroll));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen
          ? "bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)]"
          : "bg-transparent"
          }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          {/* Logo with blinking cursor + HBO-ICT co-brand tag */}
          <a
            href="/"
            className="group/logo flex items-center gap-2.5 font-mono font-bold text-lg hover:drop-shadow-[0_0_8px_rgba(242,158,24,0.4)] transition-all duration-300"
          >
            <span>
              <span className="text-[var(--color-accent-gold)]">{"{"}</span>
              <span className="text-[var(--color-text)]">SIT</span>
              <span className="text-[var(--color-accent-gold)]">{"}"}</span>
            </span>
            {/* <span className="inline-block w-[2px] h-[1em] bg-[var(--color-accent-gold)] ml-0.5 align-middle animate-pulse" /> */}
            <span className="hidden sm:inline-block font-mono text-[11px] font-normal text-[var(--color-text-muted)] tracking-tight border-l border-[var(--color-border)] pl-2.5 group-hover/logo:text-[var(--color-text)] transition-colors duration-300">
              {t("logoTag")}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 font-mono text-sm text-[var(--color-text-muted)]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative hover:text-[var(--color-text)] hover:-translate-y-0.5 transition-all duration-300 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-accent-gold)] after:transition-all after:duration-300 hover:after:w-full ${'highlight' in link && link.highlight ? 'text-[var(--color-accent-gold)] font-semibold' : ''}`}
              >
                {t(`links.${link.key}`)}
              </a>
            ))}
            <LanguageSwitcher />
            <MotionToggle />
            <a
              href="/login"
              className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] overflow-hidden hover:border-[var(--color-accent-blue)] hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-300"
            >
              $ login
            </a>
            <a
              href="/#join"
              className="group/lid relative px-4 py-2 border border-[var(--color-accent-gold)] text-[var(--color-accent-gold)] overflow-hidden hover:text-[var(--color-bg)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(242,158,24,0.25)]"
            >
              <div className="absolute inset-0 bg-[var(--color-accent-gold)] translate-y-full group-hover/lid:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">$ join --now</span>
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="relative md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px] cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-6 h-[2px] bg-[var(--color-text)] transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none",
                backgroundColor: menuOpen ? "var(--color-accent-gold)" : "var(--color-text)",
              }}
            />
            <span
              className="block w-6 h-[2px] bg-[var(--color-text)] transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "scaleX(1)" }}
            />
            <span
              className="block w-6 h-[2px] bg-[var(--color-text)] transition-all duration-300 origin-center"
              style={{
                transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none",
                backgroundColor: menuOpen ? "var(--color-accent-gold)" : "var(--color-text)",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[45] md:hidden transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        style={{ background: "rgba(9, 9, 11, 0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col justify-start items-start h-full px-8 pt-24 pb-8 overflow-y-auto">
          <nav className="flex flex-col gap-5 mb-10">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="group/mlink flex flex-col text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-all duration-300"
                style={{
                  transform: menuOpen ? "translateX(0)" : "translateX(-30px)",
                  opacity: menuOpen ? 1 : 0,
                  transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${menuOpen ? 0.1 + i * 0.08 : 0}s`,
                }}
              >
                <span className="text-[var(--color-accent-gold)] opacity-40 text-xs tracking-[0.3em]">
                  0{i + 1}
                </span>
                <span className="text-xl font-bold mt-1 group-hover/mlink:translate-x-2 transition-transform duration-300">
                  {t(`links.${link.key}`)}
                </span>
              </a>
            ))}

            <div
              className="flex flex-col gap-3 mt-4"
              style={{
                transform: menuOpen ? "translateX(0)" : "translateX(-30px)",
                opacity: menuOpen ? 1 : 0,
                transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${menuOpen ? 0.1 + navLinks.length * 0.08 : 0}s`,
              }}
            >
              <a
                href="/login"
                onClick={closeMenu}
                className="inline-block px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-muted)] font-mono font-bold text-base tracking-wide hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors duration-200"
              >
                $ login
              </a>
              <a
                href="/#join"
                onClick={closeMenu}
                className="inline-block px-6 py-3 bg-[var(--color-accent-gold)] text-[var(--color-bg)] font-mono font-bold text-base tracking-wide"
              >
                $ join --now
              </a>
            </div>
          </nav>

          <div
            className="flex flex-col gap-3"
            style={{ opacity: menuOpen ? 1 : 0, transition: `opacity 0.4s ease ${menuOpen ? 0.5 : 0}s` }}
          >
            <a href={`mailto:${SITE_CONFIG.email}`} className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-300">
              {SITE_CONFIG.email}
            </a>
            <a href={SITE_CONFIG.socials.instagram.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-300">
              @sv.sit - Instagram
            </a>
            <a href={SITE_CONFIG.socials.tiktok.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-300">
              @sit_hva - TikTok
            </a>
            <a href={SITE_CONFIG.socials.whatsapp.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-300">
              {t("whatsapp")}
            </a>
            <a href={SITE_CONFIG.socials.discord.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-gold)] transition-colors duration-300">
              {t("discord")}
            </a>
            <div className="flex items-center gap-3 pt-1">
              <LanguageSwitcher />
              <MotionToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
