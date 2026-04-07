import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PageScrollProgress from "@/components/PageScrollProgress";

// Defer heavy client components that are not needed for initial paint (LCP)
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"));
const BackgroundStreaks = dynamic(() => import("@/components/BackgroundStreaks"));

// Below-the-fold sections: code-split to reduce initial JS bundle
// Each pulls in GSAP ScrollTrigger, motion, lucide-react, etc. only when needed
const About = dynamic(() => import("@/components/About"));
const WhyJoin = dynamic(() => import("@/components/WhyJoin"));
const Events = dynamic(() => import("@/components/Events"));
const EventTicker = dynamic(() => import("@/components/EventTicker"));
const JoinCta = dynamic(() => import("@/components/JoinCta"));
const Footer = dynamic(() => import("@/components/Footer"));
const SectionDivider = dynamic(() => import("@/components/SectionDivider"));

// Non-critical UI enhancements: deferred
const CustomCursor = dynamic(() => import("@/components/CustomCursor"));
const ConsoleEasterEgg = dynamic(() => import("@/components/ConsoleEasterEgg"));
const KonamiGame = dynamic(() => import("@/components/KonamiGame"));
const ScrollMorphNumbers = dynamic(() => import("@/components/heroAnimations/ScrollMorphNumbers"));
const IntroOverlay = dynamic(() => import("@/components/heroAnimations/IntroOverlay"));

export default function Home() {
  return (
    <SmoothScroll>
      <div className="page-public page-home">
        <BackgroundStreaks />
        <CustomCursor />
        <ConsoleEasterEgg />
        <KonamiGame />
        <IntroOverlay />
        <PageScrollProgress />
        <ScrollMorphNumbers />
        <Navbar />
        <main id="main-content" className="relative z-[1] flex-1">
          <Hero />
          {/* <SectionDivider variant="glow" /> */}
          <About />
          {/* <SectionDivider variant="line" /> */}
          <WhyJoin />
          <SectionDivider variant="battle" />
          <Events />
          <EventTicker />
          {/* <SectionDivider variant="fade" /> */}
          <JoinCta />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
