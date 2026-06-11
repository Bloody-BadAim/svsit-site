import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PartnersNetwork from "@/components/PartnersNetwork";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pagePartners");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "{SIT}",
      type: "website",
      url: "https://svsit.nl/partners",
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  };
}

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
