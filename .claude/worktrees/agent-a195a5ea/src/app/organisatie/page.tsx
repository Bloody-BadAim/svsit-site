import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import OrgTree from "@/components/orgTree/OrgTree";

export const metadata: Metadata = {
  title: "Organisatie — {SIT}",
  description:
    "Wie zit er in het bestuur en welke commissies zijn er? Bekijk de SIT organisatie stamboom.",
};

export default function OrganisatiePage() {
  return (
    <SmoothScroll>
      <div className="page-public">
        <Navbar />
        <main id="main-content" className="relative z-[1] flex-1" style={{ paddingTop: "5rem" }}>
          <OrgTree />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
