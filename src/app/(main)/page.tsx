import { readContent } from "@/lib/content";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PlansCarousel } from "@/components/PlansCarousel";
import type { HeroSlide } from "@/data/home";

export const dynamic = "force-dynamic";

type Plano = { nome: string; preco: string; descricao: string; beneficios: string[]; ctaText: string; ctaHref: string; destaque: boolean; cor?: string };
type PlanosData = { planos: Plano[] };
type HeroData = { slides: HeroSlide[] };

export default async function Home() {
  const [{ planos }, { slides }] = await Promise.all([
    readContent<PlanosData>("planos"),
    readContent<HeroData>("hero"),
  ]);
  return (
    <main>
      <HeroCarousel slides={slides} />
      <PlansCarousel planos={planos} />
      <Countdown />
    </main>
  );
}
