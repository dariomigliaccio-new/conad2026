import { readContent } from "@/lib/content";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PlansCarousel } from "@/components/PlansCarousel";
import { heroSlides } from "@/data/home";

type Plano = { nome: string; preco: string; descricao: string; beneficios: string[]; ctaText: string; ctaHref: string; destaque: boolean };
type PlanosData = { planos: Plano[] };

export default async function Home() {
  const { planos } = await readContent<PlanosData>("planos");
  return (
    <main>
      <HeroCarousel slides={heroSlides} />
      <Countdown />
      <PlansCarousel planos={planos} />
    </main>
  );
}
