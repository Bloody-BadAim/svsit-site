// ═══════════════════════════════════════════════════════════
//  SIT // HET MOEDERBORD - single source of truth
//  Bestuur (CPU) + commissies (modules). Pas teksten hier aan.
// ═══════════════════════════════════════════════════════════

export interface Person {
  name: string;
  initials: string;
  /** Pad in /public, of null → dan worden initialen getoond. */
  photo: string | null;
}

// Foto's van Liam, Thijmen, Jamiro en Yusuf komen later, tot dan tonen we initialen.
export const PEOPLE: Record<string, Person> = {
  matin: { name: "Matin", initials: "MA", photo: "/bestuur/matin.jpeg" },
  idil: { name: "Idil", initials: "ID", photo: "/bestuur/idil.jpeg" },
  wesley: { name: "Wesley", initials: "WE", photo: "/bestuur/wesley.jpeg" },
  mats: { name: "Mats", initials: "MS", photo: "/bestuur/mats.jpeg" },
  thijmen: { name: "Thijmen", initials: "TH", photo: null },
  yusuf: { name: "Yusuf", initials: "YU", photo: null },
  jamiro: { name: "Jamiro", initials: "JA", photo: "/bestuur/jamiro.jpeg" },
  nick: { name: "Nick", initials: "NI", photo: "/bestuur/nick.jpeg" },
  riley: { name: "Riley", initials: "RI", photo: "/bestuur/riley.jpg" },
  liam: { name: "Liam", initials: "LI", photo: null },
};

export interface BoardMember {
  id: string;
  person: string;
  role: string;
  code: string;
  color: string;
  /** Korte intro in eerste persoon - bestuur vertelt kort over zichzelf. */
  over: string;
}

// Bestuur XII - de centrale CPU.
export const BESTUUR: BoardMember[] = [
  {
    id: "matin",
    person: "matin",
    role: "Voorzitter",
    code: "VZ",
    color: "#F29E18",
    over:
      "Als voorzitter bewaak ik de grote lijn van SIT en zorg ik dat alle commissies dezelfde kant op draaien. Mijn focus dit jaar: AI4HvA groot maken en SIT stevig op de kaart zetten binnen de HvA.",
  },
  {
    id: "idil",
    person: "idil",
    role: "Secretaris",
    code: "SEC",
    color: "#EF4444",
    over:
      "Als secretaris hou ik de boel georganiseerd: notulen, planning en communicatie. Ik zorg dat afspraken niet verdwijnen en dat iedereen weet wat er speelt.",
  },
  {
    id: "wesley",
    person: "wesley",
    role: "Penningmeester",
    code: "FIN",
    color: "#3B82F6",
    over:
      "Als penningmeester bewaak ik de centen, regel ik de contributie en zorg ik dat events financieel kloppen. Geen verrassingen op de rekening.",
  },
  {
    id: "mats",
    person: "mats",
    role: "Vice Voorzitter",
    code: "VVZ",
    color: "#22C55E",
    over:
      "Als vice-voorzitter spring ik bij waar nodig en denk ik mee over de koers. Daarnaast ben ik betrokken bij EduCo en Community.",
  },
];

export type CommissieStatus = "actief" | "nieuw" | "zoekt-leden";

export const STATUS_LABELS: Record<CommissieStatus, string> = {
  actief: "ACTIEF",
  nieuw: "NIEUW",
  "zoekt-leden": "ZOEKT LEDEN",
};

export interface Commissie {
  id: string;
  name: string;
  sub?: string;
  code: string;
  color: string;
  voorzitter: string | null;
  status: CommissieStatus;
  /** Korte pakzin (module-overzicht). */
  tagline: string;
  /** 1-2 zinnen (detailpaneel). */
  beschrijving: string;
  missie: string;
  activiteiten: string[];
  leden: string[];
}

