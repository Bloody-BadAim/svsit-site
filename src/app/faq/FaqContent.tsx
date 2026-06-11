"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";
import {
  ChevronDown,
  Ticket,
  Users,
  Zap,
  CreditCard,
  GraduationCap,
  Calendar,
  Trophy,
  Mail,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
  icon: typeof HelpCircle;
  color: string;
  link?: { href: string; label: string };
}

// ─── FAQ presentation metadata (icon, color, link target per item) ────────────

const FAQ_META: { icon: typeof HelpCircle; color: string; href?: string }[] = [
  { icon: Users, color: "#F29E18", href: "/over-ons" },
  { icon: CreditCard, color: "#22C55E", href: "/lid-worden" },
  { icon: Ticket, color: "#F29E18" },
  { icon: GraduationCap, color: "#3B82F6", href: "/lid-worden" },
  { icon: Calendar, color: "#EF4444", href: "/events" },
  { icon: Users, color: "#3B82F6", href: "/over-ons" },
  { icon: Trophy, color: "#F29E18", href: "/leaderboard" },
  { icon: Zap, color: "#22C55E" },
  { icon: Mail, color: "#3B82F6" },
];

// ─── Terminal dots helper ─────────────────────────────────────────────────────

function TerminalDots() {
  return (
    <div className="flex gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EF4444" }} />
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F29E18" }} />
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
    </div>
  );
}

// ─── Accordion item ───────────────────────────────────────────────────────────

function FaqAccordion({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;

  return (
    <div
      className="transition-all duration-300"
      style={{
        backgroundColor: isOpen ? "#18181B" : "transparent",
        border: `1px solid ${isOpen ? item.color + "30" : "#27272A"}`,
        borderRadius: 6,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        {/* Index + icon */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="font-mono text-[10px] tracking-wider"
            style={{ color: isOpen ? item.color : "#71717A" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className="w-8 h-8 rounded flex items-center justify-center transition-colors duration-200"
            style={{
              backgroundColor: isOpen ? item.color + "15" : "rgba(255,255,255,0.03)",
              border: `1px solid ${isOpen ? item.color + "30" : "#27272A"}`,
            }}
          >
            <Icon size={14} style={{ color: isOpen ? item.color : "#71717A" }} />
          </div>
        </div>

        {/* Question */}
        <span
          className="flex-1 font-mono text-sm transition-colors duration-200"
          style={{ color: isOpen ? "#FAFAFA" : "#A1A1AA" }}
        >
          {item.question}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={14}
          className="shrink-0 transition-transform duration-300"
          style={{
            color: isOpen ? item.color : "#71717A",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Answer */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pl-[4.25rem]">
          <p
            className="font-mono text-xs leading-relaxed mb-3"
            style={{ color: "#A1A1AA" }}
          >
            {item.answer}
          </p>
          {item.link && (
            <Link
              href={item.link.href}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold transition-colors hover:underline"
              style={{ color: item.color }}
            >
              {item.link.label}
              <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RawFaqItem {
  question: string;
  answer: string;
  linkLabel?: string;
}

export default function FaqContent() {
  const t = useTranslations("faqContent");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const raw = t.raw("items") as RawFaqItem[];
  const FAQ_ITEMS: FaqItem[] = raw.map((item, i) => {
    const meta = FAQ_META[i];
    const answer = t("items." + i + ".answer", {
      members: SITE_CONFIG.stats.members,
      commissies: SITE_CONFIG.stats.commissies,
      price: SITE_CONFIG.membership.priceLabel,
      email: SITE_CONFIG.email,
      instagram: SITE_CONFIG.socials.instagram.handle,
      tiktok: SITE_CONFIG.socials.tiktok.handle,
      venue: SITE_CONFIG.address.venue,
      floor: SITE_CONFIG.address.floor,
    });
    return {
      question: item.question,
      answer,
      icon: meta.icon,
      color: meta.color,
      link: meta.href && item.linkLabel ? { href: meta.href, label: item.linkLabel } : undefined,
    };
  });

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#F29E18 1px, transparent 1px), linear-gradient(90deg, #F29E18 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <TerminalDots />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "#71717A" }}>
              {t("fileLabel")}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-3">
            {t("titleLine1")}
            <br />
            <span style={{ color: "#F29E18" }}>{t("titleLine2")}</span>
          </h1>

          <p className="font-mono text-sm" style={{ color: "#71717A" }}>
            {t("subtitle")}
          </p>

          {/* Gold separator */}
          <div className="mt-6 h-px w-16" style={{ backgroundColor: "#F29E18" }} />
        </div>

        {/* FAQ list */}
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <FaqAccordion
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* CTA block */}
        <div
          className="mt-12 p-6 rounded-md"
          style={{
            backgroundColor: "#18181B",
            border: "1px solid #27272A",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TerminalDots />
            <span className="font-mono text-[10px] tracking-wider" style={{ color: "#71717A" }}>
              {t("ctaFileLabel")}
            </span>
          </div>

          <div className="font-mono text-xs leading-relaxed" style={{ color: "#A1A1AA" }}>
            <div>
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>echo</span>{" "}
              <span style={{ color: "#F29E18" }}>&quot;{t("ctaEcho")}&quot;</span>
            </div>
            <div className="mt-1">
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>mail</span>{" "}
              <span style={{ color: "#3B82F6" }}>{SITE_CONFIG.email}</span>
            </div>
            <div className="mt-1">
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>open</span>{" "}
              <span style={{ color: "#3B82F6" }}>instagram.com/sv.sit</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
              style={{
                color: "#F29E18",
                border: "1px solid rgba(242,158,24,0.3)",
                backgroundColor: "rgba(242,158,24,0.06)",
              }}
            >
              <Mail size={12} />
              {t("ctaMailUs")}
            </a>
            <Link
              href="/lid-worden"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider font-semibold transition-all hover:scale-[1.02]"
              style={{
                color: "#09090B",
                backgroundColor: "#F29E18",
              }}
            >
              {t("ctaJoin")}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
