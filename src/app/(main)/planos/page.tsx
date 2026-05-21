import { readContent } from "@/lib/content";
import { PlansCarousel } from "@/components/PlansCarousel";

export const dynamic = "force-dynamic";

type Plano = { nome: string; preco: string; descricao: string; beneficios: string[]; ctaText: string; ctaHref: string; destaque: boolean; cor?: string };
type Data = { planos: Plano[] };

export default async function PlanosPage() {
  const { planos } = await readContent<Data>("planos");
  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Planos de Inscrição</h1>
        <div className="pageDivider" />
        <p className="pageLead">Escolha a modalidade que melhor se adapta à sua realidade.</p>
      </section>
      <PlansCarousel planos={planos} />
    </main>
  );
}
