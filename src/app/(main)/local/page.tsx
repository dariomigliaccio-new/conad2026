import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; lat: string; lng: string; como_chegar: string; hospedagem: string };

export default async function LocalPage() {
  const d = await readContent<Local>("local");

  const hasCoords = d.lat && d.lng;
  const mapSrc = hasCoords
    ? `https://maps.google.com/maps?q=${d.lat},${d.lng}&z=15&output=embed&hl=pt`
    : null;

  const fullAddress = [d.endereco, d.cidade, d.estado, d.cep].filter(Boolean).join(", ");

  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <div className="pageDivider" />
        <p className="pageLead">{d.descricao}</p>
      </section>

      {mapSrc && (
        <div className="localMapWrap">
          <iframe
            src={mapSrc}
            className="localMapImg"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa — ${d.nome}`}
          />
        </div>
      )}

      <section className="section localContent">
        <p className="localVenueAddress">39034 County Rd 452, Leesburg, FL 34788</p>
        <p className="localDescricao">Prepare-se para uma experiência transformadora que incluirá atividades emocionantes, momentos de reflexão e oportunidades para fortalecer sua fé e amizades. Mal podemos esperar para compartilhar este tempo com você em um ambiente inspirador e acolhedor.</p>
      </section>
    </main>
  );
}
