// ---------------------------------------------------------------------------
// Partners - single source of truth
// Used by the homepage teaser (SponsorShowcase) and the /partners network page.
// Add a new partner here and both surfaces update.
// ---------------------------------------------------------------------------

export type PartnerTier = "strategisch" | "hoofdsponsor" | "sponsor" | "partner";

export interface Partner {
  name: string;
  tier: PartnerTier;
  /** One-line description shown on the node card */
  tagline: string;
  /** External site. Omit for partners without a public link. */
  url?: string;
  /** Short slug shown as node://<id> */
  slug: string;
  /**
   * Optional brand wordmark. When set, the node renders this logo (white,
   * for the dark substrate) instead of the scrambled name text. Width/height
   * are the intrinsic ratio; actual size is capped in CSS (.brand-logo).
   */
  logo?: { src: string; width: number; height: number };
}

export const TIER_META: Record<PartnerTier, { label: string; color: string }> = {
  strategisch: { label: "STRATEGISCH", color: "#F29E18" },
  hoofdsponsor: { label: "HOOFDSPONSOR", color: "#F29E18" },
  sponsor: { label: "SPONSOR", color: "#3B82F6" },
  partner: { label: "PARTNER", color: "#22C55E" },
};

export const TIER_ORDER: PartnerTier[] = [
  "strategisch",
  "hoofdsponsor",
  "sponsor",
  "partner",
];

export const PARTNERS: Partner[] = [
  {
    name: "HBO-ICT",
    tier: "strategisch",
    tagline: "De opleiding HBO-ICT aan de HvA. Waar {SIT} thuishoort.",
    url: "https://www.hva.nl/opleidingen/hbo-ict",
    slug: "hbo-ict",
  },
  {
    name: "CERN",
    tier: "strategisch",
    tagline: "Europees lab voor deeltjesfysica - waar ICT op wereldschaal draait.",
    url: "https://home.cern",
    slug: "cern",
  },
  {
    name: "ChipSoft",
    tier: "sponsor",
    tagline: "Marktleider in zorg-IT. Bouwt het EPD dat heel zorgend Nederland draait.",
    url: "https://www.chipsoft.nl",
    slug: "chipsoft",
    logo: { src: "/chipsoft-logo.svg", width: 2649, height: 1183 },
  },
  {
    name: "JetBrains",
    tier: "sponsor",
    tagline: "Developer tools - de IDE's die je elke dag draait.",
    url: "https://www.jetbrains.com",
    slug: "jetbrains",
  },
  {
    name: "Sogeti",
    tier: "partner",
    tagline: "Technology & engineering. Consultancy waar studenten écht meebouwen.",
    url: "https://www.sogeti.nl",
    slug: "sogeti",
  },
  {
    name: "Center of Expertise Applied AI",
    tier: "partner",
    tagline: "HvA-kenniscentrum voor toegepaste AI.",
    url: "https://impact-ai.nl",
    slug: "coe-aai",
  },
  {
    name: "AI4HVA",
    tier: "partner",
    tagline: "De AI-community van de HvA.",
    url: "https://www.instagram.com/ai4hva",
    slug: "ai4hva",
  },
  {
    name: "FemIT",
    tier: "partner",
    tagline: "Het vrouwennetwerk van HBO-ICT. Samen sterker in tech.",
    url: "https://nl.linkedin.com/company/femithva",
    slug: "femit",
  },
  {
    name: "Rank my AI",
    tier: "partner",
    tagline: "Partner uit het AI-netwerk.",
    url: "https://www.rankmyai.com",
    slug: "rank-my-ai",
  },
];
