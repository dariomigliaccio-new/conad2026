import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Evento = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string };

export default async function EventoPage() {
  const d = await readContent<Evento>("evento");
  return (
    <main>
      <section className="pageHero">
        <p className="pageEyebrow">{d.subtitulo}</p>
        <h1 className="pageTitle">{d.titulo}</h1>
        <div className="pageDivider" />
        <p className="pageLead">{d.descricao}</p>
      </section>

      <section className="eventoMetaSection">
        <div className="eventoMetaCard">
          <span className="eventoMetaIcon">◇</span>
          <span className="eventoMetaLabel">DATA</span>
          <strong className="eventoMetaValue">{d.data}</strong>
        </div>
        <div className="eventoMetaDivider" />
        <div className="eventoMetaCard">
          <span className="eventoMetaIcon">◇</span>
          <span className="eventoMetaLabel">LOCAL</span>
          <strong className="eventoMetaValue">{d.cidade}</strong>
        </div>
      </section>
    </main>
  );
}
