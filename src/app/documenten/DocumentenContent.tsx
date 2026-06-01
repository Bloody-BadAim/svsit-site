"use client";

import Link from "next/link";
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

// ─── Documenten ───────────────────────────────────────────────────────────────

const DOCUMENTS: Document[] = [
  {
    id: "statuten",
    title: "Statuten",
    description:
      "De notariele oprichtingsakte van de vereniging. Vastgelegd op 26 november 2015 bij notaris mr. Paul Robert Schut te Amsterdam. Bevat naam, doel, regels rond leden, bestuur, Raad van Advies en de ALV.",
    icon: ScrollText,
    color: "#F29E18",
    href: "/documenten/statuten-sit-2015.pdf",
    meta: "PDF \u00b7 2015",
    status: "beschikbaar",
  },
  {
    id: "hhr",
    title: "Huishoudelijk Reglement",
    description:
      "De praktische uitwerking van de statuten: regels rond commissies, lidmaatschap en de dagelijkse gang van zaken. Wordt door de Algemene Ledenvergadering bekrachtigd en gepubliceerd zodra definitief.",
    icon: BookOpen,
    color: "#3B82F6",
    meta: "via ALV",
    status: "binnenkort",
  },
  {
    id: "jaarverslag",
    title: "Jaarverslag",
    description:
      "Het bestuursverslag en de financiele verantwoording over het afgelopen verenigingsjaar (1 september tot en met 31 augustus). Wordt na goedkeuring door de ALV hier gedeeld.",
    icon: Receipt,
    color: "#22C55E",
    meta: "per boekjaar",
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
              ~/documenten
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-3">
            Officiele
            <br />
            <span style={{ color: "#F29E18" }}>Documenten</span>
          </h1>

          <p className="font-mono text-sm" style={{ color: "#71717A" }}>
            // statuten, reglementen en verantwoording
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
                      DOWNLOAD PDF
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider"
                      style={{ color: "#52525B", border: "1px solid #27272A" }}
                    >
                      <Clock size={12} />
                      BINNENKORT
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
              vraag_een_document_op.sh
            </span>
          </div>

          <p className="font-mono text-xs leading-relaxed mb-4" style={{ color: "#A1A1AA" }}>
            Een ander document nodig of een vraag over onze statuten? Stuur ons een mail, we
            helpen je graag verder.
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
              MAIL ONS
            </a>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
              style={{
                color: "#A1A1AA",
                border: "1px solid #27272A",
              }}
            >
              PRIVACY
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
