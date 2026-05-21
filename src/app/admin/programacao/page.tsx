"use client";
import { useEffect, useState } from "react";

type Sessao = { horario: string; titulo: string; preletor: string; local: string };
type Dia = { data: string; sessoes: Sessao[] };
type Data = { dias: Dia[] };
const newSessao = (): Sessao => ({ horario: "", titulo: "", preletor: "", local: "" });
const newDia = (): Dia => ({ data: "", sessoes: [newSessao()] });

export default function AdminProgramacao() {
  const [d, setD] = useState<Data>({ dias: [] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/programacao").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/programacao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  function updateDia(di: number, k: keyof Dia, v: string) {
    setD(p => { const dias = [...p.dias]; dias[di] = { ...dias[di], [k]: v }; return { dias }; });
  }

  function updateSessao(di: number, si: number, k: keyof Sessao, v: string) {
    setD(p => {
      const dias = [...p.dias];
      const sessoes = [...dias[di].sessoes];
      sessoes[si] = { ...sessoes[si], [k]: v };
      dias[di] = { ...dias[di], sessoes };
      return { dias };
    });
  }

  function addSessao(di: number) {
    setD(p => { const dias = [...p.dias]; dias[di] = { ...dias[di], sessoes: [...dias[di].sessoes, newSessao()] }; return { dias }; });
  }

  function removeSessao(di: number, si: number) {
    setD(p => { const dias = [...p.dias]; dias[di] = { ...dias[di], sessoes: dias[di].sessoes.filter((_, j) => j !== si) }; return { dias }; });
  }

  function removeDia(di: number) {
    setD(p => ({ dias: p.dias.filter((_, j) => j !== di) }));
  }

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Programação</h2></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="adminButton" style={{ background: "#fff", color: "#000", border: "1px solid #ccc" }} onClick={() => setD(p => ({ dias: [...p.dias, newDia()] }))}>+ Dia</button>
            <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        {d.dias.map((dia, di) => (
          <div key={di} className="adminListItem">
            <div className="adminListItemHeader">
              <strong>{dia.data || `Dia ${di + 1}`}</strong>
              <button className="adminRemoveBtn" onClick={() => removeDia(di)}>Remover dia</button>
            </div>
            <div className="adminForm" style={{ marginBottom: 12 }}>
              <label>Data (ex: 15 de Agosto)<input value={dia.data} onChange={e => updateDia(di, "data", e.target.value)} /></label>
            </div>

            {dia.sessoes.map((s, si) => (
              <div key={si} className="adminListItem" style={{ marginLeft: 16, marginBottom: 8, background: "#fafafa" }}>
                <div className="adminListItemHeader">
                  <strong style={{ fontSize: 13 }}>{s.horario ? `${s.horario} — ${s.titulo || "Sessão"}` : `Sessão ${si + 1}`}</strong>
                  <button className="adminRemoveBtn" onClick={() => removeSessao(di, si)}>×</button>
                </div>
                <div className="adminForm">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>Horário<input value={s.horario} onChange={e => updateSessao(di, si, "horario", e.target.value)} placeholder="09:00" /></label>
                    <label>Preletor (opcional)<input value={s.preletor} onChange={e => updateSessao(di, si, "preletor", e.target.value)} /></label>
                  </div>
                  <label>Título da sessão<input value={s.titulo} onChange={e => updateSessao(di, si, "titulo", e.target.value)} /></label>
                  <label>Local (opcional)<input value={s.local} onChange={e => updateSessao(di, si, "local", e.target.value)} placeholder="Auditório Principal" /></label>
                </div>
              </div>
            ))}
            <button className="adminButton" style={{ background: "#fff", color: "#000", border: "1px solid #ccc", marginTop: 8, fontSize: 12 }} onClick={() => addSessao(di)}>+ Adicionar sessão</button>
          </div>
        ))}

        {d.dias.length === 0 && <p style={{ color: "#888", padding: "24px 0" }}>Nenhum dia cadastrado. Clique em "+ Dia".</p>}
      </div>
    </div>
  );
}