// Commissies - de modules. Teksten afgestemd op de wiki/Notion.
export const COMMISSIES: Commissie[] = [
  {
    id: "servco",
    name: "ServCo",
    sub: "Fullstack",
    code: "SRV",
    color: "#3B82F6",
    voorzitter: "jamiro",
    status: "nieuw",
    tagline: "De tech-backbone van SIT - server, site en studentprojecten.",
    beschrijving:
      "De technische backbone van SIT. ServCo beheert de eigen SIT-server, vernieuwt svsit.nl met studentprojecten, en onderzoekt mogelijkheden zoals game servers en hosting.",
    missie:
      "SIT een eigen digitale infrastructuur geven die door studenten wordt gebouwd en onderhouden.",
    activiteiten: [
      "Eigen SIT-server beheren",
      "svsit.nl vernieuwen met studentprojecten",
      "Game server hosting",
      "Technische projecten voor leden",
    ],
    leden: ["jamiro"],
  },
  {
    id: "community",
    name: "SIT Community",
    code: "CMM",
    color: "#06B6D4",
    voorzitter: null,
    status: "zoekt-leden",
    tagline: "De stem van de leden - online en offline.",
    beschrijving:
      "Ontstaan uit de samenvoeging van PR & Socials en Peiling. Community zorgt voor de online aanwezigheid van SIT, haalt op wat studenten willen, en activeert leden.",
    missie:
      "SIT is er voor de studenten, niet andersom. Als we niet weten wat ze willen, kunnen we ze niet geven wat ze nodig hebben.",
    activiteiten: [
      "Instagram en LinkedIn content",
      "Maandelijkse mini-peilingen",
      "Onboarding nieuwe studenten",
      "Leden activeren en feedback ophalen",
      "Semester-enquetes",
    ],
    leden: ["Shreyah", "Shakira", "mats"],
  },
  {
    id: "educo",
    name: "EduCo",
    code: "EDU",
    color: "#22C55E",
    voorzitter: "nick",
    status: "actief",
    tagline: "Workshops, tech talks en skill-ups.",
    beschrijving:
      "Verantwoordelijk voor educatieve content: workshops, tech talks, en kennissessies. Werkt samen met de opleiding voor Fusion klassen en evenementen.",
    missie:
      "Studenten helpen groeien door workshops, lezingen en hands-on leermomenten te organiseren.",
    activiteiten: [
      "Workshops organiseren",
      "Tech talks en coding sessions",
      "Samenwerking met opleiding (Fusion klassen)",
      "Skill development events",
    ],
    leden: ["nick", "mats"],
  },
  {
    id: "events",
    name: "Evenementen",
    code: "EVT",
    color: "#F29E18",
    voorzitter: "thijmen",
    status: "actief",
    tagline: "Borrels, uitjes en alles wat SIT samenbrengt.",
    beschrijving:
      "Gefocust op leuke activiteiten: feestjes, uitjes, sport, en gaming events. Van kroegentochten tot Thuishaven - alles wat SIT sociaal maakt.",
    missie:
      "Zorgen dat SIT-leden elkaar ontmoeten buiten de collegebanken, met events die passen bij wat studenten willen.",
    activiteiten: [
      "Borrels en kroegentochten",
      "Feesten en borrels",
      "Sportactiviteiten (voetbal, padel)",
      "Bedrijfsbezoeken en netwerkborrels",
      "Game-avonden en uitjes",
    ],
    leden: ["thijmen", "wesley", "mats", "Kaylin"],
  },
  {
    id: "ai4hva",
    name: "AI4HvA",
    code: "AI",
    color: "#8B5CF6",
    voorzitter: "matin",
    status: "actief",
    tagline: "De AI-community van de HvA.",
    beschrijving:
      "De AI-community van de HvA, officieel georganiseerd onder SIT. AI4HvA is het unieke speerpunt van SIT - het positioneert de vereniging als meer dan alleen een sociale club.",
    missie:
      "De go-to plek worden voor AI-interesse op de HvA, met workshops, hackathons en connecties naar de 5 HvA AI Labs.",
    activiteiten: [
      "AI workshops en hackathons",
      "AI Marathon organiseren",
      "Lab Ambassadeurs bij 5 HvA AI Labs",
      "AI020 events bezoeken",
      "Kennisdeling over AI tools",
    ],
    leden: ["matin", "mats", "wesley", "Shreyah", "idil"],
  },
  {
    id: "gameit",
    name: "Game IT",
    code: "GME",
    color: "#EF4444",
    voorzitter: "riley",
    status: "actief",
    tagline: "Game nights, toernooien en D&D.",
    beschrijving:
      "Gaming-gerelateerde activiteiten en events voor SIT leden. Van casual game nights tot D&D campagnes en gaming tournaments.",
    missie:
      "Gamers binnen HBO-ICT samenbrengen met regelmatige game nights, toernooien en community events.",
    activiteiten: [
      "Game nights",
      "D&D sessies en campagnes",
      "Gaming tournaments",
      "LAN parties",
    ],
    leden: ["riley", "wesley", "Rosa", "Luuk"],
  },
  {
    id: "sponsoring",
    name: "SIT Sponsoring",
    code: "SPO",
    color: "#EC4899",
    voorzitter: "liam",
    status: "actief",
    tagline: "Verbindt leden met de IT-arbeidsmarkt.",
    beschrijving:
      "Werft en onderhoudt sponsorrelaties met bedrijven. Van tech talks tot stages - sponsoring zorgt dat SIT-leden in contact komen met de IT-arbeidsmarkt.",
    missie:
      "Waardevolle partnerships opbouwen die concreet iets opleveren voor leden: stagekansen, workshops, tooling en netwerkmomenten.",
    activiteiten: [
      "Bedrijven benaderen en partnerships opzetten",
      "Sponsorpakketten beheren",
      "Tech talks en bedrijfsbezoeken organiseren",
      "Stagemarkt coordineren",
      "Pipeline van 46+ bedrijven onderhouden",
    ],
    leden: ["liam", "matin", "riley"],
  },
];

export const JOIN_URL =
  "https://forms.office.com/Pages/ResponsePage.aspx?id=HrsHCfwhb0eIQwLQnOtZp5Gb5Qz7gPZNhhsylBIlKC9UN01YN1EzTEFBMVFaRkhNSVdOU1pDRVpRNC4u";

/** Naam van een lid: lookup in PEOPLE, anders de string zelf (los lid zonder profiel). */
export function memberName(key: string): string {
  return PEOPLE[key]?.name ?? key;
}
