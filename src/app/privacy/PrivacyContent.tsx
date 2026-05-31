"use client";

import Link from "next/link";
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

// ─── Privacy content ──────────────────────────────────────────────────────────

const LAST_UPDATED = "31 mei 2026";

const SECTIONS: Section[] = [
  {
    id: "wie",
    title: "Wie zijn wij",
    icon: ShieldCheck,
    color: "#F29E18",
    body: [
      "Studievereniging Innovatie en Technologie (SIT) is de studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. Wij verwerken jouw persoonsgegevens als je lid wordt of onze site gebruikt.",
      "Verantwoordelijke: het bestuur van SIT. Bereikbaar via bestuur@svsit.nl, Wibauthuis, Wibautstraat 3b, 1091 GH Amsterdam.",
    ],
  },
  {
    id: "gegevens",
    title: "Welke gegevens we verwerken",
    icon: Database,
    color: "#3B82F6",
    body: ["Bij aanmelding en gebruik van je account verwerken we:"],
    list: [
      "Naam en e-mailadres",
      "Studentnummer (alleen als je student bent, optioneel)",
      "Wachtwoord (versleuteld opgeslagen, nooit leesbaar)",
      "Je commissievoorkeur en lidmaatschapsstatus",
      "Deelname aan events en behaalde XP/badges",
    ],
  },
  {
    id: "doel",
    title: "Waarvoor we ze gebruiken",
    icon: UserCheck,
    color: "#22C55E",
    body: [
      "We gebruiken je gegevens alleen om je lidmaatschap te beheren, je toegang te geven tot events en het ledenportaal, en om met je te communiceren over SIT. We verkopen je gegevens nooit aan derden.",
    ],
  },
  {
    id: "betaling",
    title: "Betalingen",
    icon: CreditCard,
    color: "#22C55E",
    body: [
      "Betalingen voor je lidmaatschap en tickets lopen via Stripe. Wij ontvangen geen volledige kaartgegevens; die worden veilig door Stripe verwerkt. We bewaren wel een betaalreferentie zodat we je lidmaatschap kunnen activeren.",
    ],
  },
  {
    id: "verwerkers",
    title: "Met wie we ze delen",
    icon: Server,
    color: "#A78BFA",
    body: ["We werken met een paar verwerkers die ons platform draaien:"],
    list: [
      "Supabase - database en accountopslag",
      "Stripe - betalingsverwerking",
      "Resend - versturen van e-mails (zoals tickets)",
      "Vercel - hosting van de website en cookieloze statistieken",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: Cookie,
    color: "#F29E18",
    body: [
      "We gebruiken alleen strikt noodzakelijke, functionele cookies. Een sessiecookie houdt je ingelogd nadat je inlogt. Die is nodig om de site te laten werken en valt onder de uitzondering van de cookiewet, dus daar vragen we geen toestemming voor.",
      "Onze statistieken (Vercel Analytics en Speed Insights) werken zonder cookies en zonder dat we je kunnen identificeren. We gebruiken geen tracking- of advertentiecookies.",
    ],
  },
  {
    id: "bewaartermijn",
    title: "Hoe lang we bewaren",
    icon: Clock,
    color: "#3B82F6",
    body: [
      "We bewaren je gegevens zolang je lid bent. Wil je dat we je account en gegevens verwijderen? Stuur een mail naar bestuur@svsit.nl en we regelen het.",
    ],
  },
  {
    id: "rechten",
    title: "Jouw rechten",
    icon: UserCheck,
    color: "#22C55E",
    body: [
      "Onder de AVG heb je recht op inzage, correctie en verwijdering van je gegevens, en kun je bezwaar maken tegen verwerking. Mail bestuur@svsit.nl en we reageren zo snel mogelijk. Niet tevreden? Je kunt een klacht indienen bij de Autoriteit Persoonsgegevens.",
    ],
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

export default function PrivacyContent() {
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
              privacy.md
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-3">
            Privacy
            <br />
            <span style={{ color: "#F29E18" }}>Verklaring</span>
          </h1>

          <p className="font-mono text-sm" style={{ color: "#71717A" }}>
            // hoe we met jouw gegevens omgaan
          </p>

          <p className="font-mono text-xs mt-2" style={{ color: "#52525B" }}>
            laatst bijgewerkt: {LAST_UPDATED}
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
              vraag_over_privacy.sh
            </span>
          </div>

          <div className="font-mono text-xs leading-relaxed" style={{ color: "#A1A1AA" }}>
            <div>
              <span style={{ color: "#22C55E" }}>$</span>{" "}
              <span style={{ color: "#FAFAFA" }}>mail</span>{" "}
              <span style={{ color: "#3B82F6" }}>bestuur@svsit.nl</span>
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
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs tracking-wider transition-all hover:scale-[1.02]"
              style={{
                color: "#A1A1AA",
                border: "1px solid #27272A",
              }}
            >
              FAQ
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
