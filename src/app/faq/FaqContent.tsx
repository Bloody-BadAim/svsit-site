"use client";

import { useState } from "react";
import Link from "next/link";
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

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Wat is SIT?",
    answer:
      "SIT is de studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. We organiseren events, workshops, hackathons, game avonden en meer. Met 100+ leden en 8 commissies is er altijd iets te doen.",
    icon: Users,
    color: "#F29E18",
    link: { href: "/over-ons", label: "Over ons" },
  },
  {
    question: "Wat kost het lidmaatschap?",
    answer:
      "Het lidmaatschap kost eenmalig €9,99 per jaar. Geen verborgen kosten, geen maandelijkse abonnementen. Je kunt betalen via iDEAL of creditcard. Je kunt ook eerst rondkijken en later betalen.",
    icon: CreditCard,
    color: "#22C55E",
    link: { href: "/lid-worden", label: "Word lid" },
  },
  {
    question: "Wat krijg ik als lid?",
    answer:
      "Toegang tot alle SIT events (de meeste gratis), gratis dev tools via het GitHub Student Pack, een persoonlijke ledenpas, commissie deelname, project mogelijkheden, en een community van mede-ICT studenten. Plus XP, badges en een plek op het leaderboard.",
    icon: Ticket,
    color: "#F29E18",
  },
  {
    question: "Moet ik student zijn om lid te worden?",
    answer:
      "Nee. SIT staat open voor iedereen: studenten, docenten, alumni en externen. Bij aanmelding geef je aan of je student bent. Studenten vullen hun studentnummer in, voor de rest is dat niet nodig.",
    icon: GraduationCap,
    color: "#3B82F6",
    link: { href: "/lid-worden", label: "Aanmelden" },
  },
  {
    question: "Zijn events gratis?",
    answer:
      "De meeste events zijn gratis voor leden. Sommige events (zoals feesten of externe locaties) hebben een kleine bijdrage. De prijs staat altijd bij het event vermeld. Niet-leden betalen soms een toeslag.",
    icon: Calendar,
    color: "#EF4444",
    link: { href: "/events", label: "Bekijk events" },
  },
  {
    question: "Wat zijn commissies?",
    answer:
      "Commissies zijn teams van leden die specifieke taken op zich nemen: events organiseren, socials beheren, educatie content maken, games organiseren, en meer. Je kunt je bij aanmelding al voor een commissie opgeven, of later instappen.",
    icon: Users,
    color: "#3B82F6",
    link: { href: "/commissies", label: "Bekijk commissies" },
  },
  {
    question: "Hoe werkt het XP / leaderboard systeem?",
    answer:
      "Door events te bezoeken, badges te verdienen en actief te zijn verdien je XP. Hiermee stijg je in level en kun je op het leaderboard komen. Het is een leuke manier om je betrokkenheid te zien, maar volledig optioneel — je hoeft er niks mee te doen.",
    icon: Trophy,
    color: "#F29E18",
    link: { href: "/leaderboard", label: "Leaderboard" },
  },
  {
    question: "Kan ik later betalen?",
    answer:
      "Ja. Bij registratie kun je kiezen voor \"Eerst rondkijken\". Je account wordt dan aangemaakt zonder betaling. Je kunt het dashboard bekijken, maar voor sommige functies (events, shop) moet je je lidmaatschap activeren.",
    icon: Zap,
    color: "#22C55E",
  },
  {
    question: "Hoe bereik ik het bestuur?",
    answer:
      "Stuur een mail naar bestuur@svsit.nl, DM ons op Instagram (@sv.sit) of TikTok (@sit_hva), of join onze WhatsApp groep of Discord server. Je kunt ook langskomen op de Wibauthuis (5e verdieping) tijdens een van onze events of de SIT Hub.",
    icon: Mail,
    color: "#3B82F6",
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

export default function FaqContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              faq.md
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-3">
            Veelgestelde
            <br />
            <span style={{ color: "#F29E18" }}>Vragen</span>
          </h1>

          <p className="font-mono text-sm" style={{ color: "#71717A" }}>
            // alles wat je wilt weten over SIT
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
              nog_vragen.sh
            </span>
          </div>

          <div className="font-mono text-xs leading-relaxed" style={{ color: "#A1A1AA" }}>
            <div>
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>echo</span>{" "}
              <span style={{ color: "#F29E18" }}>&quot;Vraag niet beantwoord?&quot;</span>
            </div>
            <div className="mt-1">
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>mail</span>{" "}
              <span style={{ color: "#3B82F6" }}>bestuur@svsit.nl</span>
            </div>
            <div className="mt-1">
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>open</span>{" "}
              <span style={{ color: "#3B82F6" }}>instagram.com/sv.sit</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href="mailto:bestuur@svsit.nl"
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
              href="/lid-worden"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider font-semibold transition-all hover:scale-[1.02]"
              style={{
                color: "#09090B",
                backgroundColor: "#F29E18",
              }}
            >
              WORD LID
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
