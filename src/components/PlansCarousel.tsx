"use client";
import { useEffect, useState } from "react";

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

const CARD_W = 350;
const GAP = 24;
const STEP = CARD_W + GAP; // px per advance

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const n = planos.length;
  const [pos, setPos] = useState(0);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);

  // Extend array: original + 3 clones at end for seamless loop
  const items = [...planos, ...planos, ...planos].slice(0, n + 3);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPos(p => p + 1), 2500);
    return () => clearInterval(t);
  }, [paused]);

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== "transform") return;
    if (pos >= n) {
      setAnimated(false);
      setPos(0);
    }
  }

  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  const currentIdx = pos % n;

  return (
    <div
      className="plansCarouselOuter"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="plansCarouselEyebrow">PLANOS DE INSCRIÇÃO</p>

      <div className="plansCarouselViewport">
        <div
          className="plansCarouselTrack"
          style={{
            transform: `translateX(-${pos * STEP}px)`,
            transition: animated ? "transform 0.35s ease" : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {items.map((p, i) => (
            <article
              key={i}
              className="planoCard planoCardCarousel"
              style={{ "--plan-color": p.cor || "#aaaaaa" } as React.CSSProperties}
            >
              {p.destaque && (
                <span
                  className="planoDestaqueLabel"
                  style={{ background: p.cor || "#000", color: "#fff" }}
                >
                  MAIS POPULAR
                </span>
              )}
              <h3>{p.nome}</h3>
              <p className="planoPreco">{p.preco}</p>
              <p className="planoDesc">{p.descricao}</p>
              <ul className="planoBeneficios">
                {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
              </ul>
              <a href={p.ctaHref} className="planoBtn planoCarouselBtn">
                {p.ctaText}
              </a>
            </article>
          ))}
        </div>
      </div>

      <div className="plansCarouselDots">
        {planos.map((p, i) => (
          <button
            key={i}
            className={`plansCarouselDot${currentIdx === i ? " active" : ""}`}
            style={{ "--plan-color": p.cor || "#aaaaaa" } as React.CSSProperties}
            onClick={() => { setAnimated(true); setPos(i); }}
            aria-label={`Ver ${p.nome}`}
          />
        ))}
      </div>
    </div>
  );
}
