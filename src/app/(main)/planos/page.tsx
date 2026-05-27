import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Plano = {
  nome: string;
  preco: string;
  descricao: string;
  beneficios: string[];
  ctaText: string;
  ctaHref: string;
  destaque: boolean;
  cor?: string;
  imagem?: string;
};
type Data = { planos: Plano[] };

export default async function PlanosPage() {
  const { planos } = await readContent<Data>("planos");

  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Planos de Inscrição</h1>
        <div className="pageDivider" />
        <p className="pageLead">Escolha a modalidade que melhor se adapta à sua realidade e faça parte do CONAD 2026.</p>
      </section>

      <section className="section">
        <div className="planosDetailGrid">
          {planos.map((p) => (
            <article
              key={p.nome}
              className="planoDetailCard"
              style={{ "--plan-color": p.cor || "#aaaaaa" } as React.CSSProperties}
            >
              <div className="planoCardImgBanner">
                {p.destaque && (
                  <span className="planoCardImgBannerBadge">MAIS POPULAR</span>
                )}
                {p.imagem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagem} alt={p.nome} />
                )}
              </div>

              <div className="planoDetailBody">
                <h2>{p.nome}</h2>
                <p className="planoPreco">{p.preco}</p>
                <p className="planoDesc">{p.descricao}</p>
                {p.beneficios.filter(b => b.trim()).length > 0 && (
                  <ul className="planoBeneficios">
                    {p.beneficios.filter(b => b.trim()).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                <a href={p.ctaHref} className="planoDetailBtn">
                  {p.ctaText}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
