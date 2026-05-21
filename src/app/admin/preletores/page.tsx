"use client";
import { useEffect, useState } from "react";

type Preletor = { nome: string; cargo: string; bio: string; foto: string };
type Data = { lista: Preletor[] };
const newItem = (): Preletor => ({ nome: "", cargo: "", bio: "", foto: "" });

export default function AdminPreletores() {
  const [d, setD] = useState<Data>({ lista: [] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/preletores").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/preletores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    setMsg(r.ok ? "✓ Salvo com sucesso!" : "✗ Erro ao salvar.");
    setSaving(false);
  }

  function update(i: number, k: keyof Preletor, v: string) {
    setD(p => { const l = [...p.lista]; l[i] = { ...l[i], [k]: v }; return { lista: l }; });
  }

  function remove(i: number) {
    setD(p => ({ lista: p.lista.filter((_, j) => j !== i) }));
  }

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Preletores</h2></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="adminButton" style={{ background: "#fff", color: "#000", border: "1px solid #ccc" }} onClick={() => setD(p => ({ lista: [...p.lista, newItem()] }))}>+ Adicionar</button>
            <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        {d.lista.map((p, i) => (
          <div key={i} className="adminListItem">
            <div className="adminListItemHeader">
              <strong>{p.nome || `Preletor ${i + 1}`}</strong>
              <button className="adminRemoveBtn" onClick={() => remove(i)}>Remover</button>
            </div>
            <div className="adminForm">
              <label>Nome completo<input value={p.nome} onChange={e => update(i, "nome", e.target.value)} /></label>
              <label>Cargo / Título<input value={p.cargo} onChange={e => update(i, "cargo", e.target.value)} /></label>
              <label>URL da foto<input value={p.foto} onChange={e => update(i, "foto", e.target.value)} placeholder="/images/speakers/nome.jpg" /></label>
              <label>Biografia<textarea rows={3} value={p.bio} onChange={e => update(i, "bio", e.target.value)} /></label>
            </div>
          </div>
        ))}

        {d.lista.length === 0 && <p style={{ color: "#888", padding: "24px 0" }}>Nenhum preletor cadastrado. Clique em "+ Adicionar".</p>}
      </div>
    </div>
  );
}
