import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Board from "@/components/Board";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Over ons — {SIT}",
  description:
    "Leer het bestuur van SIT kennen. Bestuur XI van de Studievereniging ICT aan de Hogeschool van Amsterdam.",
  openGraph: {
    title: "Over ons — {SIT}",
    description:
      "Leer het bestuur van SIT kennen. Bestuur XI — 2026.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/over-ons",
  },
};

export default function OverOns() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main style={{ paddingTop: "5rem" }}>
        <Board />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
