import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Evento = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string; youtube_url: string };

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
}

export default async function EventoPage() {
  const d = await readContent<Evento>("evento");
  const embedUrl = getEmbedUrl(d.youtube_url ?? "");

  return (
    <main>
      {embedUrl && (
        <div className="eventoVideoWrap" style={{ paddingTop: "clamp(24px, 3vw, 40px)" }}>
          <div className="eventoVideoFrame">
            <iframe
              src={embedUrl}
              title={d.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0, width: "100%", height: "100%", display: "block" }}
            />
          </div>
        </div>
      )}

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
