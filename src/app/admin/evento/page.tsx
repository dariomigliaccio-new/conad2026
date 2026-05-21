"use client";
import { useEffect, useState } from "react";

type Evento = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string };
const EMPTY: Evento = { titulo: "", subtitulo: "", descricao: "", data: "", cidade: "" };

export default function AdminEvento() {
  const [d, setD] = useState<Evento>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/evento").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/evento", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    setMsg(r.ok ? "✓ Salvo com sucesso!" : "✗ Erro ao salvar.");
    setSaving(false);
  }

  const f = (k: keyof Evento) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>O Evento</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Título principal<input value={d.titulo} onChange={f("titulo")} /></label>
          <label>Subtítulo / Tagline<input value={d.subtitulo} onChange={f("subtitulo")} /></label>
          <label>Descrição<textarea rows={5} value={d.descricao} onChange={f("descricao")} /></label>
          <label>Data do evento (ex: 15-17 de Agosto, 2026)<input value={d.data} onChange={f("data")} /></label>
          <label>Cidade / Local resumido<input value={d.cidade} onChange={f("cidade")} /></label>
        </div>
      </div>
    </div>
  );
}
