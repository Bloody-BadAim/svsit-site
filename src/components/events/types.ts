import { Zap, Users, Code, Gamepad2, Briefcase } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventStatus = "DONE" | "NEXT" | "TBA";

export type EventCategory = "Social" | "Code" | "Game" | "Career";

export interface SitEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  location: string;
  time?: string;
  description?: string;
  link?: string;
  status: EventStatus;
  type: string;
  category: EventCategory;
  color: string;
}

export interface NotionEventResponse {
  id: string;
  name: string;
  date: string;
  dateEnd?: string;
  time?: string;
  location?: string;
  description?: string;
  link?: string;
  status: "done" | "next" | "tba";
  type: string;
  category: EventCategory;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const BRAND = {
  gold: "#F29E18",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#22C55E",
} as const;

export const MONTHS = [
  "JAN","FEB","MRT","APR","MEI","JUN",
  "JUL","AUG","SEP","OKT","NOV","DEC",
];

export const isValidDate = (d: Date) => !isNaN(d.getTime());
export const fDay = (d: Date) => isValidDate(d) ? d.getDate() : "?";
export const fMonth = (d: Date) => isValidDate(d) ? MONTHS[d.getMonth()] : "TBA";

export const CATEGORY_FILTERS: { key: string; label: string; icon: typeof Zap }[] = [
  { key: "all", label: "ALLES", icon: Zap },
  { key: "Social", label: "SOCIAL", icon: Users },
  { key: "Code", label: "CODE", icon: Code },
  { key: "Game", label: "GAME", icon: Gamepad2 },
  { key: "Career", label: "CAREER", icon: Briefcase },
];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  Social: "SOCIAL",
  Code: "CODE",
  Game: "GAME",
  Career: "CAREER",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Social: BRAND.gold,
  Code: BRAND.green,
  Game: BRAND.red,
  Career: BRAND.blue,
};
