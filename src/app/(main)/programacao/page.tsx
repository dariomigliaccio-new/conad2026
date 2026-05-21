import { readContent } from "@/lib/content";

type Sessao = { horario: string; titulo: string; preletor: string; local: string };
type Dia = { data: string; sessoes: Sessao[] };
type Prog = { dias: Dia[] };

export default async function ProgramacaoPage() {
  const d = await readContent<Prog>("programacao");
  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Programação</h1>
        <div className="pageDivider" />
        <p className="pageLead">Confira a grade completa de sessões e ministrações.</p>
      </section>
      <div className="section progGrid">
        {d.dias.map((dia, di) => (
          <div key={di} className="progDia">
            <h3 className="progDiaTitle">{dia.data}</h3>
            <ul className="progList">
              {dia.sessoes.map((s, si) => (
                <li key={si} className="progItem">
                  <span className="progHorario">{s.horario}</span>
                  <div className="progInfo">
                    <strong>{s.titulo}</strong>
                    {s.preletor && <span>{s.preletor}</span>}
                    {s.local && <span className="progLocal">{s.local}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}

