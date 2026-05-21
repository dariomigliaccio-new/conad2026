"use client";

type Plano = {
  nome: string;
  preco: string;
  descricao: string;
  beneficios: string[];
  ctaText: string;
  ctaHref: string;
  destaque: boolean;
  cor?: string;
};

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const items = [...planos, ...planos];
  return (
    <div className="plansCarouselOuter">
      <p className="plansCarouselEyebrow">PLANOS DE INSCRIÇÃO</p>
      <div className="plansCarouselTrack">
        {items.map((p, i) => (
          <article
            key={i}
            className={`planoCard planoCardCarousel${p.destaque ? " planoDestaque" : ""}`}
            style={p.cor ? { borderColor: p.cor, borderWidth: 2 } : undefined}
          >
            {p.destaque && (
              <span className="planoDestaqueLabel" style={p.cor ? { color: p.cor } : undefined}>
                MAIS POPULAR
              </span>
            )}
            <h3 style={p.cor && !p.destaque ? { color: p.cor } : undefined}>{p.nome}</h3>
            <p className="planoPreco">{p.preco}</p>
            <p className="planoDesc">{p.descricao}</p>
            <ul className="planoBeneficios">
              {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
            </ul>
            <a
              href={p.ctaHref}
              className={`planoBtn${p.destaque ? " planoBtnDest" : ""}`}
              style={p.cor && !p.destaque ? { borderColor: p.cor, color: p.cor } : undefined}
            >
              {p.ctaText}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
