import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; lat: string; lng: string; como_chegar: string; hospedagem: string };

export default async function LocalPage() {
  const d = await readContent<Local>("local");
  const token = process.env.MAPBOX_TOKEN ?? "";

  const hasCoords = d.lat && d.lng;
  const hasMap = hasCoords && token;
  const mapUrl = hasMap
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/pin-l+ff0000(${d.lng},${d.lat})/${d.lng},${d.lat},15/1280x508@2x?access_token=${token}`
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

      {mapUrl && (
        <div className="localMapWrap">
          <img
            src={mapUrl}
            alt={`Mapa — ${d.nome}`}
            className="localMapImg"
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
