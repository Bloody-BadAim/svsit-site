import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocumentenContent from "./DocumentenContent";

export const metadata: Metadata = {
  title: "Documenten - {SIT}",
  description:
    "Officiele documenten van Studievereniging Innovatie en Technologie (SIT): statuten, huishoudelijk reglement en jaarverslagen.",
  openGraph: {
    title: "Documenten - {SIT}",
    description: "Statuten, reglementen en verantwoording van SIT.",
    siteName: "{SIT}",
    locale: "nl_NL",
    type: "website",
    url: "https://svsit.nl/documenten",
  },
};

export default function DocumentenPage() {
  return (
    <div className="page-public">
      <Navbar />
      <main id="main-content" style={{ paddingTop: "5rem" }}>
        <DocumentenContent />
      </main>
      <Footer />
    </div>
  );
}
