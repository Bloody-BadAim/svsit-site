import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FaqContent from "./FaqContent";
import { SITE_CONFIG } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageFaq");
  const title = t("metaTitle");
  return {
    title,
    description: t("metaDescription"),
    openGraph: {
      title,
      description: t("ogDescription"),
      siteName: "{SIT}",
      type: "website",
      url: "https://svsit.nl/faq",
    },
  };
}

export default async function FaqPage() {
  const t = await getTranslations("pageFaq");
  const sd = (key: string, values?: Record<string, string | number>) =>
    t(`structuredData.${key}`, values);

  const FAQ_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: sd("q1"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a1", {
            members: SITE_CONFIG.stats.members,
            commissies: SITE_CONFIG.stats.commissies,
          }),
        },
      },
      {
        "@type": "Question",
        name: sd("q2"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a2", { price: SITE_CONFIG.membership.priceLabel }),
        },
      },
      {
        "@type": "Question",
        name: sd("q3"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a3"),
        },
      },
      {
        "@type": "Question",
        name: sd("q4"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a4"),
        },
      },
      {
        "@type": "Question",
        name: sd("q5"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a5"),
        },
      },
      {
        "@type": "Question",
        name: sd("q6"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a6"),
        },
      },
      {
        "@type": "Question",
        name: sd("q7"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a7"),
        },
      },
      {
        "@type": "Question",
        name: sd("q8"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a8"),
        },
      },
      {
        "@type": "Question",
        name: sd("q9"),
        acceptedAnswer: {
          "@type": "Answer",
          text: sd("a9", {
            email: SITE_CONFIG.email,
            instagram: SITE_CONFIG.socials.instagram.handle,
            tiktok: SITE_CONFIG.socials.tiktok.handle,
          }),
        },
      },
    ],
  };

  return (
    <div className="page-public">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_STRUCTURED_DATA) }}
      />
      <Navbar />
      <main id="main-content" style={{ paddingTop: "5rem" }}>
        <FaqContent />
      </main>
      <Footer />
    </div>
  );
}
