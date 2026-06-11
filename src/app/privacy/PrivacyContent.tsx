"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";
import {
  ShieldCheck,
  Database,
  CreditCard,
  Mail,
  Cookie,
  UserCheck,
  Clock,
  Server,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  icon: typeof ShieldCheck;
  color: string;
  body: string[];
  list?: string[];
}

// ─── Section presentation metadata (id, icon, color) ──────────────────────────

const SECTION_META: { id: string; icon: typeof ShieldCheck; color: string }[] = [
  { id: "wie", icon: ShieldCheck, color: "#F29E18" },
  { id: "gegevens", icon: Database, color: "#3B82F6" },
  { id: "doel", icon: UserCheck, color: "#22C55E" },
  { id: "betaling", icon: CreditCard, color: "#22C55E" },
  { id: "verwerkers", icon: Server, color: "#A78BFA" },
  { id: "cookies", icon: Cookie, color: "#F29E18" },
  { id: "bewaartermijn", icon: Clock, color: "#3B82F6" },
  { id: "rechten", icon: UserCheck, color: "#22C55E" },
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

// ─── Main component ───────────────────────────────────────────────────────────

interface RawSection {
  title: string;
  body: string[];
  list?: string[];
}

export default function PrivacyContent() {
  const t = useTranslations("privacyContent");

  const interpolate = (text: string) =>
    text
      .replace("{email}", SITE_CONFIG.email)
      .replace("{venue}", SITE_CONFIG.address.venue)
      .replace("{street}", SITE_CONFIG.address.street)
      .replace("{postal}", SITE_CONFIG.address.postal);

  const SECTIONS: Section[] = SECTION_META.map((meta) => {
    const raw = t.raw("sections." + meta.id) as RawSection;
    return {
      id: meta.id,
      title: raw.title,
      icon: meta.icon,
      color: meta.color,
      body: raw.body.map(interpolate),
      list: raw.list,
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

          <p className="font-mono text-xs mt-2" style={{ color: "#52525B" }}>
            {t("lastUpdatedLabel", { date: t("lastUpdated") })}
          </p>

          {/* Gold separator */}
          <div className="mt-6 h-px w-16" style={{ backgroundColor: "#F29E18" }} />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="p-5 rounded-md"
                style={{ backgroundColor: "#18181B", border: "1px solid #27272A" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] tracking-wider" style={{ color: s.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      backgroundColor: s.color + "15",
                      border: `1px solid ${s.color}30`,
                    }}
                  >
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                  <h2 className="font-mono text-sm" style={{ color: "#FAFAFA" }}>
                    {s.title}
                  </h2>
                </div>

                <div className="pl-[2.75rem] space-y-3">
                  {s.body.map((p, j) => (
                    <p key={j} className="font-mono text-xs leading-relaxed" style={{ color: "#A1A1AA" }}>
                      {p}
                    </p>
                  ))}
                  {s.list && (
                    <ul className="space-y-1.5">
                      {s.list.map((li) => (
                        <li
                          key={li}
                          className="font-mono text-xs leading-relaxed flex gap-2"
                          style={{ color: "#A1A1AA" }}
                        >
                          <span style={{ color: s.color }}>-</span>
                          {li}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact block */}
        <div
          className="mt-12 p-6 rounded-md"
          style={{ backgroundColor: "#18181B", border: "1px solid #27272A" }}
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
              <span style={{ color: "#FAFAFA" }}>mail</span>{" "}
              <span style={{ color: "#3B82F6" }}>{SITE_CONFIG.email}</span>
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
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
              style={{
                color: "#A1A1AA",
                border: "1px solid #27272A",
              }}
            >
              {t("ctaFaq")}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
