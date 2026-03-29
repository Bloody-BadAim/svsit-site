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
import CustomCursor from "@/components/CustomCursor";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import KonamiGame from "@/components/KonamiGame";
import SmoothScroll from "@/components/SmoothScroll";
import SectionDivider from "@/components/SectionDivider";

export default function Home() {
  return (
    <SmoothScroll>
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
    </SmoothScroll>
  );
}
