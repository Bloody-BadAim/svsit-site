import { permanentRedirect } from "next/navigation";

// Commissies en bestuur zijn samengevoegd tot Het Moederbord op /over-ons.
export default function CommissiesRedirect() {
  permanentRedirect("/over-ons");
}
