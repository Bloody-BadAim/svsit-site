import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhyJoin from "@/components/WhyJoin";
import Events from "@/components/Events";
import EventTicker from "@/components/EventTicker";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import BackgroundStreaks from "@/components/BackgroundStreaks";
import PageScrollProgress from "@/components/PageScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import SectionDivider from "@/components/SectionDivider";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"));
const ConsoleEasterEgg = dynamic(() => import("@/components/ConsoleEasterEgg"));
const KonamiGame = dynamic(() => import("@/components/KonamiGame"));

export default function Home() {
  return (
    <SmoothScroll>
      <div className="page-public">
      <BackgroundStreaks />
      <CustomCursor />
      <ConsoleEasterEgg />
      <KonamiGame />
      <PageScrollProgress />
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
