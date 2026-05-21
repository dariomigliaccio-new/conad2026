import { readContent } from "@/lib/content";

type Evento = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string };

export default async function EventoPage() {
  const d = await readContent<Evento>("evento");
  return (
    <main className="section" id="evento">
      <div className="sectionHeader">
        <p className="kicker">{d.subtitulo}</p>
        <h2>{d.titulo}</h2>
        <p>{d.descricao}</p>
      </div>
      <div className="eventoMeta">
        <div className="eventoMetaItem"><span>DATA</span><strong>{d.data}</strong></div>
        <div className="eventoMetaItem"><span>LOCAL</span><strong>{d.cidade}</strong></div>
      </div>
    </main>
  );
}
