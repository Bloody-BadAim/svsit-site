import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import WhyJoin from "@/components/WhyJoin";
import Events from "@/components/Events";
import JoinCta from "@/components/JoinCta";
import Footer from "@/components/Footer";
import BackgroundStreaks from "@/components/BackgroundStreaks";
import PageScrollProgress from "@/components/PageScrollProgress";
// import EventPhotoSlider from "@/components/EventPhotoSlider";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import CustomCursor from "@/components/CustomCursor";
import KonamiGame from "@/components/KonamiGame";
import SmoothScroll from "@/components/SmoothScroll";
import EventTicker from "@/components/EventTicker";

export default function Home() {
  return (
    <SmoothScroll>
      <BackgroundStreaks />
      <CustomCursor />
      <ConsoleEasterEgg />
      <KonamiGame />
      <PageScrollProgress />
      {/* <EventPhotoSlider /> */}
      <Navbar />
      <main className="relative z-[1] flex-1">
        <Hero />
        {/* Gradient fade: hero particles into About */}
        <div
          className="h-px mx-6 md:mx-12 lg:mx-24"
          style={{
            background:
              "linear-gradient(to right, var(--color-accent-gold), var(--color-accent-gold), transparent)",
            opacity: 0.3,
          }}
        />
        <About />
        {/* Spacer: breathing room between About and WhyJoin */}
        <div className="h-16 md:h-24" />
        <div
          className="h-px mx-6 md:mx-12 lg:mx-24"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-accent-gold), var(--color-accent-blue), transparent)",
            opacity: 0.15,
          }}
        />
        <div className="h-16 md:h-24" />
        <WhyJoin />
        {/* Subtle divider before Events */}
        <div
          className="h-px mx-6 md:mx-12 lg:mx-24"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-accent-blue), transparent)",
            opacity: 0.15,
          }}
        />
        <Events />
        <EventTicker />
        <JoinCta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
