import { readContent } from "@/lib/content";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; maps_link: string; como_chegar: string; hospedagem: string };

export default async function LocalPage() {
  const d = await readContent<Local>("local");
  return (
    <main className="section" id="local">
      <div className="sectionHeader">
        <h2>Local do Evento</h2>
        <p>{d.descricao}</p>
      </div>
      <div className="localGrid">
        <div className="localInfo">
          <h3>{d.nome}</h3>
          {d.endereco && <p>{d.endereco}</p>}
          {d.cidade && <p>{d.cidade}{d.estado && `, ${d.estado}`}{d.cep && ` — ${d.cep}`}</p>}
          {d.como_chegar && (
            <div className="localSec">
              <h4>Como chegar</h4>
              <p style={{ whiteSpace: "pre-line" }}>{d.como_chegar}</p>
            </div>
          )}
          {d.hospedagem && (
            <div className="localSec">
              <h4>Hospedagem</h4>
              <p style={{ whiteSpace: "pre-line" }}>{d.hospedagem}</p>
            </div>
          )}
        </div>
        {d.maps_link && (
          <div className="localMapa">
            <iframe src={d.maps_link} width="100%" height="400" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
          </div>
        )}
      </div>
    </main>
  );
}
