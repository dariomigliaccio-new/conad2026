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
        <h1 className="pageTitle">Local do Evento</h1>
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
        <div className="localVenueBlock">
          <p className="localVenueLabel">VENUE</p>
          <h2 className="localVenueName">{d.nome}</h2>
          {fullAddress && <p className="localVenueAddress">{fullAddress}</p>}
        </div>

        <div className="localInfoGrid">
          {d.como_chegar && (
            <div className="localInfoCard">
              <span className="localInfoIcon">→</span>
              <h3>Como chegar</h3>
              <p style={{ whiteSpace: "pre-line" }}>{d.como_chegar}</p>
            </div>
          )}
          {d.hospedagem && (
            <div className="localInfoCard">
              <span className="localInfoIcon">◇</span>
              <h3>Hospedagem</h3>
              <p style={{ whiteSpace: "pre-line" }}>{d.hospedagem}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
