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

// Visual config indexed by position: -2, -1, 0 (center), +1, +2
const CFG = [
  { xOffset: -430, scale: 0.62, opacity: 0.28, gz: 0.9, zIndex: 1 },
  { xOffset: -235, scale: 0.82, opacity: 0.55, gz: 0.65, zIndex: 3 },
  { xOffset:    0, scale: 1.00, opacity: 1.00, gz: 0,    zIndex: 5 },
  { xOffset:  235, scale: 0.82, opacity: 0.55, gz: 0.65, zIndex: 3 },
  { xOffset:  430, scale: 0.62, opacity: 0.28, gz: 0.9,  zIndex: 1 },
];
const OFFSETS = [-2, -1, 0, 1, 2];

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const n = planos.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % n), 4000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <div
      className="plansCarouselOuter"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="plansCarouselEyebrow">PLANOS DE INSCRIÇÃO</p>

      <div className="plansCarouselViewport">
        {OFFSETS.map((offset, ci) => {
          const idx = ((current + offset) % n + n) % n;
          const p = planos[idx];
          const { xOffset, scale, opacity, gz, zIndex } = CFG[ci];
          const isCenter = offset === 0;

          return (
            <article
              key={offset}
              className={`planoCard planoCardCarousel${isCenter && p.destaque ? " planoDestaque" : ""}`}
              style={{
                "--plan-color": p.cor || "#cccccc",
                position: "absolute",
                width: 300,
                left: "50%",
                top: "50%",
                transform: `translateX(calc(-50% + ${xOffset}px)) translateY(-50%) scale(${scale})`,
                transformOrigin: "center center",
                opacity,
                zIndex,
                filter: gz > 0 ? `grayscale(${gz})` : "none",
                transition: "transform 0.55s cubic-bezier(.25,.46,.45,.94), opacity 0.55s ease, filter 0.55s ease",
                cursor: isCenter ? "default" : "pointer",
              } as React.CSSProperties}
              onClick={() => !isCenter && setCurrent(idx)}
            >
              {isCenter && p.destaque && (
                <span className="planoDestaqueLabel">MAIS POPULAR</span>
              )}
              <h3>{p.nome}</h3>
              <p className="planoPreco">{p.preco}</p>
              <p className="planoDesc">{p.descricao}</p>
              {isCenter && (
                <>
                  <ul className="planoBeneficios">
                    {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
                  </ul>
                  <a
                    href={p.ctaHref}
                    className={`planoBtn${p.destaque ? " planoBtnDest" : ""}`}
                  >
                    {p.ctaText}
                  </a>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="plansCarouselDots">
        {planos.map((p, i) => (
          <button
            key={i}
            className={`plansCarouselDot${current === i ? " active" : ""}`}
            style={{ "--plan-color": p.cor || "#cccccc" } as React.CSSProperties}
            onClick={() => setCurrent(i)}
            aria-label={`Ver ${p.nome}`}
          />
        ))}
      </div>
    </div>
  );
}
