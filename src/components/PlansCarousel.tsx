"use client";
import { useEffect, useState } from "react";

type Plano = {
  nome: string; preco: string; descricao: string;
  beneficios: string[]; ctaText: string; ctaHref: string;
  destaque: boolean; cor?: string;
};

// Config per slot: -2, -1, 0 (center), +1, +2
const CFG = [
  { x: -420, scale: 0.58, opacity: 0.20, gray: 0.90, z: 1 },
  { x: -235, scale: 0.80, opacity: 0.50, gray: 0.60, z: 3 },
  { x:    0, scale: 1.00, opacity: 1.00, gray: 0.00, z: 5 },
  { x:  235, scale: 0.80, opacity: 0.50, gray: 0.60, z: 3 },
  { x:  420, scale: 0.58, opacity: 0.20, gray: 0.90, z: 1 },
];

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const n = planos.length;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCur(c => (c + 1) % n), 3000);
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
        {CFG.map(({ x, scale, opacity, gray, z }, ci) => {
          const offset = ci - 2; // -2 … +2
          const idx = ((cur + offset) % n + n) % n;
          const p = planos[idx];
          const isCenter = offset === 0;

          return (
            <article
              key={ci}
              className="planoCard planoCardCarousel"
              style={{
                "--plan-color": p.cor || "#aaaaaa",
                position: "absolute",
                width: 300,
                left: "50%",
                top: "calc(50% - 210px)",
                transform: `translateX(calc(-50% + ${x}px)) scale(${scale})`,
                transformOrigin: "center center",
                opacity,
                zIndex: z,
                filter: gray > 0 ? `grayscale(${gray})` : "none",
                transition: "transform 0.5s cubic-bezier(.25,.46,.45,.94), opacity 0.5s ease, filter 0.5s ease",
                cursor: isCenter ? "default" : "pointer",
              } as React.CSSProperties}
              onClick={() => !isCenter && setCur(idx)}
            >
              {isCenter && p.destaque && (
                <span className="planoDestaqueLabel" style={{ background: p.cor || "#000", color: "#fff" }}>
                  MAIS POPULAR
                </span>
              )}
              <h3>{p.nome}</h3>
              <p className="planoPreco">{p.preco}</p>
              <p className="planoDesc">{p.descricao}</p>
              {isCenter && (
                <>
                  <ul className="planoBeneficios">
                    {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
                  </ul>
                  <a href={p.ctaHref} className="planoBtn planoCarouselBtn">
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
            className={`plansCarouselDot${cur === i ? " active" : ""}`}
            style={{ "--plan-color": p.cor || "#aaaaaa" } as React.CSSProperties}
            onClick={() => setCur(i)}
            aria-label={`Ver ${p.nome}`}
          />
        ))}
      </div>
    </div>
  );
}
