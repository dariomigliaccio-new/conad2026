import { readContent } from "@/lib/content";

type Plano = { nome: string; preco: string; descricao: string; beneficios: string[]; ctaText: string; ctaHref: string; destaque: boolean };
type Data = { planos: Plano[] };

export default async function PlanosPage() {
  const d = await readContent<Data>("planos");
  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Planos de Inscrição</h1>
        <div className="pageDivider" />
        <p className="pageLead">Escolha a modalidade que melhor se adapta à sua realidade.</p>
      </section>
      <div className="section planosGrid">
        {d.planos.map((p, i) => (
          <article key={i} className={`planoCard${p.destaque ? " planoDestaque" : ""}`}>
            {p.destaque && <span className="planoDestaqueLabel">MAIS POPULAR</span>}
            <h3>{p.nome}</h3>
            <p className="planoPreco">{p.preco}</p>
            <p className="planoDesc">{p.descricao}</p>
            <ul className="planoBeneficios">
              {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
            </ul>
            <a href={p.ctaHref} className={`planoBtn${p.destaque ? " planoBtnDest" : ""}`}>{p.ctaText}</a>
          </article>
        ))}
      </div>
    </main>
  );
}
