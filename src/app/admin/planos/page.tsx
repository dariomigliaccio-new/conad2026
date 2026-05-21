"use client";
import { useEffect, useState } from "react";

type Plano = { nome: string; preco: string; descricao: string; beneficios: string[]; ctaText: string; ctaHref: string; destaque: boolean };
type Data = { planos: Plano[] };
const newItem = (): Plano => ({ nome: "", preco: "", descricao: "", beneficios: [""], ctaText: "Inscrever-se", ctaHref: "#inscricao", destaque: false });

export default function AdminPlanos() {
  const [d, setD] = useState<Data>({ planos: [] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/planos").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/planos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    setMsg(r.ok ? "✓ Salvo com sucesso!" : "✗ Erro ao salvar.");
    setSaving(false);
  }

  function updatePlano(i: number, k: keyof Plano, v: string | boolean) {
    setD(p => { const l = [...p.planos]; l[i] = { ...l[i], [k]: v }; return { planos: l }; });
  }

  function updateBeneficios(i: number, text: string) {
    const beneficios = text.split("\n");
    setD(p => { const l = [...p.planos]; l[i] = { ...l[i], beneficios }; return { planos: l }; });
  }

  function remove(i: number) {
    setD(p => ({ planos: p.planos.filter((_, j) => j !== i) }));
  }

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Planos de Inscrição</h2></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="adminButton" style={{ background: "#fff", color: "#000", border: "1px solid #ccc" }} onClick={() => setD(p => ({ planos: [...p.planos, newItem()] }))}>+ Adicionar</button>
            <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        {d.planos.map((p, i) => (
          <div key={i} className="adminListItem">
            <div className="adminListItemHeader">
              <strong>{p.nome || `Plano ${i + 1}`} {p.destaque && <span style={{ fontSize: 11, background: "#000", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>DESTAQUE</span>}</strong>
              <button className="adminRemoveBtn" onClick={() => remove(i)}>Remover</button>
            </div>
            <div className="adminForm">
              <label>Nome do plano<input value={p.nome} onChange={e => updatePlano(i, "nome", e.target.value)} /></label>
              <label>Preço (ex: R$ 250,00 ou Gratuito)<input value={p.preco} onChange={e => updatePlano(i, "preco", e.target.value)} /></label>
              <label>Descrição breve<input value={p.descricao} onChange={e => updatePlano(i, "descricao", e.target.value)} /></label>
              <label>Benefícios (um por linha)<textarea rows={5} value={p.beneficios.join("\n")} onChange={e => updateBeneficios(i, e.target.value)} /></label>
              <label>Texto do botão<input value={p.ctaText} onChange={e => updatePlano(i, "ctaText", e.target.value)} /></label>
              <label>Link do botão<input value={p.ctaHref} onChange={e => updatePlano(i, "ctaHref", e.target.value)} /></label>
              <label style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={p.destaque} onChange={e => updatePlano(i, "destaque", e.target.checked)} style={{ width: "auto" }} />
                Destacar este plano
              </label>
            </div>
          </div>
        ))}

        {d.planos.length === 0 && <p style={{ color: "#888", padding: "24px 0" }}>Nenhum plano cadastrado. Clique em "+ Adicionar".</p>}
      </div>
    </div>
  );
}
