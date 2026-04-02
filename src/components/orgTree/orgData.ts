// ═══════════════════════════════════════════════════════════
//  SIT Organisation Data — Bestuur XI
//  Update this file when members/commissies change.
// ═══════════════════════════════════════════════════════════

export interface Person {
  id: string;
  name: string;
  role?: string;
  accentColor: string;
  commissies: string[];
  voorzitterVan?: string[];
  contactVoor?: string[];
  type: "bestuur" | "lid";
}

export interface Commissie {
  id: string;
  name: string;
  color: string;
  voorzitters: string[];
  leden: string[];
  status?: string;
}

// ── Bestuur ──

export const bestuur: Person[] = [
  {
    id: "matin",
    name: "Matin",
    role: "Voorzitter",
    accentColor: "#F59E0B",
    commissies: ["ai4hva", "sponsoring", "educatie"],
    voorzitterVan: ["ai4hva", "sponsoring"],
    contactVoor: ["Externe partijen", "Sponsoring", "Opleiding"],
    type: "bestuur",
  },
  {
    id: "riley",
    name: "Riley",
    role: "Penningmeester",
    accentColor: "#3B82F6",
    commissies: ["gameit", "sponsoring"],
    voorzitterVan: ["gameit"],
    contactVoor: ["Financien", "Facturen", "Budget"],
    type: "bestuur",
  },
  {
    id: "idil",
    name: "Idil Yilmaz",
    role: "Secretaris",
    accentColor: "#EF4444",
    commissies: ["pr-socials", "fun-events", "ai4hva"],
    voorzitterVan: ["pr-socials", "fun-events"],
    contactVoor: ["Promotie", "Events", "Administratie"],
    type: "bestuur",
  },
  {
    id: "hugo",
    name: "Hugo",
    role: "Algemeen Bestuurslid",
    accentColor: "#22C55E",
    commissies: ["educatie", "ai4hva", "sponsoring", "pr-socials"],
    voorzitterVan: ["educatie", "ai4hva"],
    contactVoor: ["Educatie", "Workshops", "Sprekers"],
    type: "bestuur",
  },
];

// ── Commissieleden (niet-bestuur) ──

export const leden: Person[] = [
  { id: "shreyah", name: "Shreyah Ramtahal", accentColor: "#F59E0B", commissies: ["pr-socials", "ai4hva"], type: "lid" },
  { id: "shakira", name: "Shakira", accentColor: "#3B82F6", commissies: ["pr-socials"], type: "lid" },
  { id: "thijmen", name: "Thijmen", accentColor: "#22C55E", commissies: ["fun-events"], type: "lid" },
  { id: "wesley", name: "Wesley", accentColor: "#EF4444", commissies: ["fun-events", "ai4hva", "gameit"], type: "lid" },
  { id: "mats", name: "Mats", accentColor: "#F59E0B", commissies: ["fun-events", "ai4hva", "educatie", "peiling"], voorzitterVan: ["peiling"], type: "lid" },
  { id: "kaylin", name: "Kaylin", accentColor: "#3B82F6", commissies: ["fun-events"], type: "lid" },
  { id: "nick", name: "Nick Hoebe", accentColor: "#22C55E", commissies: ["educatie"], type: "lid" },
  { id: "luuk", name: "Luuk", accentColor: "#F59E0B", commissies: ["gameit"], type: "lid" },
  { id: "rosa", name: "Rosa Safai", accentColor: "#EF4444", commissies: ["gameit"], type: "lid" },
];

// ── Commissies ──

export const commissies: Commissie[] = [
  {
    id: "pr-socials",
    name: "PR & Socials",
    color: "#EF4444",
    voorzitters: ["idil", "hugo"],
    leden: ["shreyah", "shakira"],
    status: "Zoekt leden",
  },
  {
    id: "fun-events",
    name: "Fun & Extern Events",
    color: "#F59E0B",
    voorzitters: ["idil"],
    leden: ["thijmen", "wesley", "mats", "kaylin"],
    status: "Zoekt leden",
  },
  {
    id: "ai4hva",
    name: "AI4HvA",
    color: "#3B82F6",
    voorzitters: ["hugo", "matin"],
    leden: ["idil", "mats", "wesley", "shreyah"],
    status: "Zoekt leden",
  },
  {
    id: "educatie",
    name: "Educatie",
    color: "#22C55E",
    voorzitters: ["hugo", "matin"],
    leden: ["nick", "mats"],
    status: "Zoekt leden",
  },
  {
    id: "gameit",
    name: "GameIT",
    color: "#8B5CF6",
    voorzitters: ["riley"],
    leden: ["luuk", "wesley", "rosa"],
    status: "Zoekt leden",
  },
  {
    id: "sponsoring",
    name: "Sponsoring",
    color: "#F59E0B",
    voorzitters: ["matin"],
    leden: ["hugo", "riley"],
    status: "Zoekt leden",
  },
  {
    id: "peiling",
    name: "Peiling & Community",
    color: "#06B6D4",
    voorzitters: ["mats", "matin", "hugo"],
    leden: [],
    status: "Zoekt leden",
  },
];

// ── Helpers ──

const allPersons = [...bestuur, ...leden];

export function getPersonById(id: string): Person | undefined {
  return allPersons.find((p) => p.id === id);
}

export function getCommissieById(id: string): Commissie | undefined {
  return commissies.find((c) => c.id === id);
}

export function getPersonCommissies(personId: string): Commissie[] {
  return commissies.filter(
    (c) => c.voorzitters.includes(personId) || c.leden.includes(personId)
  );
}

export function getCommissieMembers(commissieId: string): Person[] {
  const c = getCommissieById(commissieId);
  if (!c) return [];
  const memberIds = [...c.voorzitters, ...c.leden];
  return memberIds.map((id) => getPersonById(id)).filter(Boolean) as Person[];
}
