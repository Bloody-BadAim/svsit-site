import type { Locale } from "./config";

/**
 * Centrale message-barrel. Elke namespace is een los JSON-bestand per taal
 * onder src/messages/{nl,en}/<namespace>.json. Zo kan er parallel aan losse
 * paginas vertaald worden zonder dat 2 mensen hetzelfde bestand raken.
 *
 * Nieuwe namespace toevoegen:
 *   1. maak src/messages/nl/<ns>.json + src/messages/en/<ns>.json
 *   2. importeer ze hieronder en zet ze in nl{} en en{}
 */

// common
import nlCommon from "@/messages/nl/common.json";
import enCommon from "@/messages/en/common.json";
// navbar
import nlNavbar from "@/messages/nl/navbar.json";
import enNavbar from "@/messages/en/navbar.json";
// footer
import nlFooter from "@/messages/nl/footer.json";
import enFooter from "@/messages/en/footer.json";

const nl = {
  common: nlCommon,
  navbar: nlNavbar,
  footer: nlFooter,
} as const;

const en = {
  common: enCommon,
  navbar: enNavbar,
  footer: enFooter,
} as const;

const all = { nl, en } as const;

export type Messages = typeof nl;

export function getAppMessages(locale: Locale): Messages {
  return all[locale] as Messages;
}
