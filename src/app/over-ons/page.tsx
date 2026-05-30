import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Moederbord from "@/components/Moederbord";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Het Moederbord - Bestuur & Commissies - {SIT}",
  description:
    "Het Moederbord: bestuur en commissies van SIT in één organigram. Bestuur XII is de kern, elke commissie een module die je kunt aansluiten. Sluit jezelf aan.",
  openGraph: {
    title: "Het Moederbord - Bestuur & Commissies - {SIT}",
    description:
      "Bestuur XII vormt de kern, elke commissie is een module. Ontdek de organisatie van SIT en sluit je aan.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/over-ons",
  },
  twitter: {
    card: "summary_large_image",
    title: "Het Moederbord - Bestuur & Commissies - {SIT}",
    description:
      "Bestuur XII en de commissies van SIT als één moederbord. Sluit je aan.",
  },
  alternates: { canonical: "https://svsit.nl/over-ons" },
};

export default function OverOns() {
  return (
    <SmoothScroll>
      <div className="page-public">
        <CustomCursor />
        <Navbar />
        <main id="main-content">
          <Moederbord />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
