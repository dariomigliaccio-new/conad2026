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

const CARD_W = 300;
const GAP = 24;
const STEP = CARD_W + GAP;

export function PlansCarousel({ planos }: { planos: Plano[] }) {
  const n = planos.length;
  // Clone last item at start and first item at end for seamless loop
  const items = [planos[n - 1], ...planos, planos[0]];

  const [pos, setPos] = useState(1); // 1 = first real card centered
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPos(p => p + 1), 3500);
    return () => clearInterval(t);
  }, [paused]);

  // After transition: silently jump back to real array boundaries
  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== "transform") return;
    if (pos >= n + 1) {
      setAnimated(false);
      setPos(1);
    } else if (pos <= 0) {
      setAnimated(false);
      setPos(n);
    }
  }

  // Re-enable animation one frame after the silent position jump
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  // Centers item at index `pos`: 50vw = track_left + pos*STEP + CARD_W/2
  const offset = pos * STEP + CARD_W / 2;
  const currentIdx = ((pos - 1) % n + n) % n;

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
            transform: `translateX(calc(50vw - ${offset}px))`,
            transition: animated
              ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {items.map((p, i) => (
            <article
              key={i}
              className={`planoCard planoCardCarousel${p.destaque ? " planoDestaque" : ""}`}
              style={{ "--plan-color": p.cor || "#cccccc" } as React.CSSProperties}
            >
              {p.destaque && (
                <span className="planoDestaqueLabel">MAIS POPULAR</span>
              )}
              <h3>{p.nome}</h3>
              <p className="planoPreco">{p.preco}</p>
              <p className="planoDesc">{p.descricao}</p>
              <ul className="planoBeneficios">
                {p.beneficios.map((b, bi) => b.trim() && <li key={bi}>{b}</li>)}
              </ul>
              <a
                href={p.ctaHref}
                className={`planoBtn${p.destaque ? " planoBtnDest" : ""}`}
              >
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
            style={{ "--plan-color": p.cor || "#cccccc" } as React.CSSProperties}
            onClick={() => { setAnimated(true); setPos(i + 1); }}
            aria-label={`Ver ${p.nome}`}
          />
        ))}
      </div>
    </div>
  );
}
