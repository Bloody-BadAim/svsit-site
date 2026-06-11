import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacyContent from "./PrivacyContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pagePrivacy");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "{SIT}",
      type: "website",
      url: "https://svsit.nl/privacy",
    },
  };
}

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
