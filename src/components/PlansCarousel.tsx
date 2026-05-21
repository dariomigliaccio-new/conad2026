"use client";

type Plano = {
  nome: string;
  preco: string;
  descricao: string;
  beneficios: string[];
  ctaText: string;
  ctaHref: string;
  destaque: boolean;
};

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const items = [...planos, ...planos];
  return (
    <div className="plansCarouselOuter">
      <p className="plansCarouselEyebrow">PLANOS DE INSCRIÇÃO</p>
      <div className="plansCarouselTrack">
        {items.map((p, i) => (
          <article key={i} className={`planoCard planoCardCarousel${p.destaque ? " planoDestaque" : ""}`}>
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
    </div>
  );
}
