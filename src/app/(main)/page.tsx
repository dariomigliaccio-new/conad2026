import { readContent } from "@/lib/content";
import { Countdown } from "@/components/Countdown";
import { HeroCarousel } from "@/components/HeroCarousel";
import type { HeroSlide } from "@/data/home";

export const dynamic = "force-dynamic";

type HeroData = { slides: HeroSlide[] };
type EventoData = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string };

export default async function Home() {
  const [{ slides }, evento] = await Promise.all([
    readContent<HeroData>("hero"),
    readContent<EventoData>("evento").catch(() => ({
      titulo: "CONAD 2026",
      subtitulo: "Conferência Nacional",
      descricao: "",
      data: "15–17 de Agosto, 2026",
      cidade: "A definir",
    })),
  ]);

  return (
    <main>
      <HeroCarousel slides={slides} />

      <section className="registerStrip">
        <div className="registerStripInner">
          <div className="registerStripInfo">
            <p className="registerStripEyebrow">Inscrições abertas</p>
            <h2 className="registerStripTitle">{evento.titulo}</h2>
            <div className="registerStripMeta">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {evento.data}
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {evento.cidade}
              </span>
            </div>
          </div>
          <a href="/planos" className="registerStripBtn">
            Garantir minha inscrição
          </a>
        </div>
      </section>

      <Countdown />
    </main>
  );
}
