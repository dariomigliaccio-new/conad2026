import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { heroSlides } from "@/data/home";

export default function Home() {
  return (
    <main>
      <HeroCarousel slides={heroSlides} />
      <Countdown />
    </main>
  );
}
