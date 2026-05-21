import { readContent } from "@/lib/content";

type Contato = { email: string; whatsapp: string; horario: string; intro: string };

export default async function ContatoPage() {
  const d = await readContent<Contato>("contato");
  const waNumber = d.whatsapp.replace(/\D/g, "");

  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Contato</h1>
        <div className="pageDivider" />
        {d.intro && <p className="pageLead">{d.intro}</p>}
      </section>

      <section className="section">
        <div className="contatoCards">
          <a href={`mailto:${d.email}`} className="contatoCard">
            <span className="contatoCardIcon">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7 10-7" />
              </svg>
            </span>
            <span className="contatoCardLabel">E-MAIL</span>
            <span className="contatoCardValue">{d.email}</span>
          </a>

          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener" className="contatoCard">
            <span className="contatoCardIcon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.572a.75.75 0 0 0 .92.92l5.733-1.476A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75A9.75 9.75 0 1 1 12 2.25a9.75 9.75 0 0 1 0 19.5z"/>
              </svg>
            </span>
            <span className="contatoCardLabel">WHATSAPP</span>
            <span className="contatoCardValue">{d.whatsapp}</span>
          </a>

          {d.horario && (
            <div className="contatoCard">
              <span className="contatoCardIcon">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" strokeLinecap="round" />
                </svg>
              </span>
              <span className="contatoCardLabel">ATENDIMENTO</span>
              <span className="contatoCardValue">{d.horario}</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
