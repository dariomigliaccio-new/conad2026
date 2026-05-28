import { readContent } from "@/lib/content";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import type { HeroSlide } from "@/data/home";

export const dynamic = "force-dynamic";

type HeroData = { slides: HeroSlide[] };

export default async function Home() {
  const { slides } = await readContent<HeroData>("hero");
  return (
    <main>
      <HeroCarousel slides={slides} />
      <Countdown />
    </main>
  );
}
