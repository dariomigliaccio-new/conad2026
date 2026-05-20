"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { HeroSlide } from "@/data/home";

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const SLIDE_INTERVAL_MS = 4500;
const LOOP_RESET_MS = 1900;

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visualIndex, setVisualIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const renderedSlides = useMemo(() => {
    if (slides.length <= 1) return slides;
    return [...slides, slides[0]];
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= slides.length - 1) {
          setVisualIndex(slides.length);
          window.setTimeout(() => {
            setTransitionEnabled(false);
            setVisualIndex(0);
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => setTransitionEnabled(true));
            });
          }, LOOP_RESET_MS);
          return 0;
        }

        const next = current + 1;
        setVisualIndex(next);
        return next;
      });
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setVisualIndex(index);
  };

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <section className="hero" aria-label="Destaque">
      <div
        className={`heroTrack ${transitionEnabled ? "" : "heroTrackNoTransition"}`}
        style={{
          transform: `translateX(-${visualIndex * 100}%)`,
          ["--hero-slide-interval" as string]: `${SLIDE_INTERVAL_MS}ms`,
        }}
      >
        {renderedSlides.map((slide, index) => (
          <div className="heroSlide" key={`${slide.src}-${index}`}>
            <Image
              src={slide.src}
              alt=""
              fill
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="100vw"
              className={index === visualIndex ? "heroImage isMoving" : "heroImage"}
            />
          </div>
        ))}
      </div>

      <div className="heroOverlay" />

      <div className="heroContent" key={activeIndex}>
        <Image
          src="/images/conad-logo.png"
          width={499}
          height={175}
          alt="CONAD"
          className="heroLogo"
          priority
        />
        <p className="heroEyebrow">{activeSlide.eyebrow}</p>
        <h1>{activeSlide.title}</h1>
        <p className="heroLead">{activeSlide.lead}</p>
        <div className="heroActions">
          <a className="button buttonPrimary" href={activeSlide.primaryHref}>
            {activeSlide.primaryCta}
          </a>
          <a className="button buttonGhost" href={activeSlide.secondaryHref}>
            {activeSlide.secondaryCta}
          </a>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="heroDots" role="tablist" aria-label="Banners em destaque">
          {slides.map((slide, index) => (
            <button
              className={`heroDot ${index === activeIndex ? "isActive isProgressing" : ""}`}
              type="button"
              aria-label={`Mostrar banner ${index + 1}: ${slide.title}`}
              aria-selected={index === activeIndex}
              key={slide.src}
              onClick={() => goTo(index)}
              role="tab"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
