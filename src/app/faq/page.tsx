import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqContent from "./FaqContent";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ - {SIT}",
  description:
    "Veelgestelde vragen over SIT, de studievereniging voor HBO-ICT aan de HvA. Wat kost het, wat krijg je, en hoe word je lid.",
  openGraph: {
    title: "FAQ - {SIT}",
    description: "Alles wat je wilt weten over lid worden van SIT.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/faq",
  },
};

const FAQ_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat is SIT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `SIT is de studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. We organiseren events, workshops, hackathons, game avonden en meer. Met ${SITE_CONFIG.stats.members} leden en ${SITE_CONFIG.stats.commissies} commissies is er altijd iets te doen.`,
      },
    },
    {
      "@type": "Question",
      name: "Wat kost het lidmaatschap?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Het lidmaatschap kost eenmalig ${SITE_CONFIG.membership.priceLabel} per jaar. Geen verborgen kosten, geen maandelijkse abonnementen. Je kunt betalen via iDEAL of creditcard.`,
      },
    },
    {
      "@type": "Question",
      name: "Wat krijg ik als lid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Toegang tot alle SIT events (de meeste gratis), gratis dev tools via het GitHub Student Pack, een persoonlijke ledenpas, commissie deelname, project mogelijkheden, en een community van mede-ICT studenten.",
      },
    },
    {
      "@type": "Question",
      name: "Moet ik student zijn om lid te worden?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee. SIT staat open voor iedereen: studenten, docenten, alumni en externen.",
      },
    },
    {
      "@type": "Question",
      name: "Zijn events gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De meeste events zijn gratis voor leden. Sommige events (zoals feesten of externe locaties) hebben een kleine bijdrage. De prijs staat altijd bij het event vermeld.",
      },
    },
    {
      "@type": "Question",
      name: "Wat zijn commissies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Commissies zijn teams van leden die specifieke taken op zich nemen: events organiseren, socials beheren, educatie content maken, games organiseren, en meer.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe werkt het XP / leaderboard systeem?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Door events te bezoeken, badges te verdienen en actief te zijn verdien je XP. Hiermee stijg je in level en kun je op het leaderboard komen. Het is volledig optioneel.",
      },
    },
    {
      "@type": "Question",
      name: "Kan ik later betalen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja. Bij registratie kun je kiezen voor 'Eerst rondkijken'. Je account wordt dan aangemaakt zonder betaling.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe bereik ik het bestuur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Stuur een mail naar ${SITE_CONFIG.email}, DM ons op Instagram (${SITE_CONFIG.socials.instagram.handle}) of TikTok (${SITE_CONFIG.socials.tiktok.handle}), of join onze WhatsApp groep of Discord server.`,
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <div className="page-public">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_STRUCTURED_DATA) }}
      />
      <Navbar />
      <main id="main-content" style={{ paddingTop: "5rem" }}>
        <FaqContent />
      </main>
      <Footer />
    </div>
  );
}
