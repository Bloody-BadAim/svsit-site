import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacyverklaring - {SIT}",
  description:
    "Hoe SIT, de studievereniging voor HBO-ICT aan de HvA, omgaat met jouw persoonsgegevens. Welke gegevens we verwerken, waarvoor, en jouw rechten onder de AVG.",
  openGraph: {
    title: "Privacyverklaring - {SIT}",
    description: "Hoe we met jouw gegevens omgaan bij SIT.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="page-public">
      <Navbar />
      <main id="main-content" style={{ paddingTop: "5rem" }}>
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
