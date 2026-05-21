import Image from "next/image";
import { readContent } from "@/lib/content";

type Preletor = { nome: string; cargo: string; bio: string; foto: string };
type Data = { lista: Preletor[] };

export default async function PreletoresPage() {
  const d = await readContent<Data>("preletores");
  return (
    <main className="section" id="preletores">
      <div className="sectionHeader centered">
        <h2>Preletores</h2>
        <p>Conheça os ministros e líderes que estarão presentes na CONAD 2026.</p>
      </div>
      <div className="prelatoresGrid">
        {d.lista.map((p, i) => (
          <article key={i} className="preletorCard">
            <div className="preletorFoto">
              {p.foto
                ? <Image src={p.foto} fill alt={p.nome} style={{ objectFit: "cover" }} />
                : <div className="preletorFotoPlaceholder">{p.nome.charAt(0)}</div>}
            </div>
            <h3>{p.nome}</h3>
            <p className="preletorCargo">{p.cargo}</p>
            {p.bio && <p className="preletorBio">{p.bio}</p>}
          </article>
        ))}
        {d.lista.length === 0 && <p style={{ color: "#888" }}>Preletores serão anunciados em breve.</p>}
      </div>
    </main>
  );
}
