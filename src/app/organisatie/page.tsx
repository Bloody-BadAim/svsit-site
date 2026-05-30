import { permanentRedirect } from "next/navigation";

// De organisatie-stamboom is opgegaan in Het Moederbord op /over-ons.
export default function OrganisatieRedirect() {
  permanentRedirect("/over-ons");
}
