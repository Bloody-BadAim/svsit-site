import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhyJoin from "@/components/WhyJoin";
import Events from "@/components/Events";
import Board from "@/components/Board";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import PageScrollProgress from "@/components/PageScrollProgress";
import EventPhotoSlider from "@/components/EventPhotoSlider";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import CustomCursor from "@/components/CustomCursor";
import KonamiCode from "@/components/KonamiCode";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <ConsoleEasterEgg />
      <KonamiCode />
      <PageScrollProgress />
      <EventPhotoSlider />
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyJoin />
        <Events />
        <Board />
        <JoinCta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
