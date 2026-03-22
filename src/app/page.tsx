import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhyJoin from "@/components/WhyJoin";
import Events from "@/components/Events";
import Board from "@/components/Board";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import PageScrollProgress from "@/components/PageScrollProgress";
import EventStrip from "@/components/EventStrip";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";

export default function Home() {
  return (
    <>
      <ConsoleEasterEgg />
      <PageScrollProgress />
      <EventStrip />
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
    </>
  );
}
