import { readContent } from "@/lib/content";

type Contato = { email: string; whatsapp: string; horario: string; intro: string };

export default async function ContatoPage() {
  const d = await readContent<Contato>("contato");
  return (
    <main className="section" id="contato">
      <div className="sectionHeader">
        <h2>Contato</h2>
        {d.intro && <p>{d.intro}</p>}
      </div>
      <div className="contatoGrid">
        <div className="contatoItem">
          <span>E-MAIL</span>
          <a href={`mailto:${d.email}`}>{d.email}</a>
        </div>
        <div className="contatoItem">
          <span>WHATSAPP</span>
          <a href={`https://wa.me/${d.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener">{d.whatsapp}</a>
        </div>
        {d.horario && (
          <div className="contatoItem">
            <span>ATENDIMENTO</span>
            <strong>{d.horario}</strong>
          </div>
        )}
      </div>
    </main>
  );
}
