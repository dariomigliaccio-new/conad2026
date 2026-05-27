import Image from "next/image";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Preletor = { nome: string; cargo: string; bio: string; foto: string };
type Data = { lista: Preletor[] };

export default async function PreletoresPage() {
  const d = await readContent<Data>("preletores");
  return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Preletores</h1>
        <div className="pageDivider" />
        <p className="pageLead">Conheça os ministros e líderes que estarão presentes na conferência.</p>
      </section>

      <section className="section">
        {d.lista.length === 0 ? (
          <p className="emptyState">Os preletores serão anunciados em breve.</p>
        ) : (
          <div className="prelatoresGrid">
            {d.lista.map((p, i) => (
              <article key={i} className="preletorCard">
                <div className="preletorFotoWrap">
                  {p.foto
                    ? <Image src={p.foto} fill alt={p.nome} style={{ objectFit: "cover" }} />
                    : <span className="preletorInitial">{p.nome.charAt(0)}</span>}
                </div>
                <div className="preletorInfo">
                  <h2 className="preletorNome">{p.nome}</h2>
                  <p className="preletorCargo">{p.cargo}</p>
                  {p.bio && <p className="preletorBio">{p.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
