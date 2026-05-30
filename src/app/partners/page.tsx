import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PartnersNetwork from "@/components/PartnersNetwork";

export const metadata: Metadata = {
  title: "Partners — {SIT}",
  description:
    "Het partnernetwerk van SIT. Bedrijven en kennisinstellingen die zich verbinden aan 200+ HBO-ICT studenten aan de HvA.",
  openGraph: {
    title: "Partners — {SIT}",
    description:
      "Het partnernetwerk van SIT — verbonden aan 200+ ICT-studenten aan de HvA.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/partners",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partners — {SIT}",
    description: "Het partnernetwerk van SIT.",
  },
};

export default function PartnersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[var(--color-bg)]">
        <PartnersNetwork />
      </main>
      <Footer />
    </>
  );
}
