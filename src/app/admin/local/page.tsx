"use client";
import { useEffect, useState } from "react";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; maps_link: string; como_chegar: string; hospedagem: string };
const EMPTY: Local = { nome: "", endereco: "", cidade: "", estado: "", cep: "", descricao: "", maps_link: "", como_chegar: "", hospedagem: "" };

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
          <label>Endereço<input value={d.endereco} onChange={f("endereco")} /></label>
          <label>Cidade<input value={d.cidade} onChange={f("cidade")} /></label>
          <label>Estado (sigla)<input value={d.estado} onChange={f("estado")} /></label>
          <label>CEP<input value={d.cep} onChange={f("cep")} /></label>
          <label>Descrição<textarea rows={4} value={d.descricao} onChange={f("descricao")} /></label>
          <label>Link do Google Maps (URL embed)<input value={d.maps_link} onChange={f("maps_link")} placeholder="https://maps.google.com/embed?..." /></label>
          <label>Como chegar<textarea rows={4} value={d.como_chegar} onChange={f("como_chegar")} /></label>
          <label>Hospedagem<textarea rows={4} value={d.hospedagem} onChange={f("hospedagem")} /></label>
        </div>
      </div>
    </div>
  );
}
