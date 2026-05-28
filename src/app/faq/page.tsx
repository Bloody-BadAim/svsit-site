import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "FAQ — {SIT}",
  description:
    "Veelgestelde vragen over SIT, de studievereniging voor HBO-ICT aan de HvA. Wat kost het, wat krijg je, en hoe word je lid.",
  openGraph: {
    title: "FAQ — {SIT}",
    description: "Alles wat je wilt weten over lid worden van SIT.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/faq",
  },
};

export default function FaqPage() {
  return (
    <div className="page-public">
      <Navbar />
      <main id="main-content" style={{ paddingTop: "5rem" }}>
        <FaqContent />
      </main>
      <Footer />
    </div>
  );
}
