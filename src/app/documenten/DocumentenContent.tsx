"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";
import {
  FileText,
  Download,
  ScrollText,
  BookOpen,
  Receipt,
  Mail,
  ArrowRight,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Document {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
  href?: string;
  meta?: string;
  status: "beschikbaar" | "binnenkort";
}

// ─── Document presentation metadata (id, icon, color, href, status) ───────────

const DOCUMENT_META: {
  id: "statuten" | "hhr" | "jaarverslag";
  icon: typeof FileText;
  color: string;
  href?: string;
  metaStatic?: string;
  status: "beschikbaar" | "binnenkort";
}[] = [
  {
    id: "statuten",
    icon: ScrollText,
    color: "#F29E18",
    href: "/documenten/statuten-sit-2015.pdf",
    metaStatic: "PDF \u00b7 2015",
    status: "beschikbaar",
  },
  {
    id: "hhr",
    icon: BookOpen,
    color: "#3B82F6",
    status: "binnenkort",
  },
  {
    id: "jaarverslag",
    icon: Receipt,
    color: "#22C55E",
    status: "binnenkort",
  },
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

export default function DocumentenContent() {
  const t = useTranslations("documentenContent");

  const DOCUMENTS: Document[] = DOCUMENT_META.map((meta) => ({
    id: meta.id,
    title: t("documents." + meta.id + ".title"),
    description: t("documents." + meta.id + ".description"),
    icon: meta.icon,
    color: meta.color,
    href: meta.href,
    meta: meta.metaStatic ?? t("documents." + meta.id + ".meta"),
    status: meta.status,
  }));

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

        {/* Documents */}
        <div className="space-y-4">
          {DOCUMENTS.map((doc, i) => {
            const Icon = doc.icon;
            const available = doc.status === "beschikbaar";
            return (
              <div
                key={doc.id}
                className="p-5 rounded-md"
                style={{ backgroundColor: "#18181B", border: "1px solid #27272A" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-mono text-[10px] tracking-wider mt-1" style={{ color: doc.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: doc.color + "15",
                      border: `1px solid ${doc.color}30`,
                    }}
                  >
                    <Icon size={14} style={{ color: doc.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-mono text-sm" style={{ color: "#FAFAFA" }}>
                        {doc.title}
                      </h2>
                      {doc.meta && (
                        <span className="font-mono text-[10px] tracking-wider" style={{ color: "#52525B" }}>
                          {doc.meta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pl-[2.75rem]">
                  <p className="font-mono text-xs leading-relaxed mb-4" style={{ color: "#A1A1AA" }}>
                    {doc.description}
                  </p>

                  {available && doc.href ? (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
                      style={{
                        color: doc.color,
                        border: `1px solid ${doc.color}4D`,
                        backgroundColor: `${doc.color}10`,
                      }}
                    >
                      <Download size={12} />
                      {t("downloadPdf")}
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider"
                      style={{ color: "#52525B", border: "1px solid #27272A" }}
                    >
                      <Clock size={12} />
                      {t("soon")}
                    </span>
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

          <p className="font-mono text-xs leading-relaxed mb-4" style={{ color: "#A1A1AA" }}>
            {t("ctaText")}
          </p>

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
              href="/privacy"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
              style={{
                color: "#A1A1AA",
                border: "1px solid #27272A",
              }}
            >
              {t("ctaPrivacy")}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
