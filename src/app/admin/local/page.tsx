"use client";
import { useEffect, useState } from "react";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; lat: string; lng: string; como_chegar: string; hospedagem: string };
const EMPTY: Local = { nome: "", endereco: "", cidade: "", estado: "", cep: "", descricao: "", lat: "", lng: "", como_chegar: "", hospedagem: "" };

export default function AdminLocal() {
  const [d, setD] = useState<Local>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/local").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    setMsg(r.ok ? "✓ Salvo com sucesso!" : "✗ Erro ao salvar.");
    setSaving(false);
  }

  const f = (k: keyof Local) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Local do Evento</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Nome do local<input value={d.nome} onChange={f("nome")} /></label>
          <label>Endereço completo<input value={d.endereco} onChange={f("endereco")} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px", gap: 12 }}>
            <label>Cidade<input value={d.cidade} onChange={f("cidade")} /></label>
            <label>Estado<input value={d.estado} onChange={f("estado")} /></label>
            <label>CEP<input value={d.cep} onChange={f("cep")} /></label>
          </div>
          <label>Descrição<textarea rows={3} value={d.descricao} onChange={f("descricao")} /></label>

          <div style={{ borderTop: "1px solid #e0e0e6", paddingTop: 16, marginTop: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>Mapa Mapbox</p>
            <small style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 10 }}>Cole as coordenadas do local. Para encontrá-las, acesse maps.google.com, clique no local e copie latitude e longitude.</small>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>Latitude (ex: -23.5505)<input value={d.lat} onChange={f("lat")} placeholder="-23.5505" /></label>
              <label>Longitude (ex: -46.6333)<input value={d.lng} onChange={f("lng")} placeholder="-46.6333" /></label>
            </div>
          </div>

          <label>Como chegar<textarea rows={4} value={d.como_chegar} onChange={f("como_chegar")} /></label>
          <label>Hospedagem<textarea rows={4} value={d.hospedagem} onChange={f("hospedagem")} /></label>
        </div>
      </div>
    </div>
  );
}
